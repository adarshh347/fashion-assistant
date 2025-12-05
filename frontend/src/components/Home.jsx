import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Search, History, Settings, User, MoreHorizontal, Image as ImageIcon, Sparkles, Shirt, Gem } from 'lucide-react';
import WeatherSuggestions from './WeatherSuggestions';

const IconItem = ({ icon: Icon, label, onClick, color }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div
            className="relative flex flex-col items-center justify-center p-4 cursor-pointer group"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={onClick}
        >
            <motion.div
                className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300 ${isHovered ? 'scale-110 shadow-xl' : 'scale-100'}`}
                style={{
                    background: color || 'linear-gradient(135deg, #ffffff 0%, #e0e0e0 100%)',
                    boxShadow: isHovered ? '0 10px 25px -5px rgba(0, 0, 0, 0.3)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                whileHover={{ rotate: 5 }}
                whileTap={{ scale: 0.95 }}
            >
                <Icon size={32} className="text-white drop-shadow-md" />
            </motion.div>

            <AnimatePresence>
                {isHovered && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        className="absolute top-full mt-3 px-3 py-1 bg-black/80 backdrop-blur-sm border border-white/10 rounded-full text-xs text-white font-medium whitespace-nowrap z-50"
                    >
                        {label}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const Home = ({ onOpenChat, onOpenGallery, onOpenStyleScan, onOpenVirtualTryOn, onOpenTara }) => {
    return (
        <div className="min-h-screen w-full bg-[#0d1b2a] text-white overflow-hidden relative font-sans selection:bg-teal-500/30">
            {/* Background Gradient - Xiaomi/MIUI Style */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#0f4c75] via-[#3282b8] to-[#bbe1fa] opacity-20 pointer-events-none"></div>
            <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-[#3282b8]/30 rounded-full blur-[100px] pointer-events-none"></div>

            {/* Top Icons Grid */}
            <div className="relative z-10 pt-16 px-8">
                <div className="grid grid-cols-3 gap-8 max-w-md mx-auto">
                    <IconItem icon={History} label="History" color="linear-gradient(135deg, #FF6B6B 0%, #EE5253 100%)" />
                    <IconItem icon={ImageIcon} label="Gallery" onClick={onOpenGallery} color="linear-gradient(135deg, #48DBFB 0%, #0ABDE3 100%)" />
                    <IconItem icon={Sparkles} label="StyleScan" onClick={onOpenStyleScan} color="linear-gradient(135deg, #A855F7 0%, #EC4899 100%)" />
                    <IconItem icon={Gem} label="Tara" onClick={onOpenTara} color="linear-gradient(135deg, #F472B6 0%, #9333EA 100%)" />
                    <IconItem icon={Settings} label="Settings" color="linear-gradient(135deg, #54A0FF 0%, #2E86DE 100%)" />
                    <IconItem icon={Shirt} label="Try-On" onClick={onOpenVirtualTryOn} color="linear-gradient(135deg, #FF9F43 0%, #EE5A24 100%)" />
                </div>
            </div>

            {/* Main Content */}
            <main className="relative z-10 flex flex-col items-center justify-center mt-20 px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="text-center mb-16"
                >
                    <h1 className="text-6xl md:text-8xl font-thin text-white tracking-tighter mb-6 drop-shadow-lg">
                        02:41
                    </h1>
                    <p className="text-xl md:text-2xl text-white/90 font-light italic max-w-2xl mx-auto leading-relaxed drop-shadow-md">
                        "Fashion is the armor to survive the reality of everyday life."
                    </p>
                    <p className="text-sm text-white/60 mt-2 uppercase tracking-widest">
                        — Bill Cunningham
                    </p>
                </motion.div>

                {/* Search / Chat Trigger */}
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="w-full max-w-xl"
                >
                    <button
                        onClick={onOpenChat}
                        className="group w-full relative flex items-center gap-4 p-1 rounded-full bg-white/10 border border-white/20 backdrop-blur-xl shadow-2xl hover:bg-white/20 transition-all duration-300"
                    >
                        <div className="flex-1 flex items-center gap-4 px-6 py-4">
                            <Search className="text-white/70 group-hover:text-white transition-colors" size={24} />
                            <span className="text-xl text-white/70 group-hover:text-white font-light text-left flex-1">
                                Search or ask...
                            </span>
                        </div>
                        <div className="p-3 bg-white/20 rounded-full group-hover:bg-white/30 transition-colors mr-2">
                            <Camera className="text-white" size={24} />
                        </div>
                    </button>

                    {/* Weather-Based Suggestions */}
                    <WeatherSuggestions />
                </motion.div>
            </main>
        </div>
    );
};

export default Home;
