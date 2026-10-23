import sys
import os
import json

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if hasattr(sys.stdin, 'reconfigure'):
    sys.stdin.reconfigure(encoding='utf-8')

# Add project root (CodeLand) to sys.path so we can import ai.check_submit
root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
if root_dir not in sys.path:
    sys.path.insert(0, root_dir)

from ai.check_submit import simple_ai_judge

def main():
    try:
        raw_input = sys.stdin.read()
        if not raw_input.strip():
            print(json.dumps({
                "verdict": "Compilation Error",
                "failed_scenario": "Empty input provided",
                "feedback_ar": "لم يتم إرسال أي كود أو نص للمسألة."
            }, ensure_ascii=False))
            return

        input_data = json.loads(raw_input)
        problem_text = input_data.get("problem_text", "")
        student_code = input_data.get("student_code", "")

        result = simple_ai_judge(problem_text, student_code)
        print("__AI_JUDGE_RESULT__" + json.dumps(result, ensure_ascii=False))
    except Exception as e:
        error_result = {
            # judge_error marks a judge/infrastructure failure, not a fault in the student's code.
            "judge_error": True,
            "verdict": "Run Time Error",
            "failed_scenario": str(e),
            "feedback_ar": f"حدث خطأ أثناء فحص الكود: {str(e)}"
        }
        print("__AI_JUDGE_RESULT__" + json.dumps(error_result, ensure_ascii=False))

if __name__ == "__main__":
    main()
