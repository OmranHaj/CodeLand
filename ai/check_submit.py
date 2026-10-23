from typing import Annotated, Sequence, TypedDict, Literal, List , Dict , Any , operator
from langchain_core.messages import RemoveMessage, BaseMessage, HumanMessage, AIMessage, ToolMessage, SystemMessage
from langchain_core.tools import tool
from langgraph.graph.message import add_messages
from langgraph.graph import StateGraph, END, START, MessagesState
from langgraph.prebuilt import ToolNode
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.runnables import Runnable
from pydantic import BaseModel, Field
import os

# 1. إضافة "Compilation Error" إلى الـ Literal
class SimpleSubmissionResult(BaseModel):
    verdict: Literal["Accepted", "Wrong Answer", "Time Limit Exceeded", "Memory Limit Exceeded", "Run Time Error", "Compilation Error"] = Field(
        description="النتيجة النهائية لتقييم كود الطالب"
    )
    failed_scenario: str = Field(
        description="إذا كان الحل خاطئاً أو فيه خطأ ترجمة، اكتب وصفاً للخطأ أو المدخلات. وإذا كان Accepted اكتب 'None'"
    )
    feedback_ar: str = Field(
        description="شرح بسيط ومختصر باللغة العربية للطالب يوضح سبب النتيجة أو مكان خطأ الترجمة بدون إعطائه الكود الصحيح"
    )

# 2. دالة التقييم بعد التعديل
def simple_ai_judge(problem_text: str, student_code: str) -> dict:
    judge_llm = ChatGoogleGenerativeAI(
        # The previous hardcoded key was revoked by Google as leaked (403); set GEMINI_API_KEY instead.
        model=os.environ.get("GEMINI_TEXT_MODEL", "models/gemini-3.8-flash"),
        google_api_key=os.environ.get("GEMINI_API_KEY"),
        temperature=0.1
    ).with_structured_output(SimpleSubmissionResult)
    
    system_prompt = """
    You are an automated Competitive Programming Judge.
    You will receive a Problem Statement and a Student's Code submission (in Python, C++, etc.).
    
    CRITICAL INSTRUCTION - STEP 1 (COMPILATION CHECK):
    Before doing anything else, inspect every single line of the student's code strictly for syntax errors. 
    Look for:
    - Stray characters or illegal punctuation (e.g., a comma `,` at the very end of a function block or after main(), like `int main() { ... },`).
    - Missing semicolons `;`, unmatched brackets `{ }` or `( )`.
    - Typos in keywords or undefined syntax.
    If you find ANY syntax error, you MUST immediately return verdict 'Compilation Error' with a description of the syntax error in 'failed_scenario' and 'feedback_ar', and stop further analysis. Do NOT try to bypass or ignore syntax mistakes.

    Other steps (only if syntax is valid):
    2. Check for runtime errors like division by zero, out-of-bounds array access, or unhandled exceptions -> Return 'Run Time Error'.
    3. Analyze Time Complexity (Big-O) against constraints -> If too slow or infinite loop, return 'Time Limit Exceeded'.
    4. Analyze Space Complexity -> If memory limit exceeded, return 'Memory Limit Exceeded'.
    5. Trace logic with sample inputs/edge cases -> If incorrect, return 'Wrong Answer'.
    6. If all checks pass -> Return 'Accepted'.
    """
    
    user_prompt = f"""
    === PROBLEM STATEMENT ===
    {problem_text}
    
    === STUDENT CODE ===
    {student_code}
    """
    
    response = judge_llm.invoke([
        SystemMessage(content=system_prompt),
        HumanMessage(content=user_prompt)
    ])
    
    return response.model_dump()
