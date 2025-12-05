import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import Home from './components/Home';
import ChatWindow from './components/ChatWindow';
import Gallery from './components/Gallery';
import StyleScan from './components/StyleScan';
import VirtualTryOn from './components/VirtualTryOn';
import TaraStylist from './components/TaraStylist';

function App() {
	const [activeView, setActiveView] = useState('home'); // 'home', 'chat', 'gallery', 'stylescan', 'tryon'

	return (
		<div className="bg-black min-h-screen">
			<Home
				onOpenChat={() => setActiveView('chat')}
				onOpenGallery={() => setActiveView('gallery')}
				onOpenStyleScan={() => setActiveView('stylescan')}
				onOpenVirtualTryOn={() => setActiveView('tryon')}
				onOpenTara={() => setActiveView('tara')}
			/>

			<AnimatePresence>
				{activeView === 'chat' && (
					<ChatWindow onClose={() => setActiveView('home')} />
				)}
				{activeView === 'gallery' && (
					<Gallery onClose={() => setActiveView('home')} />
				)}
				{activeView === 'stylescan' && (
					<StyleScan onClose={() => setActiveView('home')} />
				)}
				{activeView === 'tryon' && (
					<VirtualTryOn onClose={() => setActiveView('home')} />
				)}
				{activeView === 'tara' && (
					<TaraStylist onClose={() => setActiveView('home')} />
				)}
			</AnimatePresence>
		</div>
	);
}

export default App;
