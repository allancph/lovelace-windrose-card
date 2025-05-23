import { LitElement, html } from 'lit';
import { parseForecast, JsonWindForecast } from './util/JsonWindForecastImporter';

class WindroseCard extends LitElement {
  static properties = {
    forecast: { type: Array },
  };

  constructor() {
    super();
    this.forecast = [];
  }

  setConfig(config) {
    // Automatically parse forecast if included in config
    if (config.wind_forecast) {
      this.parseAndSetForecast(config.wind_forecast);
    }
  }

  // Example: If fetching data from an entity
  set hass(hass) {
    const entity = hass.states['sensor.wind_forecast'];
    if (entity && entity.attributes && entity.attributes.forecast_json) {
      this.parseAndSetForecast(JSON.parse(entity.attributes.forecast_json));
    }
  }

  parseAndSetForecast(json) {
    try {
      this.forecast = parseForecast(json);
    } catch (e) {
      console.error('Failed to parse wind forecast', e);
      this.forecast = [];
    }
  }

  render() {
    return html`
      <div>
        ${this.forecast.length === 0
          ? html`<div>No forecast data</div>`
          : this.forecast.map(f => html`
              <div>${f.datetime}: ${f.direction}° @ ${f.speed} m/s</div>
            `)
        }
      </div>
    `;
  }
}

customElements.define('windrose-card', WindroseCard);
