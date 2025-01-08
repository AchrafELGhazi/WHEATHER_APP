import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface WeatherData {
  name: string;
  sys: {
    country: string;
    sunrise: number;
    sunset: number;
  };
  weather: Array<{
    description: string;
    main: string;
    icon: string;
  }>;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
  };
  wind: {
    speed: number;
    deg: number;
  };
  clouds: {
    all: number;
  };
  visibility: number;
  dt: number;
}

interface ForecastData {
  dt: number;
  temp: {
    day: number;
    min: number;
    max: number;
  };
  weather: Array<{
    description: string;
    main: string;
  }>;
}

interface AirQualityData {
  main: {
    aqi: number;
  };
  components: {
    pm2_5: number;
    pm10: number;
    no2: number;
  };
}

function App(): JSX.Element {
  const [city, setCity] = useState<string>('');
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [forecastData,] = useState<ForecastData[]>([]);
  const [airQuality] = useState<AirQualityData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [showWelcome, setShowWelcome] = useState<boolean>(true);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    const saved = localStorage.getItem('recentSearches');
    return saved ? JSON.parse(saved) : [];
  });
  const [favoriteLocations] = useState<string[]>(() => {
    const saved = localStorage.getItem('favoriteLocations');
    return saved ? JSON.parse(saved) : [];
  });
  const [unit, setUnit] = useState<'metric' | 'imperial'>('metric');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [selectedTab ] = useState('current');

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWelcome(false);
    }, 2000);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        position => {
          fetchWeatherByCoords(
            position.coords.latitude,
            position.coords.longitude
          );
        },
        err => {
          console.error("Couldn't get location:", err);
        }
      );
    }

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    localStorage.setItem('recentSearches', JSON.stringify(recentSearches));
  }, [recentSearches]);

  const fetchWeatherByCoords = async (lat: number, lon: number) => {
    setLoading(true);
    setError('');
    try {
      const APIKey = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=77bbc76e9841ef77d3a3f18212d6d187&units=${unit}`;
      const response = await fetch(APIKey);
      if (!response.ok) throw new Error('Location not found.');
      const data: WeatherData = await response.json();
      setWeatherData(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getAirQualityDescription = (aqi: number) => {
    const levels = ['Good', 'Fair', 'Moderate', 'Poor', 'Very Poor'];
    return levels[aqi - 1] || 'Unknown';
  };

  const WeatherAlert = ({ data }: { data: WeatherData }) => {
    if (data.main.temp > 30 && unit === 'metric') {
      return (
        <Alert className='mb-4 border-orange-200 bg-orange-50'>
          <AlertDescription className='text-orange-800'>
            🌡️ High temperature alert! Stay hydrated and avoid prolonged sun
            exposure.
          </AlertDescription>
        </Alert>
      );
    }
    return null;
  };

  const ForecastCard = ({ data }: { data: ForecastData }) => {
    return (
      <div
        className={`p-4 rounded-xl ${
          theme === 'dark' ? 'bg-gray-700/50' : 'bg-white/80'
        }`}
      >
        <div className='text-center'>
          <div className='text-lg font-medium'>
            {new Date(data.dt * 1000).toLocaleDateString('en-US', {
              weekday: 'short',
            })}
          </div>
          <div className='text-3xl my-2'>
            {getWeatherIcon(data.weather[0].description)}
          </div>
          <div className='text-sm'>
            <span className='font-medium'>{Math.round(data.temp.max)}°</span>
            <span className='text-gray-500 ml-2'>
              {Math.round(data.temp.min)}°
            </span>
          </div>
        </div>
      </div>
    );
  };

  // Air quality card component
  const AirQualityCard = ({ data }: { data: AirQualityData }) => {
    return (
      <div
        className={`p-4 rounded-xl ${
          theme === 'dark' ? 'bg-gray-700/50' : 'bg-white/80'
        }`}
      >
        <h3 className='text-lg font-medium mb-2'>Air Quality</h3>
        <div className='space-y-2'>
          <div className='flex justify-between'>
            <span>Status:</span>
            <span className='font-medium'>
              {getAirQualityDescription(data.main.aqi)}
            </span>
          </div>
          <div className='flex justify-between'>
            <span>PM2.5:</span>
            <span>{Math.round(data.components.pm2_5)} µg/m³</span>
          </div>
          <div className='flex justify-between'>
            <span>PM10:</span>
            <span>{Math.round(data.components.pm10)} µg/m³</span>
          </div>
        </div>
      </div>
    );
  };

  if (showWelcome) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100'>
        <div className='text-center animate-fade-in'>
          <h1 className='text-6xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4'>
            Atmosense
          </h1>
          <p className='text-gray-600 text-xl animate-pulse'>
            Your Intelligent Weather Companion
          </p>
        </div>
      </div>
    );
  }
  const getWeatherIcon = (description: string) => {
    const iconClass = 'text-4xl animate-bounce-slow';
    if (description.includes('rain'))
      return <span className={iconClass}>🌧️</span>;
    if (description.includes('cloud'))
      return <span className={iconClass}>☁️</span>;
    if (description.includes('snow'))
      return <span className={iconClass}>❄️</span>;
    if (description.includes('thunder'))
      return <span className={iconClass}>⛈️</span>;
    if (description.includes('mist') || description.includes('fog'))
      return <span className={iconClass}>🌫️</span>;
    return <span className={iconClass}>☀️</span>;
  };

  const formatTime = (timestamp: number): string => {
    return new Date(timestamp * 1000).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTimeOfDay = (): string => {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    return 'evening';
  };

  const toggleUnit = () => {
    setUnit(prev => (prev === 'metric' ? 'imperial' : 'metric'));
    if (weatherData) {
      fetchWeather(weatherData.name);
    }
  };
  async function fetchWeather(city: string): Promise<void> {
    setLoading(true);
    setError('');
    try {
      const APIKey = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=77bbc76e9841ef77d3a3f18212d6d187&units=${unit}`;
      const response = await fetch(APIKey);
      if (!response.ok) {
        throw new Error(
          'City not found. Please check the spelling and try again.'
        );
      }
      const data: WeatherData = await response.json();
      setWeatherData(data);

      if (!recentSearches.includes(city)) {
        setRecentSearches(prev => [city, ...prev].slice(0, 5));
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }
  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (city.trim()) {
      fetchWeather(city);
    }
  };

  return (
    // ... (previous welcome screen and header remain the same)

    <main className='w-full max-w-4xl mx-auto p-6'>
      {/* ... (previous search form remains the same) */}
      <header className='text-center mb-12'>
        <h1 className='text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2'>
          Atmosense
        </h1>
        <p
          className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}
        >
          Good {getTimeOfDay()}! Experience weather with intelligence.
        </p>

        <div className='flex justify-center gap-4 mt-4'>
          <button
            onClick={toggleUnit}
            className='px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors'
          >
            {unit === 'metric' ? '°C' : '°F'}
          </button>
          <button
            onClick={toggleTheme}
            className='px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors'
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        </div>
      </header>
      <form onSubmit={handleSubmit} className='relative mb-8 group'>
        <div className='absolute inset-0 bg-blue-500 opacity-20 blur-xl group-hover:opacity-30 transition-opacity rounded-2xl'></div>
        <div className='relative flex'>
          <input
            type='text'
            value={city}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setCity(e.target.value)
            }
            placeholder='Search for a city...'
            className={`w-full p-4 pl-12 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              theme === 'dark'
                ? 'bg-gray-800/80 text-white border-gray-700'
                : 'bg-white/80 text-gray-700'
            }`}
          />
          <span className='absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400'>
            🔍
          </span>
          <button
            type='submit'
            disabled={loading}
            className='absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {loading ? 'Loading...' : 'Search'}
          </button>
        </div>
      </form>

      {recentSearches.length > 0 && (
        <div
          className={`mb-8 p-4 rounded-xl ${
            theme === 'dark' ? 'bg-gray-800/50' : 'bg-white/50'
          }`}
        >
          <h3 className='text-lg font-semibold mb-2'>Recent Searches</h3>
          <div className='flex flex-wrap gap-2'>
            {recentSearches.map((search, index) => (
              <button
                key={index}
                onClick={() => fetchWeather(search)}
                className='px-3 py-1 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors flex items-center gap-2'
              >
                <span>⏱️</span>
                {search}
              </button>
            ))}
          </div>
        </div>
      )}
      {weatherData && (
        <Tabs defaultValue={selectedTab} className='w-full mt-8'>
          <TabsList className='grid w-full grid-cols-3'>
            <TabsTrigger value='current'>Current</TabsTrigger>
            <TabsTrigger value='forecast'>5-Day Forecast</TabsTrigger>
            <TabsTrigger value='details'>Details</TabsTrigger>
          </TabsList>

          <TabsContent value='current'>
            <Card
              className={`overflow-hidden transition-colors duration-300 ${
                theme === 'dark'
                  ? 'bg-gray-800/80 border-gray-700'
                  : 'bg-white/80 border-none'
              }`}
            >
              <CardHeader
                className={`${
                  theme === 'dark'
                    ? 'bg-gray-700/50'
                    : 'bg-gradient-to-r from-blue-500/10 to-indigo-500/10'
                }`}
              >
                <CardTitle className='text-2xl text-center space-y-2'>
                  <div className='flex items-center justify-center gap-4'>
                    {getWeatherIcon(weatherData.weather[0].description)}
                    <div>
                      <div
                        className={`text-3xl font-bold ${
                          theme === 'dark' ? 'text-white' : 'text-gray-800'
                        }`}
                      >
                        {weatherData.name}, {weatherData.sys.country}
                      </div>
                      <div className='text-xl font-medium text-blue-600 capitalize'>
                        {weatherData.weather[0].description}
                      </div>
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className='p-6'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  <div
                    className={`flex flex-col items-center justify-center p-6 rounded-2xl transition-colors ${
                      theme === 'dark'
                        ? 'bg-gray-700/50'
                        : 'bg-gradient-to-br from-blue-50 to-indigo-50'
                    }`}
                  >
                    <span className='text-2xl mb-2'>🌡️</span>
                    <div
                      className={`text-5xl font-bold mb-2 ${
                        theme === 'dark' ? 'text-white' : 'text-gray-800'
                      }`}
                    >
                      {Math.round(weatherData.main.temp)}°
                      {unit === 'metric' ? 'C' : 'F'}
                    </div>
                    <div
                      className={
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                      }
                    >
                      Feels like {Math.round(weatherData.main.feels_like)}°
                      {unit === 'metric' ? 'C' : 'F'}
                    </div>
                  </div>

                  <div className='grid grid-cols-2 gap-4'>
                    {[
                      {
                        icon: '💨',
                        value: `${weatherData.wind.speed} ${
                          unit === 'metric' ? 'm/s' : 'mph'
                        }`,
                        label: 'Wind',
                        direction: `${weatherData.wind.deg}°`,
                      },
                      {
                        icon: '💧',
                        value: `${weatherData.main.humidity}%`,
                        label: 'Humidity',
                      },
                      {
                        icon: '🌅',
                        value: formatTime(weatherData.sys.sunrise),
                        label: 'Sunrise',
                      },
                      {
                        icon: '🌇',
                        value: formatTime(weatherData.sys.sunset),
                        label: 'Sunset',
                      },
                    ].map((item, index) => (
                      <div
                        key={index}
                        className={`flex flex-col items-center p-4 rounded-xl transition-colors ${
                          theme === 'dark'
                            ? 'bg-gray-700/50 hover:bg-gray-600/50'
                            : 'bg-gray-50 hover:bg-gray-100'
                        }`}
                      >
                        <div className='text-2xl mb-2'>{item.icon}</div>
                        <div className='text-sm font-medium'>{item.value}</div>
                        <div
                          className={`text-xs ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                          }`}
                        >
                          {item.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>{' '}
            {airQuality && <AirQualityCard data={airQuality} />}
            <WeatherAlert data={weatherData} />
          </TabsContent>

          <TabsContent value='forecast'>
            <div className='grid grid-cols-5 gap-4'>
              {forecastData.map((day, index) => (
                <ForecastCard key={index} data={day} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value='details'>
            <Card>
              <CardContent className='p-6'>
                <div className='grid grid-cols-2 gap-4'>
                  <div className='space-y-2'>
                    <h3 className='font-medium'>Atmospheric Conditions</h3>
                    <div className='flex justify-between'>
                      <span>Pressure</span>
                      <span>{weatherData.main.pressure} hPa</span>
                    </div>
                    <div className='flex justify-between'>
                      <span>Visibility</span>
                      <span>
                        {(weatherData.visibility / 1000).toFixed(1)} km
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span>Cloud Cover</span>
                      <span>{weatherData.clouds.all}%</span>
                    </div>
                  </div>

                  <div className='space-y-2'>
                    <h3 className='font-medium'>Wind Information</h3>
                    <div className='flex justify-between'>
                      <span>Direction</span>
                      <span>{weatherData.wind.deg}°</span>
                    </div>
                    <div className='flex justify-between'>
                      <span>Speed</span>
                      <span>
                        {weatherData.wind.speed}{' '}
                        {unit === 'metric' ? 'm/s' : 'mph'}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Favorite Locations */}
      {favoriteLocations.length > 0 && (
        <div
          className={`mt-8 p-4 rounded-xl ${
            theme === 'dark' ? 'bg-gray-800/50' : 'bg-white/50'
          }`}
        >
          <h3 className='text-lg font-semibold mb-2'>Favorite Locations</h3>
          <div className='flex flex-wrap gap-2'>
            {favoriteLocations.map((location, index) => (
              <button
                key={index}
                onClick={() => fetchWeather(location)}
                className='px-3 py-1 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors flex items-center gap-2'
              >
                <span>⭐</span>
                {location}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ... (previous footer remains the same) */}
      <footer className='mt-12 text-center'>
        <p
          className={`text-sm ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}
        >
          © {new Date().getFullYear()} Atmosense. All rights reserved.
        </p>
        Made with ❤️ by Achraf EL GHAZI
      </footer>
      {error && <div className='text-red-500'></div>}
    </main>
  );
}

export default App;
