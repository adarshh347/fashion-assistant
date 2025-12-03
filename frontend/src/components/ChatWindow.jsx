import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Send, Camera, Image as ImageIcon, Sparkles, Loader2 } from 'lucide-react';

const ChatWindow = ({ onClose }) => {
    const [messages, setMessages] = useState([
        { id: 1, role: 'assistant', text: 'Hello! I am your Fashion Assistant. Show me an outfit or ask for advice.', model: 'GPT OSS' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    const handleImageSelect = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSend = async () => {
        if ((!input.trim() && !selectedImage) || isLoading) return;

        const currentInput = input;
        const currentImage = selectedImage;
        const currentImagePreview = imagePreview;

        // Reset input state immediately
        setInput('');
        setSelectedImage(null);
        setImagePreview(null);

        // Add user message to UI
        const newMsg = {
            id: Date.now(),
            role: 'user',
            text: currentInput,
            image: currentImagePreview
        };
        setMessages(prev => [...prev, newMsg]);
        setIsLoading(true);

        try {
            // Prepare FormData
            const formData = new FormData();
            formData.append('session_id', 'user-session-1');
            formData.append('message', currentInput || (currentImage ? "Please analyze this outfit and give me styling advice." : ""));
            if (currentImage) {
                formData.append('image', currentImage);
            }

            console.log('📤 Sending request to backend...');
            console.log('Has image:', !!currentImage);

            // API Call
            const response = await fetch('http://localhost:8005/api/chat', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ API Error:', errorText);
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }

            const data = await response.json();
            console.log('✅ Response received:', data);

            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                role: 'assistant',
                text: data.answer,
                model: data.model_used || (currentImage ? 'Llama 4 Maverik' : 'GPT OSS')
            }]);

        } catch (error) {
            console.error("❌ Error sending message:", error);
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                role: 'assistant',
                text: `Sorry, I encountered an error: ${error.message}. Please check the console for details.`,
                model: 'System'
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 bg-[#1c1c1e] flex flex-col"
        >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-[#1c1c1e]/80 backdrop-blur-md z-10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <Sparkles size={20} className="text-white" />
                    </div>
                    <div>
                        <h2 className="text-white font-semibold text-lg">Fashion Assistant</h2>
                        <p className="text-xs text-gray-400 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            Online
                        </p>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                >
                    <X size={28} />
                </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div className={`max-w-[85%] md:max-w-[70%] rounded-2xl p-4 shadow-md ${msg.role === 'user'
                                ? 'bg-blue-600 text-white rounded-br-none'
                                : 'bg-[#2c2c2e] text-gray-100 rounded-bl-none border border-white/5'
                            }`}>
                            {msg.image && (
                                <img src={msg.image} alt="User upload" className="w-full rounded-lg mb-3 border border-white/10" />
                            )}
                            {msg.text && <p className="text-base leading-relaxed whitespace-pre-wrap">{msg.text}</p>}
                            {msg.role === 'assistant' && (
                                <div className="mt-2 text-[10px] uppercase tracking-wider text-gray-500 font-medium flex items-center gap-1">
                                    <Sparkles size={10} />
                                    Generated by {msg.model}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-[#2c2c2e] rounded-2xl rounded-bl-none p-4 border border-white/5 flex items-center gap-3">
                            <Loader2 className="animate-spin text-blue-500" size={20} />
                            <span className="text-gray-400 text-sm">Thinking...</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-[#1c1c1e] border-t border-white/10">
                {imagePreview && (
                    <div className="mb-4 relative inline-block">
                        <img src={imagePreview} alt="Preview" className="h-20 rounded-lg border border-white/20" />
                        <button
                            onClick={() => { setSelectedImage(null); setImagePreview(null); }}
                            className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 text-white shadow-md hover:bg-red-600 transition-colors"
                        >
                            <X size={12} />
                        </button>
                    </div>
                )}

                <div className="flex items-end gap-2 bg-[#2c2c2e] p-2 rounded-3xl border border-white/10 shadow-lg">
                    <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleImageSelect}
                    />
                    <button
                        className="p-3 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                        onClick={() => fileInputRef.current?.click()}
                        title="Upload from camera"
                    >
                        <Camera size={24} />
                    </button>
                    <button
                        className="p-3 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                        onClick={() => fileInputRef.current?.click()}
                        title="Upload image"
                    >
                        <ImageIcon size={24} />
                    </button>
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSend();
                            }
                        }}
                        placeholder="Type a message..."
                        className="flex-1 bg-transparent text-white placeholder-gray-500 p-3 max-h-32 resize-none focus:outline-none scrollbar-hide text-base"
                        rows={1}
                    />
                    <button
                        onClick={handleSend}
                        disabled={(!input.trim() && !selectedImage) || isLoading}
                        className="p-3 rounded-full bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-blue-600/20"
                    >
                        <Send size={20} />
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default ChatWindow;
