from typing import Annotated, Sequence, TypedDict, Literal, List, Dict, Any, Optional
import operator
import base64
import os
import sys
import json
import warnings
import concurrent.futures
from io import BytesIO
from PIL import Image

warnings.filterwarnings("ignore")
os.environ["PYTHONWARNINGS"] = "ignore"

from langchain_core.messages import RemoveMessage, BaseMessage, HumanMessage, AIMessage, ToolMessage, SystemMessage
from langchain_core.tools import tool
from langgraph.graph.message import add_messages
from langgraph.graph import StateGraph, END, START, MessagesState
from langgraph.prebuilt import ToolNode
from langgraph.types import Send
from langchain_google_genai import ChatGoogleGenerativeAI, Modality
from langchain_core.runnables import Runnable
from pydantic import BaseModel, Field

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if hasattr(sys.stdin, 'reconfigure'):
    sys.stdin.reconfigure(encoding='utf-8')

# The key lives in backend/.env (GEMINI_API_KEY) and is passed in by the backend; never hardcode it.
API_KEY = os.environ.get("GEMINI_API_KEY")
if not API_KEY:
    raise RuntimeError("GEMINI_API_KEY is not set. Add it to backend/.env and restart the backend.")

# gemini-2.5-flash was retired for new keys (404 NOT_FOUND); the API recommends gemini-3.8-flash.
TEXT_MODEL = os.environ.get("GEMINI_TEXT_MODEL", "models/gemini-2.5-flash")
IMAGE_MODEL = os.environ.get("GEMINI_IMAGE_MODEL", "models/gemini-2.5-flash-image")

llm = ChatGoogleGenerativeAI(
    model=TEXT_MODEL,
    google_api_key=API_KEY,
    temperature=0.7
)

image_model = ChatGoogleGenerativeAI(
    model=IMAGE_MODEL,
    google_api_key=API_KEY,
    response_modalities=[Modality.IMAGE],
)

XP_PROGRESSION = [25, 50, 75, 100, 125, 150]

DEFAULT_LEVELS = ["Very Easy", "Easy", "Easy-Medium", "Medium", "Medium-Hard", "Hard"]

# When false (set by the backend runner) images are only returned as data URLs
# and never written into frontend/public, so regenerating never overwrites
# the illustration of another problem.
WRITE_IMAGE_FILES = os.environ.get("CONTEST_WRITE_IMAGE_FILES", "1") != "0"

class State(MessagesState):
    description: str 
    problems_level: List[str]
    problem_index: int
    problems_details: Annotated[List[Dict[str, Any]], operator.add]
    generated_briefs: List[dict]

class ProblemBrief(BaseModel):
    index: int = Field(description="The problem index from 0 to 5")
    level: str = Field(description="The difficulty level assigned to this problem")
    story_part: str = Field(description="The part of the cohesive sequential story dedicated to this problem")
    core_idea: str = Field(description="The specific algorithmic concept mapped strictly to this index (Index 0: Basic Math/Comparison, Index 1: Easy STL, Index 2: Easy Greedy/Implementation, Index 3-4: Binary Search/Two Pointers/Number Theory, Index 5: Standard DP/Graph/Bitmask/SegTree)")

class StoryGenerationOutput(BaseModel):
    problems_briefs: List[ProblemBrief] = Field(description="A list containing exactly 6 interconnected problem briefs")

def story_generator_node(state: State):
    description = state["description"]
    problems_level = state["problems_level"] 
    
    system_prompt = """
    You are an expert competitive programming problem setter.
    Your task is to take a general description and break it down into **6 interconnected, sequential parts forming a single cohesive story**.
    
    CRITICAL: You must strictly assign the core algorithmic idea for each problem based on its index (from 0 to 5) to match a perfect competitive programming learning curve:
    - Index 0: Very Easy. Focus on basic math, arithmetic operations, or simple comparisons.
    - Index 1: Easy. Focus on basic STL usage (like simple arrays, vectors, or sorting).
    - Index 2: Easy-Medium. Focus on easy Greedy or simple Implementation logic.
    - Index 3: Medium. Focus on Binary Search or Two Pointers.
    - Index 4: Medium. Focus on Easy Number Theory or constructive logic.
    - Index 5: Hard/Advanced. Focus on Standard DP, Graphs, Bitmask, or Segment Tree.
    
    Make sure to return exactly 6 problems ordered from index 0 to 5.
    """
    
    structured_llm = llm.with_structured_output(StoryGenerationOutput)
    
    prompt = f"""
    General Description / Project Story: {description}
    Required Difficulty Levels for the 6 Problems (in order): {problems_level}
    
    Generate the 6 interconnected programming briefs following the strict algorithmic progression for each index.
    """
    
    response = structured_llm.invoke([
        SystemMessage(content=system_prompt),
        HumanMessage(content=prompt)
    ])
    
    return {
        "messages": [HumanMessage(content="Successfully generated the 6-part story briefs with strict algorithmic progression.")],
        "generated_briefs": [brief.model_dump() for brief in response.problems_briefs]
    }

