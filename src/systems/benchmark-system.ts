import { PerformanceMonitor, PerformanceReport } from '../utils/performance-monitor';
import { EventCoordinator } from '../core/event-coordinator';
import { GameEventType } from '../utils/game-events';

/**
 * Interface para as opções de configuração do benchmark
 */
export interface BenchmarkConfig {
  scenarioName: string;
  duration: number; // Duração em segundos
  targetFps?: number; // FPS alvo para comparação
  warmupTime?: number; // Tempo de aquecimento antes de iniciar a medição
  autoSave?: boolean; // Se deve salvar automaticamente os resultados
  callback?: (report: PerformanceReport) => void; // Callback quando o benchmark terminar
}

/**
 * Interface para os resultados do benchmark
 */
export interface BenchmarkResult {
  timestamp: number;
  scenario: string;
  duration: number;
  averageFps: number;
  minFps: number;
  maxFps: number;
  targetFps?: number;
  renderTime: number;
  memoryUsage: number;
  success: boolean;
  comparisonPercent?: number; // % em relação ao target FPS
}

/**
 * Sistema responsável por realizar e gerenciar benchmarks do jogo
 */
export class BenchmarkSystem {
  private static instance: BenchmarkSystem;
  private monitor: PerformanceMonitor;
  private coordinator: EventCoordinator;
  private isRunning: boolean = false;
  private currentConfig: BenchmarkConfig | null = null;
  private timer: number | null = null;
  private results: BenchmarkResult[] = [];
  private renderTimeMeasurement: number = 0;
  private renderStartTime: number = 0;
  
  /**
   * Construtor privado (Singleton)
   */
  private constructor() {
    this.monitor = new PerformanceMonitor();
    this.coordinator = EventCoordinator.getInstance();
    this.setupEventListeners();
  }
  
  /**
   * Obtém a instância única do sistema
   */
  public static getInstance(): BenchmarkSystem {
    if (!BenchmarkSystem.instance) {
      BenchmarkSystem.instance = new BenchmarkSystem();
    }
    return BenchmarkSystem.instance;
  }
  
  /**
   * Configura os listeners de eventos
   */
  private setupEventListeners(): void {
    // Evento para marcar início de renderização
    this.coordinator.on(GameEventType.BENCHMARK_STARTED, () => {
      this.renderStartTime = performance.now();
    });
    
    // Evento para registrar o tempo de renderização
    this.coordinator.on(GameEventType.BENCHMARK_ENDED, () => {
      this.renderTimeMeasurement = performance.now() - this.renderStartTime;
      
      // Registra este frame no monitor
      if (this.isRunning) {
        this.monitor.recordFrame(this.renderTimeMeasurement);
      }
    });
  }
  
  /**
   * Inicia um benchmark com as configurações especificadas
   * @param config Configuração do benchmark
   */
  public startBenchmark(config: BenchmarkConfig): boolean {
    if (this.isRunning) {
      console.warn('Já existe um benchmark em execução');
      return false;
    }
    
    console.log(`Iniciando benchmark para o cenário: ${config.scenarioName}`);
    
    this.currentConfig = config;
    this.isRunning = true;
    
    // Período de aquecimento (se configurado)
    if (config.warmupTime && config.warmupTime > 0) {
      console.log(`Período de aquecimento: ${config.warmupTime}s`);
      
      setTimeout(() => {
        // Inicia a gravação após o período de aquecimento
        this.monitor.startRecording(config.scenarioName);
        
        // Emite evento informando que o benchmark começou
        this.coordinator.emit(GameEventType.BENCHMARK_STARTED, {
          timestamp: Date.now(),
          scenarioName: config.scenarioName
        });
        
        // Configura o timer para parar o benchmark após a duração especificada
        this.timer = window.setTimeout(() => {
          this.stopBenchmark();
        }, config.duration * 1000) as unknown as number;
      }, config.warmupTime * 1000);
      
      return true;
    }
    
    // Sem período de aquecimento, inicia imediatamente
    this.monitor.startRecording(config.scenarioName);
    
    // Emite evento informando que o benchmark começou
    this.coordinator.emit(GameEventType.BENCHMARK_STARTED, {
      timestamp: Date.now(),
      scenarioName: config.scenarioName
    });
    
    // Configura o timer para parar o benchmark após a duração especificada
    this.timer = window.setTimeout(() => {
      this.stopBenchmark();
    }, config.duration * 1000) as unknown as number;
    
    return true;
  }
  
