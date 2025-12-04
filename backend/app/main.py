from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routes.chat import router as chat_router
from .routers.try_on import router as try_on_router

def create_app() -> FastAPI:
	app= FastAPI(title="Fashion Assistant API")
	app.add_middleware(
		CORSMiddleware,
		allow_origins=["*"],
		allow_credentials=True,
		allow_methods=["*"],
		allow_headers=["*"],
	)

	app.include_router(chat_router, prefix="/api")
	app.include_router(try_on_router)
	@app.get("/", tags=["Root"])
	async def read_root():
		return {"message":"Welcome to fashion assistant API!"}
	return app

app=create_app()