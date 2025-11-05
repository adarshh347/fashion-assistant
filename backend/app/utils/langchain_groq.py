import os
from langchain_core.language_models.base import BaseLanguageModel 
from dotenv import load_dotenv
from langchain_groq import ChatGroq


load_dotenv()


def get_groq_chat_llm(model_name: str ="llama3-8b-8192", temperature: float =0.7)->BaseLanguageModel:
	load_dotenv()
	api_key=os.environ.get("GROQ_API_KEY")

	if not api_key:
		print("--- ERROR: GROQ_API_KEY environment variable not set. ---")
		raise ValueError("GROQ_API_KEY not found. Please set it in your environment.")
	print(f"--- Initializing Groq LLM ({model_name}) ---")

	llm= ChatGroq(
		groq_api_key=api_key,
		model_name=model_name,
		temperature=temperature
	)

	return llm