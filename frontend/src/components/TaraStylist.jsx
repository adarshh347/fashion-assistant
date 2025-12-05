import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Sparkles, ArrowRight, ChevronLeft, Camera, Send, Gem, Shirt, Palette, Footprints } from 'lucide-react';

const TaraStylist = ({ onClose }) => {
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [prompt, setPrompt] = useState('');
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState(null);
    const [selectedOption, setSelectedOption] = useState(null);
    const fileInputRef = useRef(null);

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
                setImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async () => {
        if (!image || !prompt) return;

        setLoading(true);
        try {
            const response = await fetch('http://localhost:8005/api/tara/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    image: image,
                    prompt: prompt
                }),
            });

            if (!response.ok) throw new Error('Analysis failed');

            const data = await response.json();
            setResults(data.options);
        } catch (error) {
            console.error(error);
            alert("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const [visualizing, setVisualizing] = useState(null); // { categoryName: string, loading: boolean, data: any }

    const handleVisualize = async (category) => {
        if (visualizing?.categoryName === category.category_name && visualizing?.data) {
            // Already visualized, just toggle or do nothing? 
            // Let's allow re-opening if we close it, but for now just return
            return;
        }

        setVisualizing({ categoryName: category.category_name, loading: true, data: null });

        try {
            const response = await fetch('http://localhost:8005/api/tara/visualize', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    original_image: image,
                    category: category.category_name,
                    keywords: category.keywords,
                    description: category.description
                }),
            });

            if (!response.ok) throw new Error('Visualization failed');

            const data = await response.json();
            setVisualizing({ categoryName: category.category_name, loading: false, data: data.suggestions });
        } catch (error) {
            console.error(error);
            setVisualizing({ categoryName: category.category_name, loading: false, error: true });
        }
    };

    const getCategoryIcon = (name) => {
        const lowerName = name.toLowerCase();
        if (lowerName.includes('jewel')) return <Gem size={20} />;
        if (lowerName.includes('top') || lowerName.includes('shirt')) return <Shirt size={20} />;
        if (lowerName.includes('color')) return <Palette size={20} />;
        if (lowerName.includes('shoe') || lowerName.includes('foot')) return <Footprints size={20} />;
        return <Sparkles size={20} />;
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#0d1b2a] text-white overflow-y-auto"
        >
            {/* Background Elements */}
            <div className="fixed inset-0 bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] opacity-50 pointer-events-none"></div>
            <div className="fixed top-[-20%] right-[-10%] w-[600px] h-[600px] bg-[#e94560]/20 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="fixed bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-[#0f3460]/30 rounded-full blur-[100px] pointer-events-none"></div>

            {/* Header */}
            <div className="relative z-10 flex items-center justify-between p-6 border-b border-white/10 backdrop-blur-md bg-[#0d1b2a]/50 sticky top-0">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-pink-500 to-violet-500 flex items-center justify-center">
                        <Sparkles size={20} className="text-white" />
                    </div>
                    <h1 className="text-2xl font-light tracking-wider">Tara <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-violet-400">Stylist Persona</span></h1>
                </div>
                <button
                    onClick={onClose}
                    className="p-2 rounded-full hover:bg-white/10 transition-colors"
                >
                    <X size={24} />
                </button>
            </div>

            <div className="relative z-10 max-w-7xl mx-auto p-6 md:p-12">
                {!results ? (
                    <div className="flex flex-col lg:flex-row gap-12 items-start">
                        {/* Left: Upload Section */}
                        <div className="w-full lg:w-1/2 space-y-8">
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                className="space-y-4"
                            >
                                <h2 className="text-4xl font-thin">Upload your look</h2>
                                <p className="text-white/60">Let Tara analyze your current outfit and suggest transformations.</p>
                            </motion.div>

                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.1 }}
                                className={`relative aspect-[3/4] rounded-3xl border-2 border-dashed border-white/20 flex flex-col items-center justify-center cursor-pointer overflow-hidden group transition-all duration-300 ${preview ? 'border-none' : 'hover:border-white/40 hover:bg-white/5'}`}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                {preview ? (
                                    <img src={preview} alt="Upload" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="text-center space-y-4 p-8">
                                        <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                                            <Camera size={32} className="text-white/70" />
                                        </div>
                                        <div>
                                            <p className="text-lg font-medium">Click to upload photo</p>
                                            <p className="text-sm text-white/40">or drag and drop</p>
                                        </div>
                                    </div>
                                )}
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                />
                                {preview && (
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <p className="text-white font-medium">Change Photo</p>
                                    </div>
                                )}
                            </motion.div>
                        </div>

                        {/* Right: Prompt Section */}
                        <div className="w-full lg:w-1/2 space-y-8 lg:pt-20">
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="space-y-4"
                            >
                                <h3 className="text-2xl font-light">What's on your mind?</h3>
                                <div className="relative">
                                    <textarea
                                        value={prompt}
                                        onChange={(e) => setPrompt(e.target.value)}
                                        placeholder="E.g., The dress is too modest, I want a bit of boldness..."
                                        className="w-full h-48 bg-white/5 border border-white/10 rounded-2xl p-6 text-lg text-white placeholder:text-white/30 focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/50 transition-all resize-none"
                                    />
                                    <div className="absolute bottom-4 right-4">
                                        <button
                                            onClick={handleSubmit}
                                            disabled={loading || !image || !prompt}
                                            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${loading || !image || !prompt
                                                ? 'bg-white/10 text-white/30 cursor-not-allowed'
                                                : 'bg-gradient-to-r from-pink-500 to-violet-600 text-white shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40 hover:scale-105'
                                                }`}
                                        >
                                            {loading ? (
                                                <>
                                                    <span className="animate-spin">✨</span> Analyzing...
                                                </>
                                            ) : (
                                                <>
                                                    Generate <Send size={18} />
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                className="bg-white/5 rounded-2xl p-6 border border-white/10"
                            >
                                <h4 className="text-sm font-medium text-white/60 mb-4 uppercase tracking-wider">Try asking for:</h4>
                                <div className="flex flex-wrap gap-3">
                                    {["Make it more formal", "Add bohemian vibes", "Suggest matching accessories", "Change color palette"].map((tag, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setPrompt(tag)}
                                            className="px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-sm transition-colors"
                                        >
                                            {tag}
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col lg:flex-row gap-8 h-[calc(100vh-140px)]">
                        {/* Side Image Panel */}
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="w-full lg:w-1/3 lg:h-full flex-shrink-0"
                        >
                            <div className="bg-white/5 rounded-3xl p-4 h-full border border-white/10 flex flex-col">
                                <h3 className="text-lg font-light mb-4 text-white/80">Original Look</h3>
                                <div className="flex-1 rounded-2xl overflow-hidden relative">
                                    <img src={image} alt="Original" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none"></div>
                                    <div className="absolute bottom-4 left-4 right-4">
                                        <p className="text-sm text-white/80 italic">"{prompt}"</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => { setResults(null); setSelectedOption(null); setVisualizing(null); }}
                                    className="mt-4 w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm transition-colors flex items-center justify-center gap-2"
                                >
                                    <Camera size={16} /> Upload New Photo
                                </button>
                            </div>
                        </motion.div>

                        {/* Main Content Area */}
                        <div className="w-full lg:w-2/3 h-full overflow-y-auto pr-2 custom-scrollbar">
                            <AnimatePresence mode="wait">
                                {!selectedOption ? (
                                    <motion.div
                                        key="layer1"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        className="space-y-8"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h2 className="text-3xl font-light">Tara's Recommendations</h2>
                                                <p className="text-white/60">Select a style direction to explore details.</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 gap-4">
                                            {results.map((option, idx) => (
                                                <motion.div
                                                    key={option.id}
                                                    initial={{ opacity: 0, x: 20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: idx * 0.1 }}
                                                    onClick={() => setSelectedOption(option)}
                                                    className="group relative bg-white/5 hover:bg-white/10 border border-white/10 hover:border-pink-500/30 rounded-2xl p-6 cursor-pointer transition-all duration-300 hover:translate-x-2 flex items-center gap-6"
                                                >
                                                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-pink-500/20 to-violet-500/20 flex-shrink-0 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                        <span className="text-2xl font-bold text-white">{idx + 1}</span>
                                                    </div>
                                                    <div className="flex-1">
                                                        <h3 className="text-xl font-medium mb-1 group-hover:text-pink-300 transition-colors">{option.summary_title}</h3>
                                                        <p className="text-white/60 text-sm leading-relaxed line-clamp-2">{option.summary_description}</p>
                                                    </div>
                                                    <ArrowRight className="text-white/20 group-hover:text-pink-400 transition-colors" />
                                                </motion.div>
                                            ))}
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="layer2"
                                        initial={{ opacity: 0, x: 50 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 50 }}
                                        className="space-y-6"
                                    >
                                        <div className="flex items-center gap-4 sticky top-0 bg-[#0d1b2a] z-20 py-4 border-b border-white/10">
                                            <button
                                                onClick={() => { setSelectedOption(null); setVisualizing(null); }}
                                                className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
                                            >
                                                <ChevronLeft size={24} />
                                            </button>
                                            <div>
                                                <h2 className="text-2xl font-light">{selectedOption.summary_title}</h2>
                                                <p className="text-white/60 text-sm">Detailed breakdown of this style.</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 gap-6 pb-8">
                                            {selectedOption.categories.map((cat, idx) => (
                                                <motion.div
                                                    key={idx}
                                                    initial={{ opacity: 0, scale: 0.9 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    transition={{ delay: idx * 0.05 }}
                                                    className={`bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4 transition-all duration-500 ${visualizing?.categoryName === cat.category_name ? 'ring-2 ring-pink-500/50 bg-white/10' : 'hover:bg-white/10'
                                                        }`}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <div className="p-2 rounded-lg bg-white/10 text-pink-300">
                                                                {getCategoryIcon(cat.category_name)}
                                                            </div>
                                                            <h3 className="text-lg font-medium">{cat.category_name}</h3>
                                                        </div>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleVisualize(cat); }}
                                                            className="px-4 py-2 rounded-full bg-pink-500 hover:bg-pink-600 text-white text-xs font-bold transition-colors flex items-center gap-2 shadow-lg shadow-pink-500/20 z-10"
                                                        >
                                                            <Sparkles size={14} /> Visualize Style
                                                        </button>
                                                    </div>

                                                    <div className="flex flex-wrap gap-2">
                                                        {cat.keywords.map((kw, k) => (
                                                            <span key={k} className="text-[10px] font-medium px-2 py-1 rounded-md bg-pink-500/10 text-pink-300 border border-pink-500/20 uppercase tracking-wide">
                                                                {kw}
                                                            </span>
                                                        ))}
                                                    </div>

                                                    <p className="text-sm text-white/70 leading-relaxed">
                                                        {cat.description}
                                                    </p>

                                                    {/* Visualization Results */}
                                                    <AnimatePresence>
                                                        {visualizing?.categoryName === cat.category_name && (
                                                            <motion.div
                                                                initial={{ height: 0, opacity: 0 }}
                                                                animate={{ height: 'auto', opacity: 1 }}
                                                                exit={{ height: 0, opacity: 0 }}
                                                                className="overflow-hidden pt-4 border-t border-white/10 mt-4"
                                                            >
                                                                {visualizing.loading ? (
                                                                    <div className="flex items-center justify-center py-8 text-white/50 gap-3">
                                                                        <div className="animate-spin w-5 h-5 border-2 border-pink-500 border-t-transparent rounded-full"></div>
                                                                        <span>Finding best matches & analyzing fit...</span>
                                                                    </div>
                                                                ) : visualizing.data ? (
                                                                    <div className="grid grid-cols-1 gap-4">
                                                                        {visualizing.data.map((suggestion, sIdx) => (
                                                                            <div key={sIdx} className="flex gap-4 bg-black/20 rounded-xl p-3">
                                                                                <div className="w-24 h-32 flex-shrink-0 rounded-lg overflow-hidden bg-white/5">
                                                                                    <img src={suggestion.image_url} alt="Suggestion" className="w-full h-full object-cover" />
                                                                                </div>
                                                                                <div className="flex-1">
                                                                                    <h4 className="text-sm font-medium text-pink-300 mb-1">Why this fits:</h4>
                                                                                    <p className="text-xs text-white/80 leading-relaxed italic">
                                                                                        "{suggestion.reasoning}"
                                                                                    </p>
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                ) : (
                                                                    <div className="text-center py-4 text-red-400 text-sm">
                                                                        Failed to load suggestions.
                                                                    </div>
                                                                )}
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default TaraStylist;