def trigger_workers(state: State):
    return [
        Send("worker_node", {
            "problem_index": brief["index"],
            "level": brief["level"],
            "story_part": brief["story_part"],
            "core_idea": brief["core_idea"]
        })
        for brief in state["generated_briefs"]
    ]

def save_image_from_response(ai_message, output_filename: str):
    """Saves image to disk (when enabled) and returns (saved_path, data_url)"""
    try:
        for block in ai_message.content:
            if isinstance(block, dict) and block.get("image_url"):
                data_url = block["image_url"].get("url", "")
                base64_data = data_url.split(",")[1] if "," in data_url else data_url
                image_bytes = base64.b64decode(base64_data)
                img = Image.open(BytesIO(image_bytes))
                mime_type = Image.MIME.get(img.format or "", "image/png")
                formatted_data_url = f"data:{mime_type};base64,{base64_data}"

                if not WRITE_IMAGE_FILES:
                    return None, formatted_data_url

                os.makedirs(os.path.dirname(os.path.abspath(output_filename)), exist_ok=True)
                img.save(output_filename)
                return output_filename, formatted_data_url
    except Exception as e:
        print(f"Error saving image: {e}", file=sys.stderr)
    return None, None

class ProblemExample(BaseModel):
    input: str = Field(description="Exact stdin text for this example.")
    output: str = Field(description="Exact expected stdout text for this example.")
    explanation: str = Field(description="Short explanation of why this output is correct (may be empty).")

class ProblemDetailOutput(BaseModel):
    title: str = Field(description="A short, catchy problem title (e.g., A. Sharing Apples)")
    time_limit: str = Field(description="Time limit per test, e.g., '1.0 second'")
    memory_limit: str = Field(description="Memory limit per test, e.g., '64 megabytes'")
    problem_story: str = Field(description="The narrative or story introducing the problem context in simple English.")
    input_spec: str = Field(description="Precise description of the input format.")
    output_spec: str = Field(description="Precise description of the output format.")
    constraints: List[str] = Field(description="Every numeric/format constraint as its own item, e.g. '1 <= n <= 10^5'. Plain text, no LaTeX.")
    examples: List[ProblemExample] = Field(description="Between 1 and 3 examples. Each input must produce exactly the given output.")
    note: str = Field(description="An optional note explaining the examples.")
    hint: str = Field(
        description="A single strategic hint that solves approximately 50% of the problem. Give the key observation or the first algorithmic step without revealing the full solution."
    )
    can_be_explained_by_diagrams: bool = Field(
        description="True if the problem logic, example, or algorithm (e.g., sorting, grids, paths, pointers, sets) can be visually explained step-by-step using diagrams. False if it is purely abstract or too simple."
    )
    image_generation_prompt: str = Field(
        description="Detailed English prompt for an AI image generator. If can_be_explained_by_diagrams is True, describe a single image split into a 2x2 grid (4 panels: 2 on top, 2 on bottom) visually explaining the problem/algorithm steps. If False, describe a single vibrant illustration capturing the problem's story."
    )