  /**
   * Para o benchmark atual e processa os resultados
   */
  public stopBenchmark(): PerformanceReport | null {
    if (!this.isRunning || !this.currentConfig) {
      console.warn('Nenhum benchmark em execução');
      return null;
    }
    
    // Para a gravação de métricas
    const report = this.monitor.stopRecording();
    
    // Limpa o timer se estiver ativo
    if (this.timer !== null) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    
    // Reseta estado
    this.isRunning = false;
    
    // Se temos um relatório de performance, processamos os resultados
    if (report) {
      const result: BenchmarkResult = {
        timestamp: report.timestamp,
        scenario: report.scenarioName,
        duration: report.duration,
        averageFps: report.averageFps,
        minFps: report.minFps,
        maxFps: report.maxFps,
        renderTime: report.averageRenderTime,
        memoryUsage: report.averageMemoryUsage,
        success: true
      };
      
      // Adiciona informação de target FPS se especificado
      if (this.currentConfig.targetFps) {
        result.targetFps = this.currentConfig.targetFps;
        result.comparisonPercent = (report.averageFps / this.currentConfig.targetFps) * 100;
        result.success = report.averageFps >= this.currentConfig.targetFps * 0.9; // 90% do alvo é considerado sucesso
      }
      
      // Adiciona ao histórico de resultados
      this.results.push(result);
      
      // Emite evento com o relatório de performance
      this.coordinator.emit(GameEventType.PERFORMANCE_REPORT, {
        timestamp: Date.now(),
        ...report
      });
      
      // Executa callback se fornecido
      if (this.currentConfig.callback) {
        this.currentConfig.callback(report);
      }
      
      console.log(`Benchmark finalizado: ${report.scenarioName}. FPS médio: ${report.averageFps.toFixed(2)}`);
      
      // Verifica se deve salvar automaticamente
      if (this.currentConfig.autoSave) {
        this.saveResults();
      }
    }
    
    this.currentConfig = null;
    return report;
  }
  
  /**
   * Salva os resultados de benchmark em localStorage
   */
  public saveResults(): boolean {
    try {
      const existingResults = localStorage.getItem('benchmark_results');
      let allResults: BenchmarkResult[] = [];
      
      if (existingResults) {
        allResults = JSON.parse(existingResults);
      }
      
      // Adiciona os novos resultados
      allResults = [...allResults, ...this.results];
      
      // Limita a quantidade de resultados armazenados
      if (allResults.length > 100) {
        allResults = allResults.slice(allResults.length - 100);
      }
      
      // Salva no localStorage
      localStorage.setItem('benchmark_results', JSON.stringify(allResults));
      
      console.log(`${this.results.length} resultados de benchmark salvos`);
      return true;
    } catch (error) {
      console.error('Erro ao salvar resultados de benchmark:', error);
      return false;
    }
  }
  
  /**
   * Limpa os resultados em memória
   */
  public clearResults(): void {
    this.results = [];
    console.log('Resultados de benchmark em memória foram limpos');
  }
  
  /**
   * Obtém todos os resultados de benchmark
   */
  public getResults(): BenchmarkResult[] {
    return [...this.results];
  }
  
  /**
   * Carrega os resultados salvos do localStorage
   */
  public loadSavedResults(): BenchmarkResult[] {
    try {
      const savedResults = localStorage.getItem('benchmark_results');
      if (savedResults) {
        const results = JSON.parse(savedResults) as BenchmarkResult[];
        console.log(`${results.length} resultados de benchmark carregados`);
        return results;
      }
    } catch (error) {
      console.error('Erro ao carregar resultados de benchmark:', error);
    }
    
    return [];
  }
  
  /**
   * Iniciar a medição de renderização para o frame atual
   * Deve ser chamado no início do loop de renderização
   */
  public beginFrameMeasurement(): void {
    if (this.isRunning) {
      this.coordinator.emit(GameEventType.BENCHMARK_STARTED, {
        timestamp: Date.now()
      });
    }
  }
  
  /**
   * Finalizar a medição de renderização para o frame atual
   * Deve ser chamado no final do loop de renderização
   */
  public endFrameMeasurement(): void {
    if (this.isRunning) {
      this.coordinator.emit(GameEventType.BENCHMARK_ENDED, {
        timestamp: Date.now()
      });
    }
  }
  
  /**
   * Verificar se um benchmark está em execução
   */
  public isActive(): boolean {
    return this.isRunning;
  }
  
  /**
   * Obtém as configurações do benchmark atual
   */
  public getCurrentConfig(): BenchmarkConfig | null {
    return this.currentConfig;
  }
} 