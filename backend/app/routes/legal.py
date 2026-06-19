from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from app.database import SessionLocal
from app.models.legal_scenario import LegalScenario
from app.services.ai_service import generate_explanation
from app.security import verify_token
import re

router = APIRouter()
security = HTTPBearer()


# -------------------------
# Database Dependency
# -------------------------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# -------------------------
# Text Normalization
# -------------------------
def normalize_text(text: str):
    text = text.lower()

    # Synonym mapping
    synonyms = {
        "stolen": "theft",
        "steal": "theft",
        "stole": "theft",
        "robbed": "robbery",
        "cheated": "fraud",
        "scammed": "fraud",
        "harassed": "harassment",
        "beaten": "assault",
    }

    words = re.findall(r'\b\w+\b', text)

    normalized = []
    for word in words:
        if word in synonyms:
            normalized.append(synonyms[word])
        else:
            normalized.append(word)

    return normalized


# -------------------------
# Legal Advice Endpoint
# -------------------------
@router.post("/legal-advice")
def get_legal_advice(
    situation: str,
    db: Session = Depends(get_db),
    credentials: HTTPAuthorizationCredentials = Depends(security)
):

    current_user = verify_token(credentials)

    normalized_words = normalize_text(situation)
    situation_text = " ".join(normalized_words)

    stop_words = {"me", "my", "is", "the", "a", "an", "to", "and", "of", "in", "on", "at", "was"}
    filtered_words = [w for w in normalized_words if w not in stop_words and len(w) > 2]

    scenarios = db.query(LegalScenario).all()

    best_match = None
    highest_score = 0

    for scenario in scenarios:

        raw_keywords = scenario.keywords.replace(",", " ")
        scenario_keywords = [
            k.strip().lower()
            for k in raw_keywords.split()
            if len(k.strip()) > 2
        ]

        score = 0
        object_match = False

        for keyword in scenario_keywords:

            # Strong phrase match
            if keyword in situation_text:
                score += 4

            # Exact word match
            if keyword in filtered_words:
                score += 3

            # Object specificity boost
            if keyword in ["bag", "mobile", "car", "bike", "passport", "wallet"]:
                if keyword in filtered_words:
                    score += 5
                    object_match = True

        # Slight penalty if only generic crime word matched
        if score > 0 and not object_match:
            score -= 2

        if score > highest_score:
            highest_score = score
            best_match = scenario

    if best_match and highest_score > 0:

        ai_response = generate_explanation(
            best_match.title,
            best_match.legal_basis,
            best_match.rights_summary,
            best_match.authority
        )

        return {
            "matched_scenario": best_match.title,
            "confidence_score": highest_score,
            "legal_basis": best_match.legal_basis,
            "authority": best_match.authority,
            "structured_rights": best_match.rights_summary,
            "ai_explanation": ai_response,
            "disclaimer": "This is general legal information for India and not professional legal advice."
        }

    raise HTTPException(
        status_code=404,
        detail="No relevant legal scenario found. Try describing the situation more clearly."
    )