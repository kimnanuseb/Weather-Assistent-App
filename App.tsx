import React, { useState, useEffect, useCallback } from 'react';
import { Search, MapPin, Loader2, Bell, Share2, BellRing } from 'lucide-react';
import { WeatherService } from './services/weatherService';
import { CurrentWeather, ForecastData } from './types';
import { getBackgroundClass, getWeatherIcon } from './utils/iconMap';
import HourlyChart from './components/HourlyChart';
import DetailsGrid from './components/DetailsGrid';
import ForecastList from './components/ForecastList';
import WeatherVisuals from './components/WeatherVisuals';
import { DEFAULT_API_KEY } from './constants';

const App: React.FC = () => {
  // State
  const [query, setQuery] = useState('');
  const [weather, setWeather] = useState<CurrentWeather | null>(null);
  const [forecast, setForecast] = useState<ForecastData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notifsEnabled, setNotifsEnabled] = useState(false);

  // Initialize Service
  const fetchWeatherData = useCallback(async (searchCity?: string, coords?: { lat: number; lon: number }) => {
    setLoading(true);
    setError(null);
    
    const service = new WeatherService(DEFAULT_API_KEY);

    try {
      let weatherData: CurrentWeather;
      let forecastData: ForecastData;

      if (coords) {
        weatherData = await service.getCurrentWeatherByCoords(coords.lat, coords.lon);
        forecastData = await service.getForecastByCoords(coords.lat, coords.lon);
      } else if (searchCity) {
        weatherData = await service.getCurrentWeather(searchCity);
        forecastData = await service.getForecast(searchCity);
      } else {
        throw new Error('No location provided');
      }

      setWeather(weatherData);
      setForecast(forecastData);
      
      if (notifsEnabled && Notification.permission === 'granted') {
         new Notification(`Weather in ${weatherData.name}`, {
            body: `It's currently ${Math.round(weatherData.main.temp)}°C with ${weatherData.weather[0].description}.`,
            icon: 'https://cdn-icons-png.flaticon.com/512/4052/4052984.png'
         });
      }

    } catch (err: any) {
      setError(err.message === 'City not found' ? 'City not found. Please try again.' : err.message);
    } finally {
      setLoading(false);
    }
  }, [notifsEnabled]);

  const handleLocationClick = useCallback(() => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchWeatherData(undefined, {
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });
        },
        (err) => {
          setLoading(false);
          setError("Location access denied. Please search manually.");
          if (!weather) fetchWeatherData("London"); 
        }
      );
    } else {
      setError("Geolocation is not supported by this browser.");
    }
  }, [fetchWeatherData, weather]);

  const enableNotifications = async () => {
    if (!('Notification' in window)) {
      alert("This browser does not support notifications.");
      return;
    }
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      setNotifsEnabled(true);
      new Notification("Notifications Enabled", { body: "We'll let you know about the weather!" });
    }
  };

  const handleShare = async () => {
    if (weather && navigator.share) {
      try {
        await navigator.share({
          title: `Weather in ${weather.name}`,
          text: `It's currently ${Math.round(weather.main.temp)}°C and ${weather.weather[0].description} in ${weather.name}. Check it out!`,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Share failed', err);
      }
    } else {
      alert("Sharing is not supported on this device/browser.");
    }
  };

  useEffect(() => {
    handleLocationClick();
    if (Notification.permission === 'granted') setNotifsEnabled(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) fetchWeatherData(query);
  };

  const bgClass = weather ? getBackgroundClass(weather.weather[0].main) : 'from-gray-800 to-gray-900';

  return (
    <div className={`min-h-screen w-full bg-gradient-to-br ${bgClass} transition-all duration-1000 flex items-center justify-center p-4 sm:p-6 lg:p-8 overflow-x-hidden relative`}>
      
      {weather && <WeatherVisuals condition={weather.weather[0].main} />}
      
      {!weather && (
        <>
          <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-white/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-black/20 rounded-full blur-[80px] pointer-events-none" />
        </>
      )}

      {/* MAX WIDTH CONTAINER - Expanded for Desktop */}
      <div className="w-full max-w-md lg:max-w-7xl z-10">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start">
          
          {/* --- LEFT COLUMN (Sidebar / Current Status) --- */}
          <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-6 w-full">
             
             {/* Header & Search */}
             <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-4 rounded-3xl shadow-2xl transition-all duration-500">
                <header className="flex justify-between items-center mb-6 px-2">
                  <div>
                    <h1 className="text-white font-bold text-xl tracking-tight">Weather Assistant</h1>
                    <p className="text-white/60 text-xs">Powered by Giovanni Nanuseb</p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={enableNotifications}
                      className={`p-2 rounded-full transition-all ${notifsEnabled ? 'bg-white/20 text-yellow-300' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}
                      title={notifsEnabled ? "Notifications On" : "Enable Notifications"}
                    >
                      {notifsEnabled ? <BellRing size={20} /> : <Bell size={20} />}
                    </button>
                    <button 
                      onClick={handleShare}
                      className="p-2 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white rounded-full transition-all"
                      title="Share Weather"
                    >
                      <Share2 size={20} />
                    </button>
                  </div>
                </header>

                <form onSubmit={handleSearch} className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search city..."
                      className="w-full bg-black/20 text-white placeholder-white/40 rounded-xl py-3 pl-10 pr-4 outline-none border border-transparent focus:border-white/30 focus:bg-black/30 transition-all"
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" size={18} />
                  </div>
                  <button 
                    type="button" 
                    onClick={handleLocationClick}
                    className="bg-white/10 hover:bg-white/20 text-white p-3 rounded-xl border border-white/10 transition-all active:scale-95"
                  >
                    <MapPin size={20} />
                  </button>
                  <button 
                    type="submit" 
                    className="bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 text-white font-semibold py-3 px-6 rounded-xl shadow-lg shadow-blue-500/30 transition-all active:scale-95"
                  >
                    Go
                  </button>
                </form>
             </div>

             {/* Loading / Error / Current Weather */}
             {loading && (
               <div className="flex justify-center py-20 bg-white/5 rounded-3xl backdrop-blur-md">
                 <Loader2 className="animate-spin text-white" size={48} />
               </div>
             )}

             {error && !loading && (
               <div className="bg-red-500/20 border border-red-500/50 text-white p-4 rounded-2xl text-center backdrop-blur-md">
                 <p>{error}</p>
               </div>
             )}

             {!loading && weather && (
               <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 flex flex-col gap-6">
                 
                 {/* Main Weather Card */}
                 <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[2rem] p-8 text-center shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-50" />
                    
                    <div className="flex flex-col items-center">
                      <div className="mb-4 p-4 bg-white/10 rounded-full shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                        {getWeatherIcon(weather.weather[0].main, 64)}
                      </div>
                      
                      <h2 className="text-4xl font-bold text-white mb-1 drop-shadow-md">
                        {Math.round(weather.main.temp)}°
                      </h2>
                      <p className="text-xl text-white/90 font-medium capitalize mb-1">
                        {weather.weather[0].description}
                      </p>
                      <div className="flex items-center gap-2 text-white/60 text-sm">
                        <MapPin size={14} />
                        <span>{weather.name}, {weather.sys.country}</span>
                      </div>
                      
                      <div className="flex gap-4 mt-6 w-full justify-center">
                        <div className="text-center">
                            <p className="text-white/50 text-xs uppercase">Low</p>
                            <p className="text-white font-semibold">{Math.round(weather.main.temp_min)}°</p>
                        </div>
                        <div className="w-px bg-white/10 h-8 self-center" />
                        <div className="text-center">
                            <p className="text-white/50 text-xs uppercase">High</p>
                            <p className="text-white font-semibold">{Math.round(weather.main.temp_max)}°</p>
                        </div>
                        <div className="w-px bg-white/10 h-8 self-center" />
                        <div className="text-center">
                            <p className="text-white/50 text-xs uppercase">Feels</p>
                            <p className="text-white font-semibold">{Math.round(weather.main.feels_like)}°</p>
                        </div>
                      </div>
                    </div>
                 </div>

                 {/* Stats Grid */}
                 <DetailsGrid weather={weather} />
               </div>
             )}
          </div>

          {/* --- RIGHT COLUMN (Charts / Forecast) --- */}
          <div className="lg:col-span-7 xl:col-span-8 w-full flex flex-col gap-6">
             {!loading && weather && forecast && (
               <div className="animate-in fade-in slide-in-from-right-8 duration-700 flex flex-col gap-6 h-full">
                  {/* Hourly Chart - Enhanced Height for Desktop */}
                  <div className="flex-1 min-h-[300px]">
                     <HourlyChart data={forecast} />
                  </div>
                  
                  {/* Forecast List - Enhanced Grid for Desktop */}
                  <ForecastList data={forecast} />
               </div>
             )}
             
             {/* Empty State Desktop */}
             {!loading && !weather && (
               <div className="hidden lg:flex h-full items-center justify-center bg-white/5 rounded-3xl border border-white/10 backdrop-blur-sm p-12 text-center">
                  <div className="text-white/30">
                    <Search size={64} className="mx-auto mb-4 opacity-50" />
                    <h3 className="text-xl font-medium">No City Selected</h3>
                    <p className="text-sm">Search for a location to view detailed analytics and forecasts.</p>
                  </div>
               </div>
             )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default App;