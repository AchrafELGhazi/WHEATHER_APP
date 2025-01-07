import { useState } from 'react';
import {
  Search,
  Cloud,
  Wind,
  Droplets,
  Thermometer,
  Sun,
  Moon,
  CloudRain,
  Github,
  Linkedin,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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

function App(): JSX.Element {
  const [city, setCity] = useState<string>('');
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  async function fetchWeather(city: string): Promise<void> {
    setLoading(true);
    setError('');
    try {
      const APIKey = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=77bbc76e9841ef77d3a3f18212d6d187&units=metric`;
      const response = await fetch(APIKey);
      if (!response.ok) {
        throw new Error(
          'City not found. Please check the spelling and try again.'
        );
      }
      const data: WeatherData = await response.json();
      setWeatherData(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (city.trim()) {
      fetchWeather(city);
    }
  };

  const getWeatherIcon = (description: string) => {
    if (description.includes('rain'))
      return <CloudRain className='h-12 w-12 text-blue-500' />;
    if (description.includes('cloud'))
      return <Cloud className='h-12 w-12 text-gray-500' />;
    return <Sun className='h-12 w-12 text-yellow-500' />;
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

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center p-6'>
      <div className='w-full max-w-3xl'>
        <header className='text-center mb-12'>
          <h1 className='text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2'>
            Weather Dashboard
          </h1>
          <p className='text-gray-600'>
            Good {getTimeOfDay()}! Check the weather anywhere in the world.
          </p>
        </header>

        <form onSubmit={handleSubmit} className='relative mb-8 group'>
          <div className='absolute inset-0 bg-blue-500 opacity-20 blur-xl group-hover:opacity-30 transition-opacity rounded-2xl'></div>
          <input
            type='text'
            value={city}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setCity(e.target.value)
            }
            placeholder='Search for a city...'
            className='w-full p-4 pl-12 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700'
          />
          <Search className='absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5' />
          <button
            type='submit'
            disabled={loading}
            className='absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {loading ? 'Loading...' : 'Search'}
          </button>
        </form>

        {error && (
          <div className='text-red-500 text-center mb-4 p-4 bg-red-50 rounded-xl'>
            {error}
          </div>
        )}

        {weatherData && (
          <Card className='bg-white/80 backdrop-blur-sm border-none shadow-xl overflow-hidden'>
            <CardHeader className='bg-gradient-to-r from-blue-500/10 to-indigo-500/10'>
              <CardTitle className='text-2xl text-center space-y-2'>
                <div className='flex items-center justify-center gap-4'>
                  {getWeatherIcon(weatherData.weather[0].description)}
                  <div>
                    <div className='text-3xl font-bold text-gray-800'>
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
                <div className='flex flex-col items-center justify-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl'>
                  <Thermometer className='h-8 w-8 text-blue-600 mb-2' />
                  <div className='text-5xl font-bold text-gray-800 mb-2'>
                    {Math.round(weatherData.main.temp)}°C
                  </div>
                  <div className='text-sm text-gray-600'>
                    Feels like {Math.round(weatherData.main.feels_like)}°C
                  </div>
                </div>

                <div className='grid grid-cols-2 gap-4'>
                  <div className='flex flex-col items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors'>
                    <Wind className='h-6 w-6 text-gray-600 mb-2' />
                    <div className='text-sm font-medium'>
                      {weatherData.wind.speed} m/s
                    </div>
                    <div className='text-xs text-gray-500'>Wind</div>
                  </div>
                  <div className='flex flex-col items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors'>
                    <Droplets className='h-6 w-6 text-gray-600 mb-2' />
                    <div className='text-sm font-medium'>
                      {weatherData.main.humidity}%
                    </div>
                    <div className='text-xs text-gray-500'>Humidity</div>
                  </div>
                  <div className='flex flex-col items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors'>
                    <Sun className='h-6 w-6 text-gray-600 mb-2' />
                    <div className='text-sm font-medium'>
                      {formatTime(weatherData.sys.sunrise)}
                    </div>
                    <div className='text-xs text-gray-500'>Sunrise</div>
                  </div>
                  <div className='flex flex-col items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors'>
                    <Moon className='h-6 w-6 text-gray-600 mb-2' />
                    <div className='text-sm font-medium'>
                      {formatTime(weatherData.sys.sunset)}
                    </div>
                    <div className='text-xs text-gray-500'>Sunset</div>
                  </div>
                </div>

                <div className='md:col-span-2 grid grid-cols-2 gap-4'>
                  <div className='flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors'>
                    <div>
                      <div className='text-sm text-gray-500'>Min Temp</div>
                      <div className='text-lg font-medium'>
                        {Math.round(weatherData.main.temp_min)}°C
                      </div>
                    </div>
                    <Thermometer className='h-6 w-6 text-blue-600' />
                  </div>
                  <div className='flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors'>
                    <div>
                      <div className='text-sm text-gray-500'>Max Temp</div>
                      <div className='text-lg font-medium'>
                        {Math.round(weatherData.main.temp_max)}°C
                      </div>
                    </div>
                    <Thermometer className='h-6 w-6 text-red-600' />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <footer className='mt-12 text-center'>
          <div className='mb-4 flex justify-center gap-4'>
            <a
              href='https://github.com/AchrafELGhazi'
              target='_blank'
              rel='noopener noreferrer'
              className='text-gray-600 hover:text-blue-600 transition-colors'
            >
              <Github className='h-6 w-6' />
            </a>
            <a
              href='https://www.linkedin.com/in/achraf-el-ghazi-16b8bb2a7/'
              target='_blank'
              rel='noopener noreferrer'
              className='text-gray-600 hover:text-blue-600 transition-colors'
            >
              <Linkedin className='h-6 w-6' />
            </a>
          </div>
          <p className='text-gray-600 text-sm'>
            © {new Date().getFullYear()} Weather Dashboard. All rights reserved.
            <br />
            Made with ❤️ by Achraf EL GHAZI
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;
