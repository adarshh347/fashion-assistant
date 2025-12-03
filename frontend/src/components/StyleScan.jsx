import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Sparkles, Loader2, Camera, CheckCircle, Scan, GitCompare, Zap, TrendingUp, Palette } from 'lucide-react';

const FeatureCard = ({ title, items, icon: Icon, color }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#2c2c2e] rounded-2xl p-5 border border-white/10 hover:border-white/20 transition-all"
    >
        <div className="flex items-center gap-3 mb-4">
            <div className={`p-2 rounded-xl ${color}`}>
                <Icon size={20} className="text-white" />
            </div>
            <h3 className="text-white font-semibold text-lg">{title}</h3>
        </div>
        <div className="space-y-2">
            {items && items.length > 0 ? (
                items.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                        <CheckCircle size={16} className="text-green-400 mt-0.5 flex-shrink-0" />
                        <p className="text-gray-300 text-sm leading-relaxed">{item}</p>
                    </div>
                ))
            ) : (
                <p className="text-gray-500 text-sm italic">No data available</p>
            )}
        </div>
    </motion.div>
);

const ModeButton = ({ icon: Icon, label, active, onClick }) => (
    <motion.button
        onClick={onClick}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`relative group flex flex-col items-center justify-center p-4 rounded-2xl transition-all ${active
                ? 'bg-gradient-to-br from-purple-600 to-pink-600 shadow-lg shadow-purple-500/30'
                : 'bg-[#2c2c2e] hover:bg-[#3c3c3e] border border-white/10'
            }`}
    >
        <Icon size={24} className={active ? 'text-white' : 'text-gray-400 group-hover:text-white'} />
        <span className={`text-xs mt-2 ${active ? 'text-white font-medium' : 'text-gray-500 group-hover:text-gray-300'}`}>
            {label}
        </span>
    </motion.button>
);

