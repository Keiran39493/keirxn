from pydantic import BaseModel
from typing import List, Optional
from enum import Enum


class Category(str, Enum):
    CHILDREN_YOUTH = "children_youth_families"
    SENIOR_CITIZENS = "senior_citizens"
    EDUCATION = "education"
    SOCIAL_HEALTH = "social_health"
    ARTS_CULTURE = "arts_culture"
    ENVIRONMENT_CLIMATE = "environment_climate"
    SPORT_LEISURE = "sport_leisure"
    DEVELOPMENT = "development"


class LegalForm(str, Enum):
    ASSOCIATION = "association"
    FOUNDATION = "foundation"


class GeographicScope(str, Enum):
    LIECHTENSTEIN = "liechtenstein"
    DACH = "dach"
    INTERNATIONAL = "international"


class NGO(BaseModel):
    id: str
    name: str
    slug: str
    category: Category
    description: str
    legal_form: LegalForm
    geographic_scope: GeographicScope
    sdgs: List[int]
    founded_year: Optional[int] = None
    website: Optional[str] = None
    profile_url: str
    board_president: Optional[str] = None
    address: Optional[str] = None


class QuizAnswers(BaseModel):
    supporter_type: str
    sectors: List[str]
    engagement: List[str]
    support_scale: str
    geographic_focus: str
    sdg_priorities: List[int]
    org_maturity: str
    legal_form_preference: str


class MatchResult(BaseModel):
    ngo: NGO
    score: float
    match_percentage: int
    match_reasons: List[str]


