from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Dict, Any
import os
from dotenv import load_dotenv

load_dotenv()  # 读取 .env

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class CourseSpec(BaseModel):
    subject: str
    grade: str
    weeks: int
    goals: List[str]

@app.get("/health")
def health():
    return {"ok": True, "python": os.sys.version.split()[0]}

@app.post("/generate")
def generate(spec: CourseSpec) -> Dict[str, Any]:
    """
    MVP版：不调用模型，先返回“假数据”，用于验证后端与前端/工具链。
    """
    syllabus = {
        "course": {"subject": spec.subject, "grade": spec.grade, "weeks": spec.weeks},
        "goals": [{"id": f"G{i+1}", "text": g} for i, g in enumerate(spec.goals)],
        "units": [{"title": "Unit 1", "lessons": ["L1"]}],
    }
    lesson_plan = {
        "lesson_id": "L1",
        "time_minutes": 45,
        "objectives": [{"id": "O1", "text": "理解核心概念并能完成基础练习", "measurable": True}],
        "instructional_sequence": [
            {"phase": "引入", "steps": ["情境问题", "目标说明"]},
            {"phase": "建构", "steps": ["讲解示例", "同伴讨论"]},
            {"phase": "巩固", "steps": ["随堂小测2题"]},
        ],
        "differentiation": {"A": "挑战题", "B": "常规题", "C": "支架题"},
        "formative_assessment": [{"tool": "出门条", "items": [{"q": "今日1个要点", "target_objective": "O1"}]}],
    }
    text_summary = f"课程《{spec.subject}》{spec.grade}，共{spec.weeks}周；目标：{', '.join(spec.goals)}。"
    student_feedback = {
        "scores": {"clarity": 4.3, "engagement": 4.1},
        "difficulties": ["术语较多，需可视化支架", "练习与目标映射可再标注"],
        "suggestions": ["在建构环节加入操作演示", "每个目标配1题形成性评估"]
    }
    return {
        "plan": {
            "syllabus": syllabus,
            "lesson_plan": lesson_plan,
            "text_summary": text_summary
        },
        "feedback": student_feedback
    }
