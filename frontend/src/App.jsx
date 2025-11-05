import React, { useEffect, useMemo, useRef, useState } from 'react'
import { sendMessage } from './api.js'

function getOrCreateSessionId() {
	const existing = localStorage.getItem('fa_session_id')
	if (existing) return existing
	const sid = crypto.randomUUID()
	localStorage.setItem('fa_session_id', sid)
	return sid
}

export default function App() {
	const [messages, setMessages] = useState([])
	const [input, setInput] = useState('')
	const [loading, setLoading] = useState(false)
	const sessionId = useMemo(() => getOrCreateSessionId(), [])
	const scrollerRef = useRef(null)

	useEffect(() => {
		if (scrollerRef.current) {
			scrollerRef.current.scrollTop = scrollerRef.current.scrollHeight
		}
	}, [messages])

	async function onSend(e) {
		e.preventDefault()
		const text = input.trim()
		if (!text) return
		setInput('')
		setMessages((prev) => [...prev, { role: 'user', content: text }])
		setLoading(true)
		try {
			const res = await sendMessage({ session_id: sessionId, message: text })
			setMessages((prev) => [...prev, { role: 'assistant', content: res.answer }])
		} catch (err) {
			setMessages((prev) => [
				...prev,
				{ role: 'assistant', content: 'Sorry, something went wrong.' },
			])
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className="app">
			<header className="header">
				<h1>Fashion Assistant</h1>
			</header>
			<main className="chat">
				<div className="messages" ref={scrollerRef}>
					{messages.map((m, idx) => (
						<div key={idx} className={`message ${m.role}`}>
							<div className="bubble">{m.content}</div>
						</div>
					))}
					{loading && (
						<div className="message assistant">
							<div className="bubble">Thinking…</div>
						</div>
					)}
				</div>
				<form className="composer" onSubmit={onSend}>
					<input
						type="text"
						placeholder="Ask for outfit ideas, styles, occasions…"
						value={input}
						onChange={(e) => setInput(e.target.value)}
					/>
					<button type="submit" disabled={loading}>
						Send
					</button>
				</form>
			</main>
		</div>
	)
}

