from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routes.chat import router as chat_router

def create_app() -> FastAPI:
	app= FastAPI(title="Fashion Assistant API")
	app.add_middleware(
		CORSMiddleware,
		allow_origins=["*"],

	)