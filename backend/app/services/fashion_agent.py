from __future__ import annotations
from typing import Annotated, TypedDict, Dict, Any, List

from langgraph.graph import StateGraph, END
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage, BaseMessage
from langchain_core.prompts import ChatPromptTemplate
from ..utils.langchain_groq import get_groq_chat_llm
from ..models import UserProfile

# defining state
# below one is the memory that will be passed between the nodes in the graph
class AgentState(TypedDict):
   messages: List[BaseMessage]
   user_profile: Dict[str,Any]

class FashionAgent:
   def __init__(self):
      self._sessions: Dict[str, AgentState] = {}   #in memory storage temporarily
      self.llm = get_groq_chat_llm()

      self.graph = self._build_graph()

   def _build_graph(self):


#       constructs the langgraph workflow
      workflow=StateGraph(AgentState)
      # define workers(nodes)
      workflow.add_node("chatbot", self._chatbot_node)
      workflow.add_node("profiler", self._profiler_node)

#       define edges(logic)
      workflow.set_entry_point("chatbot")

      workflow.add_edge("chatbot", "profiler")

      workflow.add_edge("profiler",END)

      return workflow.compile()

   async def _chatbot_node(self, state: AgentState):
      messages = state["messages"]
      user_profile = state.get("user_profile",{})
      profile_text = "\n".join([f"- {k}: {v}" for k, v in user_profile.items() if v])
      system_prompt = (
         "You are a friendly fashion assistant. "
         "Use the user's profile to personalize your advice.\n"
         f"--- USER PROFILE ---\n{profile_text}\n--------------------"
      )
      # combine system prompt + converstation history
      prompt_messages = [SystemMessage(content=system_prompt)] + messages
      # llm calling
      response = await self.llm.ainvoke(prompt_messages)
      return {"messages": [response]}

#    complete the fashion_agent























































# langchain





# from __future__ import annotations
# from typing import Dict, Tuple, Any
#
# from langchain.chains import LLMChain
# from langchain.memory import ConversationBufferMemory
# from langchain.prompts import PromptTemplate
# from ..utils.langchain_groq import get_groq_chat_llm
# import json
#
# CHAT_SYSTEM_PROMPT=(
#     "You are a friendly, concise fashion assistant. "
#     "Personalize suggestions by remembering preferences across the conversation."
# )
#
# class FashionAgent:
#     def __init__(self)->None:
#        # --- FIX IS HERE ---
#        # Initialized with an underscore to match the rest of the class
#        self._sessions: Dict[str, Dict[str,Any]]={}
#     #     A simple Python dictionary running inside the uvicorn process.
#
#     def _get_profile_as_string(self, user_profile: Dict[str,Any])->str:
#        if not user_profile:
#           return "no preferences known yet"
#        return "\n".join(f"- {key}: {', '.join(value) if isinstance(value, list) else value}"
#                     for key, value in user_profile.items())
#
#
#
#     def _ensure_session(self, session_id: str) -> Dict[str, Any]:
#        """
#         Creates or retrieves a session, which now contains
#         the chat_chain and a user_profile.
#         """
#        # This code is now correct because self._sessions exists
#        if session_id in self._sessions:
#           return self._sessions[session_id]
#
#        print(f"--- Creating new session: {session_id} ---")
#
#        # --- 1. Create the Main Chat Chain ---
#        chat_memory = ConversationBufferMemory(
#           memory_key="history",
#           return_messages=False,
#           input_key="input"
#        )
#
#        chat_prompt = PromptTemplate(
#           # We add 'user_profile' as a new input variable
#           input_variables=["system", "user_profile", "history", "input"],
#           template=(
#              "{system}\n\n"
#              "--- CURRENT USER PREFERENCES ---:\n"
#              "{user_profile}\n"
#              "--- END PREFERENCES ---\n\n"
#              "Conversation so far:\n{history}\n\n"
#              "User: {input}\nAssistant:"
#           ),
#        )
#
#        chat_llm = get_groq_chat_llm()  # Uses default model
#
#        chat_chain = LLMChain(
#           llm=chat_llm,
#           prompt=chat_prompt,
#           memory=chat_memory,
#           verbose=True
#        )
#
#        # --- 2. Create the User Profile ---
#        user_profile: Dict[str, Any] = {}  # Starts empty
#
#        # --- 3. Store everything for this session ---
#        # This code is also now correct
#        self._sessions[session_id] = {
#           "chat_chain": chat_chain,
#           "user_profile": user_profile
#           # We will add the "profile_chain" here in our next step
#        }
#
#        return self._sessions[session_id]
#
#
#     async def respond(self,session_id:str, message:str)->Tuple[str,dict]:
#        session_data=self._ensure_session(session_id)
#        chat_chain=session_data["chat_chain"]
#        user_profile = session_data["user_profile"]
#
#        profile_string = self._get_profile_as_string(user_profile)
#
#        answer: str= await chat_chain.apredict(
#           system=CHAT_SYSTEM_PROMPT,
#           user_profile=profile_string,
#           input=message
#        )
#        print(f"--- Would update profile for session {session_id} based on: '{message}' ---")
#        return answer, {"session_id" : session_id}