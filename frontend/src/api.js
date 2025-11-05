const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000/api'

export async function sendMessage(body) {
	const res = await fetch(`${API_BASE}/chat`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body),
	})
	if (!res.ok) {
		throw new Error(`HTTP ${res.status}`)
	}
	return await res.json()
}

