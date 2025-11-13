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

# the profiler node- the node analyses the messages to update the user profile
   async def _profiler_node(self, state:AgentState):
       messages = state["messages"]
       current_profile = state.get("user_profile",{})

       # we only analyse last few messages to save tokens
       recent_conversation = messages[-3:]
       # create a specialised llm that forces "userprofile" output
       structured_llm = self.llm.with_structured_output(UserProfile)

       extractor_prompt = ChatPromptTemplate.from_messages([
           ("system", "You are an expert data analyst. Extract user fashion preferences from the conversation. "
                      "Update the profile only if new info is found. If nothing new, leave fields empty."),
           ("placeholder", "{messages}")
       ])

       # run the extraction chain
       chain= extractor_prompt | structured_llm
       extracted_data:UserProfile = await chain.ainvoke({"messages": recent_conversation})

       updated_profile = current_profile.copy()

       if extracted_data.name:
           updated_profile["name"] = extracted_data.name
       if extracted_data.budget_tier:
           updated_profile["budget_tier"] = extracted_data.budget_tier
       for key in ["style_keywords", "clothing_types_liked", "colors"]:
           new_items = getattr(extracted_data, key)
           if new_items:
               existing = set(updated_profile.get(key, []))
               existing.update(new_items)
               updated_profile[key] = list(existing)

       print(f"--- 🕵️ Profiler Update: {updated_profile} ---")
       return {"user_profile": updated_profile}

   async def respond(self, session_id: str, message: str) -> tuple[str, dict]:
       """
       Main entry point for the API.
       """
       # 1. Load or Initialize Session State
       if session_id not in self._sessions:
           self._sessions[session_id] = {
               "messages": [],
               "user_profile": {}
           }

       current_state = self._sessions[session_id]

       # 2. Add the user's new message to the state
       current_state["messages"].append(HumanMessage(content=message))

       # 3. Run the Graph!
       # The graph handles the flow: Chatbot -> Profiler -> End
       final_state = await self.graph.ainvoke(current_state)

       # 4. Save the updated state back to memory
       self._sessions[session_id] = final_state

       # 5. Return the chatbot's response (the last message)
       bot_response = final_state["messages"][-1].content
       return bot_response, {"session_id": session_id}

       





























































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