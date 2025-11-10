import os
from langchain_core.language_models.base import BaseLanguageModel
from langchain_groq import ChatGroq
from dotenv import load_dotenv


def get_groq_chat_llm(model_name: str = "llama-3.1-8b-instant", temperature: float = 0.7) -> BaseLanguageModel:
    """
    Initializes and returns an instance of the ChatGroq LLM.

    Allows specifying model name and temperature.

    NOTE: Default model changed to llama3-70b-8192 as 8b was decommissioned.
    """
    load_dotenv()
    api_key = os.environ.get("GROQ_API_KEY")

    if not api_key:
        print("--- ERROR: GROQ_API_KEY environment variable not set. ---")
        raise ValueError("GROQ_API_KEY not found. Please set it in your environment.")

    print(f"--- Initializing Groq LLM ({model_name}) ---")

    llm = ChatGroq(
        groq_api_key=api_key,
        model_name=model_name,
        temperature=temperature
    )

    return llm