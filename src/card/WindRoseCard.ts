import { LitElement, html, css } from "lit";
import { property, customElement } from "lit/decorators.js";
import { parseForecast, JsonWindForecast } from "../util/JsonWindForecastImporter";

@customElement("windrose-card")
export class WindRoseCard extends LitElement {
  @property({ attribute: false }) public hass: any;
  @property({ attribute: false }) public config: any;
  @property({ type: Array }) forecast: Array<{ datetime: string; direction: number; speed: number }> = [];

  static styles = css`
    :host {
      display: block;
      padding: 16px;
    }
    .error {
      color: red;
      font-weight: bold;
    }
  `;

  setConfig(config: any): void {
    this.config = config;
    this._processForecast();
  }

  set hassInstance(hass: any) {
    this.hass = hass;
    this._processForecast();
  }

  updated(changedProps: Map<string, any>) {
    if (changedProps.has("hass") || changedProps.has("config")) {
      this._processForecast();
    }
  }

  private _processForecast() {
    try {
      if (this.config && this.config.entity && this.hass) {
        const entity = this.hass.states[this.config.entity];
        if (entity && entity.attributes && entity.attributes.forecast_json) {
          const json: JsonWindForecast = JSON.parse(entity.attributes.forecast_json);
          this.forecast = parseForecast(json);
          return;
        }
      }
      // fallback: config may have a field with direct forecast JSON
      if (this.config && this.config.wind_forecast) {
        this.forecast = parseForecast(this.config.wind_forecast);
        return;
      }
      this.forecast = [];
    } catch (e) {
      this.forecast = [];
      console.error("Failed to parse wind forecast", e);
    }
  }

  render() {
    return html`
      <ha-card header="Wind Rose">
        <div>
          ${this.forecast.length === 0
            ? html`<div>No forecast data</div>`
            : this.forecast.map(
                (f) =>
                  html`<div>${f.datetime}: ${f.direction}° @ ${f.speed} m/s</div>`
              )}
        </div>
      </ha-card>
    `;
  }
}