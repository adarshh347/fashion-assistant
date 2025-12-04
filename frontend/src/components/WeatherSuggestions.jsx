import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MapPin,
    Thermometer,
    Droplets,
    Wind,
    Cloud,
    Sun,
    CloudRain,
    Snowflake,
    Shirt,
    Footprints,
    Glasses,
    Umbrella,
    ChevronDown,
    Sparkles
} from 'lucide-react';

const WeatherSuggestions = () => {
    const [location, setLocation] = useState(null);
    const [weather, setWeather] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expanded, setExpanded] = useState(false);

    useEffect(() => {
        fetchLocationAndWeather();
    }, []);

    const fetchLocationAndWeather = async () => {
        try {
            setLoading(true);
            setError(null);

            // Get user's location using Geolocation API
            if (!navigator.geolocation) {
                throw new Error('Geolocation is not supported by your browser');
            }

            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;

                    // Reverse geocoding to get location name
                    const geoResponse = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
                    );
                    const geoData = await geoResponse.json();

                    const locationName = geoData.address.city ||
                        geoData.address.town ||
                        geoData.address.village ||
                        geoData.address.county ||
                        'Unknown Location';

                    setLocation({
                        name: locationName,
                        country: geoData.address.country,
                        lat: latitude,
                        lon: longitude
                    });

                    // Fetch weather data from Open-Meteo
                    const weatherResponse = await fetch(
                        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&timezone=auto`
                    );
                    const weatherData = await weatherResponse.json();

                    setWeather({
                        temperature: Math.round(weatherData.current.temperature_2m),
                        feelsLike: Math.round(weatherData.current.apparent_temperature),
                        humidity: weatherData.current.relative_humidity_2m,
                        windSpeed: Math.round(weatherData.current.wind_speed_10m),
                        precipitation: weatherData.current.precipitation,
                        weatherCode: weatherData.current.weather_code
                    });

                    setLoading(false);
                },
                (error) => {
                    setError('Unable to retrieve your location. Please enable location services.');
                    setLoading(false);
                }
            );
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    const getWeatherIcon = (code) => {
        // WMO Weather interpretation codes
        if (code === 0) return <Sun className="text-yellow-400" size={32} />;
        if (code <= 3) return <Cloud className="text-gray-300" size={32} />;
        if (code <= 67) return <CloudRain className="text-blue-400" size={32} />;
        if (code <= 77) return <Snowflake className="text-blue-200" size={32} />;
        return <Cloud className="text-gray-400" size={32} />;
    };

    const getWeatherDescription = (code) => {
        if (code === 0) return 'Clear Sky';
        if (code <= 3) return 'Partly Cloudy';
        if (code <= 67) return 'Rainy';
        if (code <= 77) return 'Snowy';
        return 'Cloudy';
    };

    const getFashionSuggestions = () => {
        if (!weather) return [];

        const temp = weather.temperature;
        const isRaining = weather.precipitation > 0;
        const isWindy = weather.windSpeed > 20;

        const suggestions = [];

        // Temperature-based suggestions
        if (temp < 10) {
            suggestions.push({
                category: 'Outerwear',
                icon: Shirt,
                items: ['Heavy Coat', 'Wool Jacket', 'Puffer Jacket'],
                color: 'from-blue-500 to-blue-700',
                description: 'Layer up with warm, insulated pieces'
            });
            suggestions.push({
                category: 'Accessories',
                icon: Glasses,
                items: ['Scarf', 'Gloves', 'Beanie'],
                color: 'from-purple-500 to-purple-700',
                description: 'Essential cold-weather accessories'
            });
        } else if (temp < 20) {
            suggestions.push({
                category: 'Outerwear',
                icon: Shirt,
                items: ['Light Jacket', 'Cardigan', 'Hoodie'],
                color: 'from-teal-500 to-teal-700',
                description: 'Comfortable layers for mild weather'
            });
            suggestions.push({
                category: 'Bottoms',
                icon: Footprints,
                items: ['Jeans', 'Chinos', 'Long Pants'],
                color: 'from-indigo-500 to-indigo-700',
                description: 'Versatile options for cool days'
            });
        } else if (temp < 30) {
            suggestions.push({
                category: 'Tops',
                icon: Shirt,
                items: ['T-Shirt', 'Light Shirt', 'Polo'],
                color: 'from-green-500 to-green-700',
                description: 'Breathable and comfortable choices'
            });
            suggestions.push({
                category: 'Bottoms',
                icon: Footprints,
                items: ['Shorts', 'Light Pants', 'Skirt'],
                color: 'from-yellow-500 to-yellow-700',
                description: 'Stay cool and stylish'
            });
        } else {
            suggestions.push({
                category: 'Summer Wear',
                icon: Sun,
                items: ['Tank Top', 'Shorts', 'Sundress'],
                color: 'from-orange-500 to-red-600',
                description: 'Beat the heat with light fabrics'
            });
            suggestions.push({
                category: 'Protection',
                icon: Glasses,
                items: ['Sunglasses', 'Hat', 'Sunscreen'],
                color: 'from-pink-500 to-pink-700',
                description: 'Essential sun protection'
            });
        }

        // Weather condition-based suggestions
        if (isRaining) {
            suggestions.push({
                category: 'Rain Gear',
                icon: Umbrella,
                items: ['Umbrella', 'Raincoat', 'Waterproof Boots'],
                color: 'from-blue-600 to-cyan-600',
                description: 'Stay dry in wet conditions'
            });
        }

        if (isWindy) {
            suggestions.push({
                category: 'Wind Protection',
                icon: Wind,
                items: ['Windbreaker', 'Fitted Clothing', 'Hair Ties'],
                color: 'from-slate-500 to-slate-700',
                description: 'Secure your style against the wind'
            });
        }

        return suggestions.slice(0, 4); // Return max 4 suggestions
    };

    if (loading) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-xl mx-auto mt-8 p-8 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10"
            >
                <div className="flex items-center justify-center gap-3">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                        <Sparkles className="text-teal-400" size={24} />
                    </motion.div>
                    <p className="text-white/70">Fetching your location and weather...</p>
                </div>
            </motion.div>
        );
    }

    if (error) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-xl mx-auto mt-8 p-6 rounded-3xl bg-red-500/10 backdrop-blur-xl border border-red-500/20"
            >
                <p className="text-red-300 text-center">{error}</p>
                <button
                    onClick={fetchLocationAndWeather}
                    className="mt-4 mx-auto block px-6 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-full text-white transition-colors"
                >
                    Retry
                </button>
            </motion.div>
        );
    }

    const suggestions = getFashionSuggestions();

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="w-full max-w-xl mx-auto mt-8"
        >
            {/* Weather Info Box */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 shadow-2xl">
                {/* Header with Location and Weather */}
                <div className="p-6 border-b border-white/10">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <MapPin className="text-teal-400" size={20} />
                                <h3 className="text-xl font-semibold text-white">
                                    {location?.name}
                                </h3>
                            </div>
                            <p className="text-sm text-white/60">{location?.country}</p>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <div className="text-4xl font-bold text-white">
                                    {weather?.temperature}°C
                                </div>
                                <div className="text-sm text-white/60">
                                    Feels like {weather?.feelsLike}°C
                                </div>
                            </div>
                            <div>
                                {getWeatherIcon(weather?.weatherCode)}
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 text-sm text-white/80 font-medium">
                        {getWeatherDescription(weather?.weatherCode)}
                    </div>

                    {/* Weather Stats */}
                    <div className="grid grid-cols-3 gap-4 mt-6">
                        <div className="flex items-center gap-2 p-3 rounded-xl bg-white/5">
                            <Droplets className="text-blue-400" size={18} />
                            <div>
                                <div className="text-xs text-white/60">Humidity</div>
                                <div className="text-sm font-semibold text-white">{weather?.humidity}%</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 p-3 rounded-xl bg-white/5">
                            <Wind className="text-cyan-400" size={18} />
                            <div>
                                <div className="text-xs text-white/60">Wind</div>
                                <div className="text-sm font-semibold text-white">{weather?.windSpeed} km/h</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 p-3 rounded-xl bg-white/5">
                            <Thermometer className="text-orange-400" size={18} />
                            <div>
                                <div className="text-xs text-white/60">Temp</div>
                                <div className="text-sm font-semibold text-white">{weather?.temperature}°C</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Suggestions Toggle Button */}
                <button
                    onClick={() => setExpanded(!expanded)}
                    className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
                >
                    <div className="flex items-center gap-2">
                        <Sparkles className="text-teal-400" size={20} />
                        <span className="text-white font-medium">Fashion Suggestions for Today</span>
                    </div>
                    <motion.div
                        animate={{ rotate: expanded ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <ChevronDown className="text-white/60" size={20} />
                    </motion.div>
                </button>

                {/* Expandable Suggestions */}
                <AnimatePresence>
                    {expanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                        >
                            <div className="p-6 pt-0 grid grid-cols-2 gap-4">
                                {suggestions.map((suggestion, index) => (
                                    <motion.div
                                        key={suggestion.category}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: index * 0.1 }}
                                        className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${suggestion.color} p-4 shadow-lg hover:scale-105 transition-transform cursor-pointer group`}
                                    >
                                        {/* Background Pattern */}
                                        <div className="absolute inset-0 opacity-10">
                                            <div className="absolute top-0 right-0 w-20 h-20 bg-white rounded-full blur-2xl"></div>
                                            <div className="absolute bottom-0 left-0 w-16 h-16 bg-white rounded-full blur-xl"></div>
                                        </div>

                                        {/* Content */}
                                        <div className="relative z-10">
                                            <div className="flex items-center gap-2 mb-3">
                                                <suggestion.icon className="text-white" size={24} />
                                                <h4 className="text-white font-bold text-sm">
                                                    {suggestion.category}
                                                </h4>
                                            </div>

                                            <p className="text-white/90 text-xs mb-3 leading-relaxed">
                                                {suggestion.description}
                                            </p>

                                            <div className="space-y-1">
                                                {suggestion.items.map((item, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="flex items-center gap-2 text-white/80 text-xs"
                                                    >
                                                        <div className="w-1.5 h-1.5 rounded-full bg-white/60"></div>
                                                        <span>{item}</span>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Hover Effect */}
                                            <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors rounded-2xl"></div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Call to Action */}
                            <div className="px-6 pb-6">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-semibold shadow-lg hover:shadow-xl transition-shadow"
                                >
                                    Get Personalized Recommendations
                                </motion.button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

export default WeatherSuggestions;
