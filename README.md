# Fashion Assistant (FastAPI + React + LangChain + Groq)

## Backend
- Python FastAPI app with LangChain memory-enabled agent using Groq (`langchain_groq`).
- Endpoint: `POST /api/chat` with JSON `{ session_id, message, user_profile? }`.

### Setup
1. Create and activate venv
```bash
python -m venv .venv
.venv\\Scripts\\activate
```
2. Install deps
```bash
pip install -r requirements.txt
```
3. Set environment variables (PowerShell)
```powershell
$env:GROQ_API_KEY = "<your_groq_api_key>"
$env:GROQ_MODEL = "llama-3.1-70b-versatile"
$env:GROQ_TEMPERATURE = "0.3"
```
4. Run server
```bash
uvicorn backend.app.main:app --reload --host 0.0.0.0 --port 8000
```

## Frontend
- Vite + React single-page chat UI.

### Setup
```bash
cd frontend
npm install
npm run dev
```
- Optional: change API base via `VITE_API_BASE` env (defaults to `http://localhost:8000/api`).

## Notes
- Memory is per `session_id` in-memory on the server (ephemeral). Persisted stores (Redis/Postgres) can be added later.
- Groq model defaults to `llama-3.1-70b-versatile`. Adjust via env.
