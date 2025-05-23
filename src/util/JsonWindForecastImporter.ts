export interface ForecastEntry {
  datetime: string;
  value: number;
}

export interface WindForecast {
  step: string;
  forecast: ForecastEntry[];
}

export interface JsonWindForecast {
  wind_direction: WindForecast;
  wind_speed: WindForecast;
}

// Returns: Array of { datetime, direction, speed }
export function parseForecast(json: JsonWindForecast) {
  const dirMap = new Map(json.wind_direction.forecast.map(f => [f.datetime, f.value]));
  return json.wind_speed.forecast.map(s => ({
    datetime: s.datetime,
    direction: dirMap.get(s.datetime),
    speed: s.value
  })).filter(item => item.direction !== undefined);
}
