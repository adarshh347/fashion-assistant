import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Sparkles, Wand2, Loader2, X, Download, RefreshCw, Shirt } from 'lucide-react';

const VirtualTryOn = ({ onClose }) => {
    const [humanImage, setHumanImage] = useState(null);
    const [humanPreview, setHumanPreview] = useState(null);
    const [garmentImage, setGarmentImage] = useState(null);
    const [garmentPreview, setGarmentPreview] = useState(null);
    const [prompt, setPrompt] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [resultImage, setResultImage] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

    const humanInputRef = useRef(null);
    const garmentInputRef = useRef(null);

    const handleHumanSelect = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setHumanImage(file);
            const reader = new FileReader();
            reader.onloadend = () => setHumanPreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleGarmentSelect = async (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setGarmentImage(file);
            const reader = new FileReader();
            reader.onloadend = () => setGarmentPreview(reader.result);
            reader.readAsDataURL(file);

            // Reset suggestions
            setSuggestions([]);
            // Fetch suggestions based on garment
            await fetchSuggestions(file);
        }
    };

    const fetchSuggestions = async (file) => {
        setIsLoadingSuggestions(true);
        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('http://localhost:8005/api/try-on/suggestions', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) throw new Error('Failed to fetch suggestions');
            const data = await response.json();
            setSuggestions(data.suggestions || []);
        } catch (error) {
            console.error('Error fetching suggestions:', error);
        } finally {
            setIsLoadingSuggestions(false);
        }
    };

    const handleGenerate = async () => {
        if (!humanImage || !garmentImage || !prompt) return;

        setIsGenerating(true);
        try {
            const formData = new FormData();
            formData.append('human_image', humanImage);
            formData.append('garment_image', garmentImage);
            formData.append('prompt', prompt);

            const response = await fetch('http://localhost:8005/api/try-on/edit', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) throw new Error('Failed to generate image');

            const blob = await response.blob();
            const imageUrl = URL.createObjectURL(blob);
            setResultImage(imageUrl);
        } catch (error) {
            console.error('Error generating image:', error);
            alert('Failed to generate image. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            className="fixed inset-0 z-50 bg-[#0d1b2a] flex flex-col overflow-hidden"
        >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10 bg-[#0d1b2a]/90 backdrop-blur-md">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
                        <Shirt size={20} className="text-white" />
                    </div>
                    <div>
                        <h2 className="text-white font-semibold text-2xl tracking-tight">Virtual Try-On</h2>
                        <p className="text-gray-400 text-xs">AI-Powered Garment Transformation</p>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                >
                    <X size={28} />
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">

                    {/* Left Column: Inputs */}
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            {/* Human Image Upload */}
                            <div className="relative">
                                <p className="text-white text-sm font-medium mb-2 ml-1">1. Your Photo</p>
                                {!humanPreview ? (
                                    <button
                                        onClick={() => humanInputRef.current?.click()}
                                        className="w-full h-48 rounded-2xl bg-white/5 border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-3 hover:border-blue-400 transition-all group"
                                    >
                                        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                                            <Upload size={20} className="text-gray-400 group-hover:text-blue-400" />
                                        </div>
                                        <span className="text-gray-400 text-xs">Upload Person</span>
                                    </button>
                                ) : (
                                    <div className="relative h-48 rounded-2xl overflow-hidden border border-white/10 group">
                                        <img src={humanPreview} alt="Human" className="w-full h-full object-cover" />
                                        <button
                                            onClick={() => {
                                                setHumanPreview(null);
                                                setHumanImage(null);
                                            }}
                                            className="absolute top-2 right-2 p-1.5 bg-black/60 backdrop-blur-md rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    ref={humanInputRef}
                                    onChange={handleHumanSelect}
                                    className="hidden"
                                />
                            </div>

                            {/* Garment Image Upload */}
                            <div className="relative">
                                <p className="text-white text-sm font-medium mb-2 ml-1">2. Garment Photo</p>
                                {!garmentPreview ? (
                                    <button
                                        onClick={() => garmentInputRef.current?.click()}
                                        className="w-full h-48 rounded-2xl bg-white/5 border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-3 hover:border-blue-400 transition-all group"
                                    >
                                        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                                            <Shirt size={20} className="text-gray-400 group-hover:text-blue-400" />
                                        </div>
                                        <span className="text-gray-400 text-xs">Upload Garment</span>
                                    </button>
                                ) : (
                                    <div className="relative h-48 rounded-2xl overflow-hidden border border-white/10 group">
                                        <img src={garmentPreview} alt="Garment" className="w-full h-full object-cover" />
                                        <button
                                            onClick={() => {
                                                setGarmentPreview(null);
                                                setGarmentImage(null);
                                                setSuggestions([]);
                                            }}
                                            className="absolute top-2 right-2 p-1.5 bg-black/60 backdrop-blur-md rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    ref={garmentInputRef}
                                    onChange={handleGarmentSelect}
                                    className="hidden"
                                />
                            </div>
                        </div>

                        {/* Prompt Input */}
                        <div className="bg-[#1c1c1e] rounded-2xl p-6 border border-white/10">
                            <label className="text-gray-400 text-sm font-medium mb-3 block flex items-center gap-2">
                                <Wand2 size={16} className="text-blue-400" />
                                3. Describe the garment
                            </label>
                            <div className="flex gap-3">
                                <input
                                    type="text"
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    placeholder="E.g., A cute pink top..."
                                    className="flex-1 bg-[#2c2c2e] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                                />
                                <button
                                    onClick={handleGenerate}
                                    disabled={!humanImage || !garmentImage || !prompt || isGenerating}
                                    className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg hover:shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                                >
                                    {isGenerating ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
                                    Generate
                                </button>
                            </div>
                        </div>

                        {/* Suggestions */}
                        {garmentPreview && (
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-gray-400 text-sm">
                                    <Sparkles size={14} className="text-yellow-400" />
                                    <span>AI Descriptions for Garment</span>
                                    {isLoadingSuggestions && <Loader2 size={14} className="animate-spin ml-2" />}
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {suggestions.map((suggestion, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setPrompt(suggestion)}
                                            className="text-left p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-blue-500/30 transition-all text-sm text-gray-300 hover:text-white group"
                                        >
                                            <span className="line-clamp-2">{suggestion}</span>
                                        </button>
                                    ))}
                                    {suggestions.length === 0 && !isLoadingSuggestions && (
                                        <p className="text-gray-500 text-sm italic col-span-2">No suggestions available</p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Result */}
                    <div className="bg-[#1c1c1e] rounded-3xl border border-white/10 p-6 flex flex-col h-full min-h-[500px]">
                        <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                            <Sparkles className="text-blue-400" size={20} />
                            Generated Result
                        </h3>

                        <div className="flex-1 rounded-2xl bg-[#0d1b2a] border-2 border-dashed border-white/10 flex items-center justify-center relative overflow-hidden group">
                            {resultImage ? (
                                <>
                                    <img src={resultImage} alt="Generated" className="w-full h-full object-contain" />
                                    <div className="absolute bottom-6 flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <a
                                            href={resultImage}
                                            download="try-on-result.png"
                                            className="p-3 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-colors"
                                        >
                                            <Download size={24} />
                                        </a>
                                        <button
                                            onClick={() => setResultImage(null)}
                                            className="p-3 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-colors"
                                        >
                                            <RefreshCw size={24} />
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center text-gray-500">
                                    {isGenerating ? (
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                                            <p className="animate-pulse">Transforming your look...</p>
                                        </div>
                                    ) : (
                                        <>
                                            <Wand2 size={48} className="mx-auto mb-4 opacity-20" />
                                            <p>Generated image will appear here</p>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default VirtualTryOn;
