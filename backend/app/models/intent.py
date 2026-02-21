from pydantic import BaseModel
from typing import Literal


class PostInput(BaseModel):
    title: str
    content: str
    url: str
    platform: str
    author: str
    keyword: str
    min_intent_score: int = 7


class IntentAnalysis(BaseModel):
    intent_score: int
    buying_stage: Literal["awareness", "consideration", "decision", "purchase"]
    urgency: Literal["low", "medium", "high", "critical"]
    pain_points: list[str]
    recommended_action: str
    reasoning: str
    is_qualified: bool


class BatchPostInput(BaseModel):
    posts: list[PostInput]
    min_intent_score: int = 7
