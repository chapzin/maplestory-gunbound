/**
 * Interface para armazenar métricas de performance de um período de tempo
 */
export interface PerformanceMetric {
  startTime: number;
  endTime: number;
  frames: number;
  fps: number[];
  averageFps: number;
  minFps: number;
  maxFps: number;
  renderTimes: number[];
  averageRenderTime: number;
  memoryUsage: number[];
  averageMemoryUsage: number;
  scenarioName: string;
}

/**
 * Interface para o relatório de performance
 */
export interface PerformanceReport {
  scenarioName: string;
  duration: number;
  averageFps: number;
  minFps: number;
  maxFps: number;
  averageRenderTime: number;
  averageMemoryUsage: number;
  timestamp: string;
}

/**
 * Classe responsável por monitorar a performance do jogo
 * em diferentes cenários e fornecer métricas úteis
 */
export class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetric> = new Map();
  private isRecording: boolean = false;
  private currentScenario: string | null = null;
  private lastFrameTime: number = 0;
  private frameCount: number = 0;
  private fpsValues: number[] = [];
  private renderTimes: number[] = [];
  private memoryUsages: number[] = [];
  
  /**
   * Inicia a gravação de métricas para um cenário específico
   * @param scenarioName Nome do cenário (ex: "MenuPrincipal", "Jogo2Jogadores")
   */
  public startRecording(scenarioName: string): void {
    if (this.isRecording) {
      console.warn(`Já está gravando métricas para o cenário: ${this.currentScenario}`);
      return;
    }
    
    this.isRecording = true;
    this.currentScenario = scenarioName;
    this.frameCount = 0;
    this.fpsValues = [];
    this.renderTimes = [];
    this.memoryUsages = [];
    this.lastFrameTime = performance.now();
    
    // Inicializa a métrica para este cenário
    this.metrics.set(scenarioName, {
      startTime: performance.now(),
      endTime: 0,
      frames: 0,
      fps: [],
      averageFps: 0,
      minFps: Infinity,
      maxFps: 0,
      renderTimes: [],
      averageRenderTime: 0,
      memoryUsage: [],
      averageMemoryUsage: 0,
      scenarioName
    });
    
    console.log(`Iniciando gravação de métricas para o cenário: ${scenarioName}`);
  }
  
  /**
   * Para a gravação de métricas e retorna um relatório
   */
  public stopRecording(): PerformanceReport | null {
    if (!this.isRecording || !this.currentScenario) {
      console.warn('Não está gravando métricas no momento');
      return null;
    }
    
    const metric = this.metrics.get(this.currentScenario);
    if (!metric) {
      console.error(`Métrica não encontrada para o cenário: ${this.currentScenario}`);
      return null;
    }
    
    // Finaliza a métrica
    metric.endTime = performance.now();
    metric.frames = this.frameCount;
    metric.fps = [...this.fpsValues];
    metric.renderTimes = [...this.renderTimes];
    metric.memoryUsage = [...this.memoryUsages];
    
    // Calcula médias e extremos
    metric.averageFps = this.calculateAverage(metric.fps);
    metric.minFps = Math.min(...metric.fps);
    metric.maxFps = Math.max(...metric.fps);
    metric.averageRenderTime = this.calculateAverage(metric.renderTimes);
    metric.averageMemoryUsage = this.calculateAverage(metric.memoryUsage);
    
    // Cria o relatório
    const report: PerformanceReport = {
      scenarioName: this.currentScenario,
      duration: (metric.endTime - metric.startTime) / 1000, // em segundos
      averageFps: metric.averageFps,
      minFps: metric.minFps,
      maxFps: metric.maxFps,
      averageRenderTime: metric.averageRenderTime,
      averageMemoryUsage: metric.averageMemoryUsage,
      timestamp: new Date().toISOString()
    };
    
    // Reseta o estado
    this.isRecording = false;
    this.currentScenario = null;
    
    console.log(`Métricas finalizadas para ${report.scenarioName}. FPS médio: ${report.averageFps.toFixed(2)}`);
    return report;
  }
  
  /**
   * Registra as métricas de um frame
   * @param renderTime Tempo de renderização deste frame em ms
   */
  public recordFrame(renderTime: number): void {
    if (!this.isRecording || !this.currentScenario) {
      return;
    }
    
    const now = performance.now();
    const deltaTime = now - this.lastFrameTime;
    this.lastFrameTime = now;
    
    // Calcula o FPS atual (convertendo ms para segundos)
    const currentFps = 1000 / deltaTime;
    
    // Registra as métricas
    this.frameCount++;
    this.fpsValues.push(currentFps);
    this.renderTimes.push(renderTime);
    
    // Tenta obter informações de memória, se disponíveis
    if (typeof performance.memory !== 'undefined') {
      // @ts-ignore: Property 'memory' does not exist on type 'Performance'
      const memUsage = performance.memory.usedJSHeapSize / (1024 * 1024); // em MB
      this.memoryUsages.push(memUsage);
    } else {
      // Usa um valor dummy para navegadores que não suportam
      this.memoryUsages.push(0);
    }
  }
  
  /**
   * Retorna todas as métricas gravadas
   */
  public getAllMetrics(): Map<string, PerformanceMetric> {
    return new Map(this.metrics);
  }
  
  /**
   * Limpa todas as métricas registradas
   */
  public clearMetrics(): void {
    this.metrics.clear();
    console.log('Todas as métricas foram limpas');
  }
  
  /**
   * Exporta os relatórios de todas as métricas registradas
   */
  public exportReports(): PerformanceReport[] {
    const reports: PerformanceReport[] = [];
    
    this.metrics.forEach(metric => {
      reports.push({
        scenarioName: metric.scenarioName,
        duration: (metric.endTime - metric.startTime) / 1000,
        averageFps: metric.averageFps,
        minFps: metric.minFps,
        maxFps: metric.maxFps,
        averageRenderTime: metric.averageRenderTime,
        averageMemoryUsage: metric.averageMemoryUsage,
        timestamp: new Date().toISOString()
      });
    });
    
    return reports;
  }
  
  /**
   * Calcula a média de um array de números
   */
  private calculateAverage(values: number[]): number {
    if (values.length === 0) return 0;
    const sum = values.reduce((a, b) => a + b, 0);
    return sum / values.length;
  }
} 