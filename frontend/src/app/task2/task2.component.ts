import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

interface Planet {
  sign: string;
  degree: number;
}

interface ChartResult {
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
  data?: ChartResult;
  error?: string;
  errors?: Array<{ msg: string; param: string }>;
}

@Component({
  selector: 'app-task2',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="task2-container">
      <h2>Task 2: Birth Chart Calculator</h2>
      <p class="task-description">
        Create a form to calculate and display birth chart information.
        Implement the component according to the requirements in the code comments.
      </p>
      
      <!-- Form -->
      <form [formGroup]="chartForm" (ngSubmit)="onSubmit()" class="chart-form">
        <div class="form-group">
          <label for="birthDate" class="form-label">
            Birth Date <span class="required">*</span>
          </label>
          <input
            type="date"
            id="birthDate"
            formControlName="birthDate"
            class="form-control"
            [class.error]="isFieldInvalid('birthDate')"
          />
          <div *ngIf="isFieldInvalid('birthDate')" class="error-message">
            <span *ngIf="chartForm.get('birthDate')?.errors?.['required']">
              Birth date is required
            </span>
          </div>
        </div>

        <div class="form-group">
          <label for="birthTime" class="form-label">
            Birth Time <span class="required">*</span>
          </label>
          <input
            type="time"
            id="birthTime"
            formControlName="birthTime"
            class="form-control"
            [class.error]="isFieldInvalid('birthTime')"
          />
          <div *ngIf="isFieldInvalid('birthTime')" class="error-message">
            <span *ngIf="chartForm.get('birthTime')?.errors?.['required']">
              Birth time is required
            </span>
          </div>
        </div>

        <div class="form-group">
          <label for="birthLocation" class="form-label">
            Birth Location <span class="required">*</span>
          </label>
          <input
            type="text"
            id="birthLocation"
            formControlName="birthLocation"
            class="form-control"
            placeholder="e.g., New York, NY"
            [class.error]="isFieldInvalid('birthLocation')"
          />
          <div *ngIf="isFieldInvalid('birthLocation')" class="error-message">
            <span *ngIf="chartForm.get('birthLocation')?.errors?.['required']">
              Birth location is required
            </span>
            <span *ngIf="chartForm.get('birthLocation')?.errors?.['minlength']">
              Location must be at least 2 characters
            </span>
          </div>
        </div>

        <div class="form-actions">
          <button
            type="submit"
            class="submit-button"
            [disabled]="chartForm.invalid || loading"
          >
            <span *ngIf="!loading">Calculate Chart</span>
            <span *ngIf="loading" class="button-loading">
              <span class="spinner-small"></span>
              Calculating...
            </span>
          </button>
          <button
            type="button"
            class="reset-button"
            (click)="resetForm()"
            [disabled]="loading"
          >
            Reset
          </button>
        </div>
      </form>

      <!-- Error Display -->
      <div *ngIf="error && !loading" class="error-container">
        <div class="error-icon">⚠️</div>
        <h3>Error</h3>
        <p>{{ error }}</p>
      </div>

      <!-- Result Display -->
      <div *ngIf="chartResult && !loading && !error" class="result-container">
        <div class="result-header">
          <h3>Your Birth Chart</h3>
          <button (click)="clearResult()" class="close-button">×</button>
        </div>
        
        <div class="result-body">
          <div class="birth-info-section">
            <h4>Birth Information</h4>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">📅 Birth Date:</span>
                <span class="info-value">{{ formatDate(chartResult.birthDate) }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">🕐 Birth Time:</span>
                <span class="info-value">{{ chartResult.birthTime }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">📍 Location:</span>
                <span class="info-value">{{ chartResult.birthLocation }}</span>
              </div>
            </div>
          </div>

          <div class="signs-section">
            <h4>Key Signs</h4>
            <div class="signs-grid">
              <div class="sign-card sun-sign">
                <div class="sign-icon">☀️</div>
                <div class="sign-label">Sun Sign</div>
                <div class="sign-value">{{ chartResult.sunSign }}</div>
              </div>
              <div class="sign-card moon-sign">
                <div class="sign-icon">🌙</div>
                <div class="sign-label">Moon Sign</div>
                <div class="sign-value">{{ chartResult.moonSign }}</div>
              </div>
              <div class="sign-card rising-sign">
                <div class="sign-icon">⬆️</div>
                <div class="sign-label">Rising Sign</div>
                <div class="sign-value">{{ chartResult.risingSign }}</div>
              </div>
            </div>
          </div>

          <div class="planets-section">
            <h4>Planetary Positions</h4>
            <div class="planets-grid">
              <div *ngFor="let planet of getPlanetsList(chartResult.planets)" class="planet-card">
                <div class="planet-name">{{ planet.name }}</div>
                <div class="planet-position">
                  <span class="planet-sign">{{ planet.sign }}</span>
                  <span class="planet-degree">{{ planet.degree }}°</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .task2-container {
      max-width: 900px;
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

    /* Form Styles */
    .chart-form {
      background: white;
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      margin-bottom: 2rem;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    .form-label {
      display: block;
      margin-bottom: 0.5rem;
      color: #333;
      font-weight: 500;
      font-size: 0.95rem;
    }

    .required {
      color: #e74c3c;
    }

    .form-control {
      width: 100%;
      padding: 0.75rem;
      border: 2px solid #e0e0e0;
      border-radius: 6px;
      font-size: 1rem;
      transition: border-color 0.3s;
      box-sizing: border-box;
    }

    .form-control:focus {
      outline: none;
      border-color: #667eea;
    }

    .form-control.error {
      border-color: #e74c3c;
    }

    .error-message {
      color: #e74c3c;
      font-size: 0.85rem;
      margin-top: 0.25rem;
    }

    .form-actions {
      display: flex;
      gap: 1rem;
      margin-top: 2rem;
    }

    .submit-button,
    .reset-button {
      flex: 1;
      padding: 0.875rem 1.5rem;
      border: none;
      border-radius: 6px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
    }

    .submit-button {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .submit-button:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }

    .submit-button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .reset-button {
      background: #f5f5f5;
      color: #666;
      border: 2px solid #e0e0e0;
    }

    .reset-button:hover:not(:disabled) {
      background: #e8e8e8;
    }

    .button-loading {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }

    .spinner-small {
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top: 2px solid white;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    /* Error Container */
    .error-container {
      background: #fee;
      border: 1px solid #fcc;
      border-radius: 8px;
      padding: 1.5rem;
      text-align: center;
      margin-bottom: 2rem;
    }

    .error-icon {
      font-size: 2.5rem;
      margin-bottom: 0.5rem;
    }

    .error-container h3 {
      color: #c33;
      margin: 0.5rem 0;
    }

    .error-container p {
      color: #666;
      margin: 0;
    }

    /* Result Container */
    .result-container {
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      overflow: hidden;
      margin-top: 2rem;
    }

    .result-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 1.25rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .result-header h3 {
      margin: 0;
      font-size: 1.5rem;
    }

    .close-button {
      background: rgba(255, 255, 255, 0.2);
      border: none;
      color: white;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      font-size: 1.5rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.3s;
    }

    .close-button:hover {
      background: rgba(255, 255, 255, 0.3);
    }

    .result-body {
      padding: 2rem;
    }

    .result-body h4 {
      color: #333;
      margin: 0 0 1rem 0;
      font-size: 1.1rem;
      font-weight: 600;
    }

    .birth-info-section {
      margin-bottom: 2rem;
      padding-bottom: 2rem;
      border-bottom: 1px solid #eee;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }

    .info-item {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .info-label {
      color: #666;
      font-size: 0.9rem;
      font-weight: 500;
    }

    .info-value {
      color: #333;
      font-size: 1rem;
      font-weight: 600;
    }

    .signs-section {
      margin-bottom: 2rem;
      padding-bottom: 2rem;
      border-bottom: 1px solid #eee;
    }

    .signs-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 1rem;
    }

    .sign-card {
      background: #f8f9fa;
      padding: 1.5rem;
      border-radius: 8px;
      text-align: center;
      transition: transform 0.3s;
    }

    .sign-card:hover {
      transform: translateY(-4px);
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

    .sign-icon {
      font-size: 2rem;
      margin-bottom: 0.5rem;
    }

    .sign-label {
      color: #666;
      font-size: 0.85rem;
      margin-bottom: 0.5rem;
    }

    .sign-value {
      color: #333;
      font-size: 1.25rem;
      font-weight: 600;
    }

    .planets-section {
      margin-bottom: 0;
    }

    .planets-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
      gap: 1rem;
    }

    .planet-card {
      background: #f8f9fa;
      padding: 1rem;
      border-radius: 6px;
      text-align: center;
    }

    .planet-name {
      color: #666;
      font-size: 0.9rem;
      font-weight: 500;
      margin-bottom: 0.5rem;
      text-transform: capitalize;
    }

    .planet-position {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .planet-sign {
      color: #333;
      font-size: 1rem;
      font-weight: 600;
    }

    .planet-degree {
      color: #666;
      font-size: 0.85rem;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .chart-form {
        padding: 1.5rem;
      }

      .form-actions {
        flex-direction: column;
      }

      .info-grid {
        grid-template-columns: 1fr;
      }

      .signs-grid {
        grid-template-columns: repeat(3, 1fr);
      }

      .planets-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 480px) {
      .task2-container {
        padding: 0.5rem;
      }

      .chart-form {
        padding: 1rem;
      }

      .result-body {
        padding: 1.5rem;
      }
    }
  `]
})
export class Task2Component {
  chartForm: FormGroup;
  chartResult: ChartResult | null = null;
  loading = false;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient
  ) {
    this.chartForm = this.fb.group({
      birthDate: ['', [Validators.required]],
      birthTime: ['', [Validators.required]],
      birthLocation: ['', [Validators.required, Validators.minLength(2)]]
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.chartForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  onSubmit() {
    if (this.chartForm.invalid) {
      this.chartForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.error = null;
    this.chartResult = null;

    const formValue = this.chartForm.value;
    const requestData = {
      birthDate: formValue.birthDate,
      birthTime: formValue.birthTime,
      birthLocation: formValue.birthLocation
    };

    this.http.post<ApiResponse>('/api/charts/calculate', requestData)
      .pipe(
        catchError(err => {
          this.loading = false;
          if (err.error?.errors && Array.isArray(err.error.errors)) {
            const errorMessages = err.error.errors.map((e: any) => e.msg || e.message).join(', ');
            this.error = errorMessages;
          } else {
            this.error = err.error?.error || err.message || 'Failed to calculate chart. Please try again.';
          }
          return of(null);
        })
      )
      .subscribe(response => {
        this.loading = false;
        if (response && response.success && response.data) {
          this.chartResult = response.data;
          this.chartForm.reset();
          // Scroll to result
          setTimeout(() => {
            const resultElement = document.querySelector('.result-container');
            if (resultElement) {
              resultElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          }, 100);
        } else if (response && !response.success) {
          this.error = response.error || 'Failed to calculate chart';
        }
      });
  }

  resetForm() {
    this.chartForm.reset();
    this.error = null;
    this.chartResult = null;
  }

  clearResult() {
    this.chartResult = null;
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }

  getPlanetsList(planets: ChartResult['planets']): Array<{ name: string; sign: string; degree: number }> {
    return [
      { name: 'Sun', ...planets.sun },
      { name: 'Moon', ...planets.moon },
      { name: 'Mercury', ...planets.mercury },
      { name: 'Venus', ...planets.venus },
      { name: 'Mars', ...planets.mars }
    ];
  }
}