const StyleScan = ({ onClose }) => {
    const [mode, setMode] = useState('single'); // 'single' or 'compare'
    const [selectedImage1, setSelectedImage1] = useState(null);
    const [imagePreview1, setImagePreview1] = useState(null);
    const [selectedImage2, setSelectedImage2] = useState(null);
    const [imagePreview2, setImagePreview2] = useState(null);
    const [analysis1, setAnalysis1] = useState(null);
    const [analysis2, setAnalysis2] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const fileInputRef1 = useRef(null);
    const fileInputRef2 = useRef(null);

    const handleImageSelect = (e, imageNumber) => {
        const file = e.target.files?.[0];
        if (file) {
            if (imageNumber === 1) {
                setSelectedImage1(file);
                const reader = new FileReader();
                reader.onloadend = () => setImagePreview1(reader.result);
                reader.readAsDataURL(file);
                setAnalysis1(null);
            } else {
                setSelectedImage2(file);
                const reader = new FileReader();
                reader.onloadend = () => setImagePreview2(reader.result);
                reader.readAsDataURL(file);
                setAnalysis2(null);
            }
        }
    };

    const handleAnalyze = async (imageNumber) => {
        const selectedImage = imageNumber === 1 ? selectedImage1 : selectedImage2;
        if (!selectedImage) return;

        setIsAnalyzing(true);

        try {
            const formData = new FormData();
            formData.append('image', selectedImage);
            formData.append('session_id', `stylescan-session-${imageNumber}`);

            console.log(`🔍 Starting StyleScan analysis for image ${imageNumber}...`);

            const response = await fetch('http://localhost:8005/api/analyze-garment', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }

            const data = await response.json();
            console.log(`✅ Analysis ${imageNumber} complete:`, data);

            if (imageNumber === 1) {
                setAnalysis1(data);
            } else {
                setAnalysis2(data);
            }

        } catch (error) {
            console.error(`❌ Analysis ${imageNumber} error:`, error);
            alert(`Analysis failed: ${error.message}`);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const renderAnalysisCards = (analysis) => (
        <div className="grid grid-cols-1 gap-3">
            <FeatureCard
                title="Category & Type"
                items={[`${analysis.category} - ${analysis.type}`]}
                icon={Sparkles}
                color="bg-gradient-to-br from-blue-500 to-cyan-500"
            />
            <FeatureCard
                title="Style Aesthetics"
                items={analysis.style_aesthetic}
                icon={Sparkles}
                color="bg-gradient-to-br from-purple-500 to-pink-500"
            />
            <FeatureCard
                title="Vibe & Mood"
                items={analysis.vibe_mood}
                icon={Sparkles}
                color="bg-gradient-to-br from-orange-500 to-red-500"
            />
            <FeatureCard
                title="Colors"
                items={analysis.colors}
                icon={Sparkles}
                color="bg-gradient-to-br from-green-500 to-teal-500"
            />
            <FeatureCard
                title="Score"
                items={[`${analysis.preference_score}/100`]}
                icon={Sparkles}
                color="bg-gradient-to-br from-indigo-500 to-purple-500"
            />
        </div>
    );

    return (
        <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-50 bg-[#0d1b2a] flex overflow-hidden"
        >
            {/* Vertical Sidebar */}
            <div className="w-24 bg-[#1c1c1e] border-r border-white/10 flex flex-col items-center py-6 gap-4">
                <ModeButton
                    icon={Scan}
                    label="Single"
                    active={mode === 'single'}
                    onClick={() => setMode('single')}
                />
                <ModeButton
                    icon={GitCompare}
                    label="Compare"
                    active={mode === 'compare'}
                    onClick={() => setMode('compare')}
                />
                <div className="flex-1" />
                <ModeButton icon={Zap} label="Quick" active={false} onClick={() => { }} />
                <ModeButton icon={TrendingUp} label="Trends" active={false} onClick={() => { }} />
                <ModeButton icon={Palette} label="Colors" active={false} onClick={() => { }} />
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10 bg-[#0d1b2a]/90 backdrop-blur-md">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                            <Sparkles size={20} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-white font-semibold text-2xl tracking-tight">
                                StyleScan {mode === 'compare' && '- Compare Mode'}
                            </h2>
                            <p className="text-gray-400 text-xs">AI-Powered Garment Analysis</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                    >
                        <X size={28} />
                    </button>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="max-w-7xl mx-auto">

                        {mode === 'single' ? (
                            // Single Mode
                            !imagePreview1 ? (
                                <motion.div
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="flex flex-col items-center justify-center min-h-[60vh]"
                                >
                                    <input
                                        type="file"
                                        accept="image/*"
                                        ref={fileInputRef1}
                                        onChange={(e) => handleImageSelect(e, 1)}
                                        className="hidden"
                                    />
                                    <button
                                        onClick={() => fileInputRef1.current?.click()}
                                        className="group relative"
                                    >
                                        <div className="w-48 h-48 rounded-3xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-2 border-dashed border-purple-400/50 flex flex-col items-center justify-center gap-4 hover:border-purple-400 transition-all group-hover:scale-105">
                                            <Upload size={48} className="text-purple-400 group-hover:text-purple-300 transition-colors" />
                                            <div className="text-center">
                                                <p className="text-white font-medium">Upload Garment</p>
                                                <p className="text-gray-400 text-sm">Click to select image</p>
                                            </div>
                                        </div>
                                    </button>
                                </motion.div>
                            ) : (
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    <div className="lg:col-span-1">
                                        <div className="sticky top-6">
                                            <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                                                <img src={imagePreview1} alt="Garment" className="w-full h-auto object-cover" />
                                                <button
                                                    onClick={() => { setImagePreview1(null); setSelectedImage1(null); setAnalysis1(null); }}
                                                    className="absolute top-3 right-3 p-2 bg-black/60 backdrop-blur-sm rounded-full text-white hover:bg-black/80 transition-colors"
                                                >
                                                    <X size={20} />
                                                </button>
                                            </div>
                                            {!analysis1 && (
                                                <button
                                                    onClick={() => handleAnalyze(1)}
                                                    disabled={isAnalyzing}
                                                    className="w-full mt-4 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-semibold text-lg hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-purple-500/30 flex items-center justify-center gap-3"
                                                >
                                                    {isAnalyzing ? <><Loader2 className="animate-spin" size={24} />Analyzing...</> : <><Sparkles size={24} />Analyze Garment</>}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <div className="lg:col-span-2">
                                        {analysis1 ? renderAnalysisCards(analysis1) : (
                                            <div className="flex items-center justify-center min-h-[400px]">
                                                <p className="text-gray-500 text-lg">Click "Analyze Garment" to start</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )
                        ) : (
                            // Compare Mode
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Image 1 */}
                                <div className="space-y-4">
                                    <h3 className="text-white font-semibold text-lg">Garment 1</h3>
                                    {!imagePreview1 ? (
                                        <div className="flex flex-col items-center justify-center min-h-[300px] border-2 border-dashed border-purple-400/30 rounded-2xl">
                                            <input type="file" accept="image/*" ref={fileInputRef1} onChange={(e) => handleImageSelect(e, 1)} className="hidden" />
                                            <button onClick={() => fileInputRef1.current?.click()} className="flex flex-col items-center gap-3">
                                                <Upload size={40} className="text-purple-400" />
                                                <p className="text-gray-400">Upload Image 1</p>
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="relative rounded-2xl overflow-hidden border border-white/10">
                                                <img src={imagePreview1} alt="Garment 1" className="w-full h-64 object-cover" />
                                                <button onClick={() => { setImagePreview1(null); setSelectedImage1(null); setAnalysis1(null); }} className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-full text-white">
                                                    <X size={16} />
                                                </button>
                                            </div>
                                            {!analysis1 && (
                                                <button onClick={() => handleAnalyze(1)} disabled={isAnalyzing} className="w-full py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-500 disabled:opacity-50 transition-all">
                                                    {isAnalyzing ? 'Analyzing...' : 'Analyze'}
                                                </button>
                                            )}
                                            {analysis1 && renderAnalysisCards(analysis1)}
                                        </>
                                    )}
                                </div>

                                {/* Image 2 */}
                                <div className="space-y-4">
                                    <h3 className="text-white font-semibold text-lg">Garment 2</h3>
                                    {!imagePreview2 ? (
                                        <div className="flex flex-col items-center justify-center min-h-[300px] border-2 border-dashed border-pink-400/30 rounded-2xl">
                                            <input type="file" accept="image/*" ref={fileInputRef2} onChange={(e) => handleImageSelect(e, 2)} className="hidden" />
                                            <button onClick={() => fileInputRef2.current?.click()} className="flex flex-col items-center gap-3">
                                                <Upload size={40} className="text-pink-400" />
                                                <p className="text-gray-400">Upload Image 2</p>
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="relative rounded-2xl overflow-hidden border border-white/10">
                                                <img src={imagePreview2} alt="Garment 2" className="w-full h-64 object-cover" />
                                                <button onClick={() => { setImagePreview2(null); setSelectedImage2(null); setAnalysis2(null); }} className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-full text-white">
                                                    <X size={16} />
                                                </button>
                                            </div>
                                            {!analysis2 && (
                                                <button onClick={() => handleAnalyze(2)} disabled={isAnalyzing} className="w-full py-3 bg-pink-600 text-white rounded-xl font-medium hover:bg-pink-500 disabled:opacity-50 transition-all">
                                                    {isAnalyzing ? 'Analyzing...' : 'Analyze'}
                                                </button>
                                            )}
                                            {analysis2 && renderAnalysisCards(analysis2)}
                                        </>
                                    )}
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default StyleScan;
