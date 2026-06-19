from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base

# Import models so tables are created
from app.models import user, legal_scenario

# Import routes
from app.routes import auth, legal

app = FastAPI()

# ---------------------------
# CORS configuration
# ---------------------------
origins = [
    "http://127.0.0.1:5500",  # your frontend
    "http://localhost:5500"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,      # allow these origins
    allow_credentials=True,
    allow_methods=["*"],        # allow all HTTP methods
    allow_headers=["*"],        # allow all headers
)

# Create tables
Base.metadata.create_all(bind=engine)

# Register routers
app.include_router(auth.router)
app.include_router(legal.router)

@app.get("/")
def root():
    return {"message": "Nyay Assist API is running"}