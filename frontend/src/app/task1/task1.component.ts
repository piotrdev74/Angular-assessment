import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { HttpClient } from "@angular/common/http";
import { catchError } from "rxjs/operators";
import { of } from "rxjs";

interface Planet {
  sign: string;
  degree: number;
}

interface Chart {
  _id?: string;
  id?: number;
  name?: string;
  birthDate: string;
  birthTime: string;
  birthLocation: string;
  sunSign: string;
  moonSign: string;
  risingSign: string;
  planets: {
    sun: Planet;
    moon: Planet;
    mercury: Planet;
    venus: Planet;
    mars: Planet;
  };
}

interface ApiResponse {
  success: boolean;
  data?: Chart[];
  count?: number;
  total?: number;
  page?: number;
  pages?: number;
  error?: string;
}

@Component({
  selector: "app-task1",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="task1-container">
      <h2>Task 1: Display Astrological Charts</h2>
      <p class="task-description">
        Fetch and display astrological charts from the API. Implement the
        component according to the requirements in the code comments.
      </p>

      <!-- Loading State -->
      <div *ngIf="loading" class="loading-container">
        <div class="spinner"></div>
        <p>Loading charts...</p>
      </div>

      <!-- Error State -->
      <div *ngIf="error && !loading" class="error-container">
        <div class="error-icon">⚠️</div>
        <h3>Error Loading Charts</h3>
        <p>{{ error }}</p>
        <button (click)="loadCharts()" class="retry-button">Retry</button>
      </div>

      <!-- Charts Display -->
      <div *ngIf="!loading && !error" class="charts-wrapper">
        <div *ngIf="charts.length === 0" class="empty-state">
          <p>No charts available</p>
        </div>
        <div *ngIf="charts.length > 0" class="charts-grid">
          <div *ngFor="let chart of charts" class="chart-card">
            <div class="chart-header">
              <h3 class="chart-name">{{ chart.name || "Unnamed Chart" }}</h3>
            </div>
            <div class="chart-body">
              <div class="birth-info">
                <div class="info-item">
                  <span class="info-label">📅 Birth Date:</span>
                  <span class="info-value">{{
                    formatDate(chart.birthDate)
                  }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">🕐 Birth Time:</span>
                  <span class="info-value">{{ chart.birthTime }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">📍 Location:</span>
                  <span class="info-value">{{ chart.birthLocation }}</span>
                </div>
              </div>

              <div class="signs-section">
                <h4 class="section-title">Key Signs</h4>
                <div class="signs-grid">
                  <div class="sign-item sun-sign">
                    <span class="sign-label">☀️ Sun</span>
                    <span class="sign-value">{{ chart.sunSign }}</span>
                  </div>
                  <div class="sign-item moon-sign">
                    <span class="sign-label">🌙 Moon</span>
                    <span class="sign-value">{{ chart.moonSign }}</span>
                  </div>
                  <div class="sign-item rising-sign">
                    <span class="sign-label">⬆️ Rising</span>
                    <span class="sign-value">{{ chart.risingSign }}</span>
                  </div>
                </div>
              </div>

              <div class="planets-section">
                <h4 class="section-title">Planets</h4>
                <div class="planets-list">
                  <div
                    *ngFor="let planet of getPlanetsList(chart.planets)"
                    class="planet-item"
                  >
                    <span class="planet-name">{{ planet.name }}</span>
                    <span class="planet-details"
                      >{{ planet.sign }} {{ planet.degree }}°</span
                    >
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .task1-container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 1rem;
      }

      h2 {
        color: #333;
        margin-bottom: 0.5rem;
      }

      .task-description {
        color: #666;
        margin-bottom: 2rem;
        font-size: 1rem;
      }

      /* Loading State */
      .loading-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 4rem 2rem;
        text-align: center;
      }

      .spinner {
        width: 50px;
        height: 50px;
        border: 4px solid #f3f3f3;
        border-top: 4px solid #667eea;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin-bottom: 1rem;
      }

      @keyframes spin {
        0% {
          transform: rotate(0deg);
        }
        100% {
          transform: rotate(360deg);
        }
      }

      /* Error State */
      .error-container {
        background: #fee;
        border: 1px solid #fcc;
        border-radius: 8px;
        padding: 2rem;
        text-align: center;
        margin: 2rem 0;
      }

      .error-icon {
        font-size: 3rem;
        margin-bottom: 1rem;
      }

      .error-container h3 {
        color: #c33;
        margin-bottom: 0.5rem;
      }

      .error-container p {
        color: #666;
        margin-bottom: 1rem;
      }

      .retry-button {
        background: #667eea;
        color: white;
        border: none;
        padding: 0.75rem 1.5rem;
        border-radius: 4px;
        cursor: pointer;
        font-size: 1rem;
        transition: background 0.3s;
      }

      .retry-button:hover {
        background: #5568d3;
      }

      /* Empty State */
      .empty-state {
        text-align: center;
        padding: 4rem 2rem;
        color: #999;
        font-size: 1.1rem;
      }

      /* Charts Grid */
      .charts-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
        gap: 1.5rem;
        margin-top: 1rem;
      }

      /* Chart Card */
      .chart-card {
        background: white;
        border-radius: 12px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        overflow: hidden;
        transition: transform 0.3s, box-shadow 0.3s;
      }

      .chart-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
      }

      .chart-header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 1.25rem;
      }

      .chart-name {
        margin: 0;
        font-size: 1.25rem;
        font-weight: 600;
      }

      .chart-body {
        padding: 1.5rem;
      }

      /* Birth Info */
      .birth-info {
        margin-bottom: 1.5rem;
        padding-bottom: 1.5rem;
        border-bottom: 1px solid #eee;
      }

      .info-item {
        display: flex;
        justify-content: space-between;
        margin-bottom: 0.75rem;
        font-size: 0.9rem;
      }

      .info-item:last-child {
        margin-bottom: 0;
      }

      .info-label {
        color: #666;
        font-weight: 500;
      }

      .info-value {
        color: #333;
        font-weight: 600;
      }

      /* Signs Section */
      .signs-section {
        margin-bottom: 1.5rem;
        padding-bottom: 1.5rem;
        border-bottom: 1px solid #eee;
      }

      .section-title {
        font-size: 1rem;
        color: #333;
        margin: 0 0 1rem 0;
        font-weight: 600;
      }

      .signs-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 0.75rem;
      }

      .sign-item {
        background: #f8f9fa;
        padding: 0.75rem;
        border-radius: 6px;
        text-align: center;
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
      }

      .sign-label {
        font-size: 0.85rem;
        color: #666;
      }

      .sign-value {
        font-size: 0.95rem;
        font-weight: 600;
        color: #333;
      }

      .sun-sign {
        background: #fff4e6;
      }

      .moon-sign {
        background: #e6f3ff;
      }

      .rising-sign {
        background: #f0e6ff;
      }

      /* Planets Section */
      .planets-section {
        margin-bottom: 0;
      }

      .planets-list {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      .planet-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.5rem;
        background: #f8f9fa;
        border-radius: 4px;
        font-size: 0.9rem;
      }

      .planet-name {
        color: #666;
        font-weight: 500;
        text-transform: capitalize;
      }

      .planet-details {
        color: #333;
        font-weight: 600;
      }

      /* Responsive Design */
      @media (max-width: 768px) {
        .charts-grid {
          grid-template-columns: 1fr;
        }

        .signs-grid {
          grid-template-columns: repeat(3, 1fr);
        }

        .task1-container {
          padding: 0.5rem;
        }
      }

      @media (max-width: 480px) {
        .chart-body {
          padding: 1rem;
        }

        .info-item {
          flex-direction: column;
          gap: 0.25rem;
        }

        .info-value {
          margin-left: 1.5rem;
        }
      }
    `,
  ],
})
export class Task1Component implements OnInit {
  charts: Chart[] = [];
  loading = false;
  error: string | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadCharts();
  }

  loadCharts() {
    this.loading = true;
    this.error = null;

    this.http
      .get<ApiResponse>("/api/charts")
      .pipe(
        catchError((err) => {
          this.loading = false;
          this.error =
            err.error?.error ||
            err.message ||
            "Failed to load charts. Please try again.";
          return of(null);
        })
      )
      .subscribe((response) => {
        this.loading = false;
        if (response && response.success && response.data) {
          this.charts = response.data;
        } else if (response && !response.success) {
          this.error = response.error || "Failed to load charts";
        }
      });
  }

  formatDate(dateString: string): string {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  getPlanetsList(
    planets: Chart["planets"]
  ): Array<{ name: string; sign: string; degree: number }> {
    return [
      { name: "Sun", ...planets.sun },
      { name: "Moon", ...planets.moon },
      { name: "Mercury", ...planets.mercury },
      { name: "Venus", ...planets.venus },
      { name: "Mars", ...planets.mars },
    ];
  }
}
