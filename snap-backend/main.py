import os
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from routes.webhook import router as webhook_router
from routes.photos import router as photos_router
from routes.ai import router as ai_router

load_dotenv()
logging.basicConfig(level=logging.INFO)


@asynccontextmanager
async def lifespan(app: FastAPI):
    from services.bunq_startup import init_bunq
    webhook_url = os.getenv("WEBHOOK_URL")
    init_bunq(webhook_url)
    yield


app = FastAPI(title="$nap API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(webhook_router)
app.include_router(photos_router)
app.include_router(ai_router)

@app.get("/health")
def health():
    return {"status": "ok", "service": "snap-backend"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