def worker_node(state_slice):
    idx = state_slice["problem_index"]
    level = state_slice["level"]
    story_part = state_slice["story_part"]
    core_idea = state_slice["core_idea"]
    
    system_prompt = """
    You are an expert competitive programming problem setter (Codeforces style).
    Your task is to turn a story part and a core algorithmic idea into a classic competitive programming problem statement tailored for beginners.
    
    CRITICAL REQUIREMENTS:
    1. Write plain, clean text only (no weird escape sequences like \\b or \\t, no LaTeX).
    1b. List every constraint separately in `constraints`, and give 1 to 3 `examples` whose outputs are exactly correct.
    2. HINT: Provide exactly ONE hint that gets the student halfway to the solution (~50% of the logic/observation) without giving away the full answer or code.
    3. VISUAL EXPLANATION & IMAGE PROMPT:
       - Evaluate if the problem or its example can be visually explained through diagrams/steps (`can_be_explained_by_diagrams` = True/False).
       - If True: Write `image_generation_prompt` instructing the image generator to create ONE single image divided into a 2x2 grid (4 distinct panels: two on the top row, two on the bottom row) that visually illustrates the steps or mechanics of the problem clearly.
       - If False: Write `image_generation_prompt` instructing the image generator to create ONE single vibrant, high-quality digital illustration representing the story and context of the problem.
    """
    
    structured_llm = llm.with_structured_output(ProblemDetailOutput)
    
    prompt = f"""
    Problem Index: {idx}
    Difficulty Level: {level}
    Story Context Part: {story_part}
    Core Programming Idea: {core_idea}
    
    Generate the complete problem statement, the 50% hint, and the appropriate image prompt.
    """
    
    response = structured_llm.invoke([
        SystemMessage(content=system_prompt),
        HumanMessage(content=prompt)
    ])
    
    if response.can_be_explained_by_diagrams:
        final_image_prompt = (
            f"Create a single image arranged as a 2x2 grid collage (exactly 4 panels: 2 panels on the top row and 2 panels on the bottom row). "
            f"Style: Clean educational illustration and visual diagram. "
            f"Content to illustrate across the 4 panels: {response.image_generation_prompt}"
        )
    else:
        final_image_prompt = (
            f"Create a single vibrant, unified digital illustration (1 panel only, no grid) capturing this scene: "
            f"{response.image_generation_prompt}"
        )
        
    # Output file paths for frontend and fallback
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.abspath(os.path.join(script_dir, ".."))
    public_img_dir = os.path.join(project_root, "frontend", "public", "generated_contest")
    image_filename = os.path.join(public_img_dir, f"problem_{idx}_image.png")
    
    saved_path = None
    data_url = None
    image_error = ""
    try:
        with concurrent.futures.ThreadPoolExecutor(max_workers=1) as executor:
            future = executor.submit(image_model.invoke, final_image_prompt)
            img_response = future.result(timeout=25)
            saved_path, data_url = save_image_from_response(img_response, image_filename)
            if not data_url:
                image_error = "The image model returned no image."
    except Exception as e:
        saved_path = None
        data_url = None
        # Keep the reason so the admin can see why the illustration is missing.
        image_error = (str(e) or type(e).__name__)[:300]

    examples = [ex.model_dump() for ex in response.examples if ex.input.strip() or ex.output.strip()]
    if not examples:
        raise ValueError(f"Problem {idx} was generated without any examples")
    constraints = [c.strip() for c in response.constraints if c and c.strip()]

    examples_text = "\n\n".join(
        f"Input:\n{ex['input']}\n\nOutput:\n{ex['output']}" for ex in examples
    )
    constraints_text = "\n".join(f"- {c}" for c in constraints) or "N/A"

    formatted_problem = f"""
{response.title}
time limit per test: {response.time_limit}
memory limit per test: {response.memory_limit}

{response.problem_story}

Input
{response.input_spec}

Output
{response.output_spec}

Constraints
{constraints_text}

Examples
{examples_text}

Note:
{response.note or 'N/A'}

Hint (50% Solution):
{response.hint}
    """.strip()

    base_xp = XP_PROGRESSION[idx] if idx < len(XP_PROGRESSION) else 100
    
    # Clean relative image path for frontend access
    relative_img_path = f"/generated_contest/problem_{idx}_image.png" if saved_path else ""

    difficulty_colors = {
        0: "#34d399", # Green
        1: "#38bdf8", # Blue
        2: "#818cf8", # Indigo
        3: "#c084fc", # Purple
        4: "#f472b6", # Pink
        5: "#fbbf24", # Amber / Gold
    }

    return {
        "problems_details": [{
            "id": f"chapter-{idx + 1}",
            "index": idx,
            "chapterNumber": idx + 1,
            "title": response.title,
            "arabicTitle": f"القطاع {idx + 1}: {response.title}",
            "level": level,
            "difficulty": level,
            "difficultyColor": difficulty_colors.get(idx, "#38bdf8"),
            "baseXp": base_xp,
            "basePoints": base_xp,
            "xp": base_xp,
            "timeLimit": response.time_limit,
            "memoryLimit": response.memory_limit,
            "problemStory": response.problem_story,
            "lore": response.problem_story,
            "taskDescription": f"{response.problem_story}\n\n**Input Specification:**\n{response.input_spec}\n\n**Output Specification:**\n{response.output_spec}",
            "inputSpec": response.input_spec,
            "outputSpec": response.output_spec,
            "examples": examples,
            "exampleInput": examples[0]["input"],
            "exampleOutput": examples[0]["output"],
            "note": response.note or "",
            "hint": response.hint,
            "constraints": constraints,
            "storyPart": story_part,
            "coreIdea": core_idea,
            "canBeExplainedByDiagrams": response.can_be_explained_by_diagrams,
            "imagePrompt": final_image_prompt,
            "imagePath": relative_img_path or saved_path,
            "imageUrl": data_url or relative_img_path or "",
            "imageError": image_error,
            "formattedProblem": formatted_problem,
            # Problems are judged on stdin/stdout, so every starter reads stdin and prints.
            "starterCode": {
                "javascript": f"// Sector {idx + 1}: {response.title}\n// Read from stdin and print the answer with console.log\nconst data = require(\"fs\").readFileSync(0, \"utf8\").trim().split(/\\s+/);\n\n// Your algorithm here\n",
                "python": f"# Sector {idx + 1}: {response.title}\nimport sys\n\ndef main():\n    data = sys.stdin.read().split()\n    # Your algorithm here\n\nif __name__ == \"__main__\":\n    main()\n",
                "cpp": f"// Sector {idx + 1}: {response.title}\n#include <iostream>\n#include <string>\nusing namespace std;\n\nint main() {{\n    // Your algorithm here\n    return 0;\n}}"
            },
            "sampleTests": [
                {
                    "input": ex["input"],
                    "expected": ex["output"],
                    "explanation": ex["explanation"] or response.note or "Standard sample demonstration"
                }
                for ex in examples
            ]
        }]
    }

