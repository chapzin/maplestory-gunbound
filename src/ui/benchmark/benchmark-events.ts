/**
 * Tipos de eventos do sistema de benchmark
 */
export enum BenchmarkEventType {
  // Eventos do ciclo de vida do benchmark
  BENCHMARK_STARTED = 'benchmark_started',
  BENCHMARK_STOPPED = 'benchmark_stopped',
  BENCHMARK_COMPLETED = 'benchmark_completed',
  BENCHMARK_PROGRESS = 'benchmark_progress',
  
  // Eventos da UI
  FORM_SUBMITTED = 'form_submitted',
  FORM_CANCELED = 'form_canceled',
  VISUALIZATION_TOGGLED = 'visualization_toggled',
  UI_CLOSED = 'ui_closed',
  UI_OPENED = 'ui_opened'
}

/**
 * Tipo para payload de eventos de benchmark
 */
export interface BenchmarkEventPayload {
  // Campos comuns para todos os eventos
  timestamp: number;
  
  // Campos específicos de eventos - um evento usará apenas os campos relevantes
  formData?: {
    scenarioName: string;
    duration: number;
    targetFps: number;
    warmupTime: number;
  };
  result?: {
    scenario: string;
    averageFps: number;
    minFps: number;
    maxFps: number;
    duration: number;
    timestamp: number;
  };
  progress?: {
    percent: number;
    elapsedTime: number;
    currentFps: number;
  };
} 