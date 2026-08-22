// Open-Meteo is free and keyless — https://open-meteo.com
const WEATHER_CODE_MAP: Record<number, { label: string; icon: "sun" | "cloud" | "rain" | "snow" | "storm" | "fog" }> = {
  0: { label: "Clear sky", icon: "sun" },
  1: { label: "Mostly clear", icon: "sun" },
  2: { label: "Partly cloudy", icon: "cloud" },
  3: { label: "Overcast", icon: "cloud" },
  45: { label: "Foggy", icon: "fog" },
  48: { label: "Foggy", icon: "fog" },
  51: { label: "Light drizzle", icon: "rain" },
  53: { label: "Drizzle", icon: "rain" },
  55: { label: "Dense drizzle", icon: "rain" },
  61: { label: "Light rain", icon: "rain" },
  63: { label: "Rain", icon: "rain" },
  65: { label: "Heavy rain", icon: "rain" },
  71: { label: "Light snow", icon: "snow" },
  73: { label: "Snow", icon: "snow" },
  75: { label: "Heavy snow", icon: "snow" },
  80: { label: "Rain showers", icon: "rain" },
  81: { label: "Rain showers", icon: "rain" },
  82: { label: "Violent showers", icon: "rain" },
  95: { label: "Thunderstorm", icon: "storm" },
  96: { label: "Thunderstorm", icon: "storm" },
  99: { label: "Thunderstorm", icon: "storm" },
};

export function describeWeatherCode(code: number) {
  return WEATHER_CODE_MAP[code] ?? { label: "Unknown", icon: "cloud" as const };
}

export interface WeatherNow {
  temperatureC: number;
  code: number;
}

export async function fetchCurrentWeather(latitude: number, longitude: number): Promise<WeatherNow | null> {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&timezone=auto`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const json = await res.json();
    if (typeof json?.current?.temperature_2m !== "number") return null;
    return { temperatureC: json.current.temperature_2m, code: json.current.weather_code };
  } catch {
    return null;
  }
}