def build_contest_app():
    workflow = StateGraph(State)
    workflow.add_node("story_generator", story_generator_node)
    workflow.add_node("worker_node", worker_node)
    workflow.add_edge(START, "story_generator")
    workflow.add_conditional_edges("story_generator", trigger_workers, ["worker_node"])
    workflow.add_edge("worker_node", END)
    return workflow.compile()

def generate_contest(description: str, problems_level: List[str] = None) -> Dict[str, Any]:
    if not problems_level:
        problems_level = DEFAULT_LEVELS

    app = build_contest_app()
    initial_state = {
        "description": description,
        "problems_level": problems_level
    }
    
    result = app.invoke(initial_state)
    sorted_problems = sorted(result["problems_details"], key=lambda x: x["index"])
    
    total_xp = sum(p["baseXp"] for p in sorted_problems)
    
    contest_data = {
        "title": "CodeLand Sunday Championship Arena",
        "subtitle": "AI-Generated Algorithmic Story Contest",
        "description": description,
        "lore": description,
        "totalPrizeXp": total_xp,
        "problems": sorted_problems,
        "chapters": sorted_problems,
        "generatedAt": os.environ.get("CONTEST_GENERATED_AT", "")
    }
    
    return contest_data

def main():
    try:
        raw_input = sys.stdin.read()
        data = json.loads(raw_input) if raw_input.strip() else {}
        desc = data.get("description", "")
        if not raw_input.strip():
            desc = "A story about a little girl who wants to go to her grandmother's house through the apple orchards, only to encounter a wolf along the way."
        elif not desc:
            desc = "An epic competitive programming story exploration across ancient digital ruins."

        contest = generate_contest(desc)
        print("__CONTEST_RESULT__" + json.dumps(contest, ensure_ascii=False))
    except Exception as e:
        error_res = {
            "error": str(e),
            "status": "failed"
        }
        print("__CONTEST_RESULT__" + json.dumps(error_res, ensure_ascii=False), file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
