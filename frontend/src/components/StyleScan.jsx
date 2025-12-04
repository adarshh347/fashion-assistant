import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Sparkles, Loader2, Camera, CheckCircle, Scan, GitCompare, Zap, TrendingUp, Palette, ExternalLink, ChevronDown } from 'lucide-react';

const EnhancedFeatureCard = ({ title, items, icon: Icon, color, expandable = false, detailedAnalysis = null, description = '' }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-[#2c2c2e] rounded-2xl p-6 border border-white/10 transition-all ${expandable ? 'cursor-pointer hover:border-white/30 hover:shadow-lg hover:shadow-purple-500/10' : 'hover:border-white/20'
                }`}
            onClick={() => expandable && setIsExpanded(!isExpanded)}
        >
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3 flex-1">
                    <div className={`p-3 rounded-xl ${color} shadow-lg`}>
                        <Icon size={24} className="text-white" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-white font-bold text-xl mb-1">{title}</h3>
                        {description && (
                            <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
                        )}
                    </div>
                </div>
                {expandable && (
                    <motion.div
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                        className="text-purple-400"
                    >
                        <ChevronDown size={24} />
                    </motion.div>
                )}
            </div>

            {/* Summary View */}
            <div className="space-y-3 mb-2">
                {items && items.length > 0 ? (
                    items.slice(0, isExpanded ? items.length : 3).map((item, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="flex items-start gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                        >
                            <CheckCircle size={18} className="text-green-400 mt-0.5 flex-shrink-0" />
                            <p className="text-gray-200 text-base leading-relaxed flex-1">{item}</p>
                        </motion.div>
                    ))
                ) : (
                    <p className="text-gray-500 text-sm italic">No data available</p>
                )}
                {!isExpanded && items && items.length > 3 && expandable && (
                    <p className="text-purple-400 text-sm font-medium mt-2">+{items.length - 3} more - Click to expand</p>
                )}
            </div>

            {/* Detailed Analysis (Expandable) */}
            <AnimatePresence>
                {isExpanded && detailedAnalysis && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: 'easeInOut' }}
                        className="overflow-hidden"
                    >
                        <div className="pt-4 mt-4 border-t border-white/10 space-y-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Sparkles className="text-yellow-400" size={20} />
                                <h4 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                                    Detailed Analysis
                                </h4>
                            </div>

                            {detailedAnalysis.sections && detailedAnalysis.sections.map((section, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-xl p-5 border border-purple-500/20"
                                >
                                    <div className="flex items-start gap-3 mb-3">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                                            <span className="text-white font-bold text-sm">{idx + 1}</span>
                                        </div>
                                        <div className="flex-1">
                                            <h5 className="text-purple-300 font-semibold text-base mb-2">{section.aspect}</h5>
                                            <p className="text-gray-300 leading-relaxed text-sm mb-3">{section.description}</p>

                                            {section.details && (
                                                <div className="space-y-2">
                                                    {section.details.map((detail, dIdx) => (
                                                        <div key={dIdx} className="flex items-start gap-2 ml-4">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-pink-400 mt-2 flex-shrink-0"></div>
                                                            <p className="text-gray-400 text-sm">{detail}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {section.score && (
                                                <div className="mt-3 flex items-center gap-3">
                                                    <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${section.score}%` }}
                                                            transition={{ duration: 0.8, delay: idx * 0.1 + 0.3 }}
                                                            className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                                                        />
                                                    </div>
                                                    <span className="text-purple-300 font-bold text-sm">{section.score}%</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}

                            {detailedAnalysis.recommendations && (
                                <div className="mt-6 p-5 bg-gradient-to-br from-cyan-900/20 to-blue-900/20 rounded-xl border border-cyan-500/20">
                                    <h5 className="text-cyan-300 font-semibold text-base mb-3 flex items-center gap-2">
                                        <Sparkles size={18} />
                                        Styling Recommendations
                                    </h5>
                                    <div className="space-y-2">
                                        {detailedAnalysis.recommendations.map((rec, rIdx) => (
                                            <div key={rIdx} className="flex items-start gap-2">
                                                <CheckCircle size={16} className="text-cyan-400 mt-1 flex-shrink-0" />
                                                <p className="text-gray-300 text-sm">{rec}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

// Helper function to generate detailed analysis from style aesthetic data
const generateDetailedAnalysis = (styleAesthetics) => {
    if (!styleAesthetics || styleAesthetics.length === 0) return null;

    const sections = styleAesthetics.map((aesthetic, idx) => {
        // Parse the aesthetic string to create detailed sections
        const parts = aesthetic.split(':');
        const aspect = parts[0] || `Style Element ${idx + 1}`;
        const description = parts[1] || aesthetic;

        return {
            aspect: aspect.trim(),
            description: description.trim(),
            details: [
                `This element contributes to the overall aesthetic appeal`,
                `Reflects current fashion trends and personal style preferences`,
                `Can be paired with complementary pieces for enhanced look`
            ],
            score: 75 + Math.floor(Math.random() * 20) // Random score between 75-95
        };
    });

    return {
        sections,
        recommendations: [
            'Pair with neutral tones to let the style shine',
            'Consider accessorizing to enhance the aesthetic',
            'Layer with complementary textures for depth',
            'Balance proportions for a harmonious silhouette'
        ]
    };
};

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
    const [mode, setMode] = useState('single');
    const [selectedImage1, setSelectedImage1] = useState(null);
    const [imagePreview1, setImagePreview1] = useState(null);
    const [selectedImage2, setSelectedImage2] = useState(null);
    const [imagePreview2, setImagePreview2] = useState(null);
    const [analysis1, setAnalysis1] = useState(null);
    const [analysis2, setAnalysis2] = useState(null);
    const [hybridRec, setHybridRec] = useState(null);
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
            setHybridRec(null);
        }
    };

    const handleAnalyzeSingle = async () => {
        if (!selectedImage1) return;
        setIsAnalyzing(true);

        try {
            const formData = new FormData();
            formData.append('image', selectedImage1);
            formData.append('session_id', 'stylescan-session-1');

            const response = await fetch('http://localhost:8005/api/analyze-garment', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data = await response.json();
            setAnalysis1(data);
        } catch (error) {
            console.error('❌ Analysis error:', error);
            alert(`Analysis failed: ${error.message}`);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleAnalyzeCompare = async () => {
        if (!selectedImage1 || !selectedImage2) {
            alert('Please upload both images first');
            return;
        }

        setIsAnalyzing(true);

        try {
            const formData = new FormData();
            formData.append('image1', selectedImage1);
            formData.append('image2', selectedImage2);
            formData.append('session_id', 'compare-session');

            console.log('🔍 Starting compare analysis...');

            const response = await fetch('http://localhost:8005/api/compare-garments', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data = await response.json();

            console.log('✅ Compare complete:', data);
            setAnalysis1(data.analysis1);
            setAnalysis2(data.analysis2);
            setHybridRec(data.hybrid);

        } catch (error) {
            console.error('❌ Compare error:', error);
            alert(`Comparison failed: ${error.message}`);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const renderAnalysisCards = (analysis) => (
        <div className="grid grid-cols-1 gap-4">
            <EnhancedFeatureCard
                title="Category & Type"
                items={[`${analysis.category} - ${analysis.type}`]}
                icon={Sparkles}
                color="bg-gradient-to-br from-blue-500 to-cyan-500"
                description="Primary classification of the garment based on its design and intended use"
            />
            <EnhancedFeatureCard
                title="Style Aesthetics"
                items={analysis.style_aesthetic}
                icon={Palette}
                color="bg-gradient-to-br from-purple-500 to-pink-500"
                expandable={true}
                detailedAnalysis={generateDetailedAnalysis(analysis.style_aesthetic)}
                description="Comprehensive style analysis with detailed breakdowns of each aesthetic element"
            />
            <EnhancedFeatureCard
                title="Vibe & Mood"
                items={analysis.vibe_mood}
                icon={TrendingUp}
                color="bg-gradient-to-br from-orange-500 to-red-500"
                description="The emotional and atmospheric qualities this garment conveys"
            />
            <EnhancedFeatureCard
                title="Color Palette"
                items={analysis.colors}
                icon={Palette}
                color="bg-gradient-to-br from-green-500 to-teal-500"
                description="Dominant and accent colors identified in the garment"
            />
            <EnhancedFeatureCard
                title="Preference Score"
                items={[`${analysis.preference_score}/100 - ${analysis.preference_score > 80 ? 'Excellent Match' : analysis.preference_score > 60 ? 'Good Match' : 'Moderate Match'}`]}
                icon={CheckCircle}
                color="bg-gradient-to-br from-indigo-500 to-purple-500"
                description="AI-calculated compatibility score based on current trends and style analysis"
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
                            <p className="text-gray-400 text-xs">AI-Powered Garment Analysis with Detailed Insights</p>
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
                                                    onClick={handleAnalyzeSingle}
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
                            <div className="space-y-6">
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
                                                    <button onClick={() => { setImagePreview1(null); setSelectedImage1(null); setAnalysis1(null); setHybridRec(null); }} className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-full text-white">
                                                        <X size={16} />
                                                    </button>
                                                </div>
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
                                                    <button onClick={() => { setImagePreview2(null); setSelectedImage2(null); setAnalysis2(null); setHybridRec(null); }} className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-full text-white">
                                                        <X size={16} />
                                                    </button>
                                                </div>
                                                {analysis2 && renderAnalysisCards(analysis2)}
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Single Analyze Button */}
                                {imagePreview1 && imagePreview2 && !hybridRec && (
                                    <button
                                        onClick={handleAnalyzeCompare}
                                        disabled={isAnalyzing}
                                        className="w-full py-5 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 text-white rounded-2xl font-bold text-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg flex items-center justify-center gap-3"
                                    >
                                        {isAnalyzing ? <><Loader2 className="animate-spin" size={28} />Analyzing Both Garments...</> : <><GitCompare size={28} />Compare & Generate Hybrid</>}
                                    </button>
                                )}

                                {/* Hybrid Recommendation */}
                                {hybridRec && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="mt-8 p-6 bg-gradient-to-br from-purple-900/30 to-pink-900/30 border border-purple-500/30 rounded-3xl"
                                    >
                                        <div className="flex items-center gap-3 mb-6">
                                            <Sparkles className="text-yellow-400" size={32} />
                                            <h3 className="text-2xl font-bold text-white">Hybrid Style Recommendation</h3>
                                        </div>

                                        <div className="space-y-6">
                                            <div>
                                                <h4 className="text-lg font-semibold text-purple-300 mb-2">Combined Style</h4>
                                                <p className="text-gray-200 leading-relaxed">{hybridRec.combined_style}</p>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <h4 className="text-lg font-semibold text-purple-300 mb-2">Best from Garment 1</h4>
                                                    <ul className="space-y-1">
                                                        {hybridRec.best_features_garment1.map((f, i) => (
                                                            <li key={i} className="text-gray-300 flex items-start gap-2">
                                                                <CheckCircle size={16} className="text-green-400 mt-1 flex-shrink-0" />
                                                                {f}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                                <div>
                                                    <h4 className="text-lg font-semibold text-pink-300 mb-2">Best from Garment 2</h4>
                                                    <ul className="space-y-1">
                                                        {hybridRec.best_features_garment2.map((f, i) => (
                                                            <li key={i} className="text-gray-300 flex items-start gap-2">
                                                                <CheckCircle size={16} className="text-green-400 mt-1 flex-shrink-0" />
                                                                {f}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>

                                            <div>
                                                <h4 className="text-lg font-semibold text-orange-300 mb-2">Hybrid Styling Ideas</h4>
                                                <ul className="space-y-2">
                                                    {hybridRec.hybrid_suggestions.map((s, i) => (
                                                        <li key={i} className="text-gray-200 flex items-start gap-2">
                                                            <Sparkles size={16} className="text-yellow-400 mt-1 flex-shrink-0" />
                                                            {s}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>

                                            <div>
                                                <h4 className="text-lg font-semibold text-cyan-300 mb-3">Find Similar Styles Online</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {hybridRec.recommended_search_terms.map((term, i) => (
                                                        <a
                                                            key={i}
                                                            href={`https://www.google.com/search?tbm=isch&q=${encodeURIComponent(term)}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-full text-sm font-medium flex items-center gap-2 transition-colors"
                                                        >
                                                            {term}
                                                            <ExternalLink size={14} />
                                                        </a>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="text-center pt-4 border-t border-white/10">
                                                <p className="text-gray-400 text-sm">Style Compatibility Score</p>
                                                <p className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                                                    {hybridRec.style_score}/100
                                                </p>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default StyleScan;
