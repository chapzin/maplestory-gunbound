import { BenchmarkSystem, BenchmarkConfig, BenchmarkResult } from '../../systems/benchmark-system';
import { IBenchmarkService } from './benchmark-interfaces';
import { EventCoordinator } from '../../core/event-coordinator';
import { GameEventType } from '../../utils/game-events';

/**
 * Implementação do serviço de benchmark
 * Encapsula a comunicação com o BenchmarkSystem, facilitando testes
 */
export class BenchmarkService implements IBenchmarkService {
  private benchmarkSystem: BenchmarkSystem;
  private eventCoordinator: EventCoordinator;
  private results: BenchmarkResult[] = [];
  private completeCallbacks: ((result: BenchmarkResult) => void)[] = [];
  
  /**
   * Inicializa o serviço com uma instância do sistema de benchmark
   */
  constructor() {
    this.benchmarkSystem = BenchmarkSystem.getInstance();
    this.eventCoordinator = EventCoordinator.getInstance();
    
    // Carregar resultados salvos
    this.loadSavedResults();
    
    // Configurar listener para eventos de benchmark
    this.eventCoordinator.on(GameEventType.PERFORMANCE_REPORT, (data) => {
      const result: BenchmarkResult = {
        timestamp: data.timestamp,
        scenario: data.scenarioName,
        duration: data.duration,
        averageFps: data.averageFps,
        minFps: data.minFps,
        maxFps: data.maxFps,
        targetFps: data.targetFps,
        renderTime: data.averageRenderTime,
        memoryUsage: data.averageMemoryUsage,
        success: true,
        comparisonPercent: data.comparisonPercent
      };
      
      // Adicionar ao histórico
      this.results.push(result);
      
      // Notificar callbacks registrados
      this.notifyCallbacks(result);
    });
  }
  
  /**
   * Inicia um benchmark com as configurações fornecidas
   * @param config Configuração do benchmark
   */
  startBenchmark(config: BenchmarkConfig): void {
    this.benchmarkSystem.startBenchmark(config);
  }
  
  /**
   * Para o benchmark atual
   */
  stopBenchmark(): void {
    this.benchmarkSystem.stopBenchmark();
  }
  
  /**
   * Obtém os resultados históricos de benchmarks
   * @returns Lista de resultados de benchmarks anteriores
   */
  getHistoricalResults(): BenchmarkResult[] {
    return [...this.results]; // Retorna cópia para evitar modificações externas
  }
  
  /**
   * Carrega resultados salvos anteriormente
   */
  private loadSavedResults(): void {
    // Simulação de carregamento de resultados salvos (implementação real dependeria do armazenamento)
    // Em um ambiente real, isso poderia vir de localStorage, IndexedDB, etc.
    const savedResults = localStorage.getItem('benchmark_results');
    if (savedResults) {
      try {
        this.results = JSON.parse(savedResults);
      } catch (e) {
        console.error('Erro ao carregar resultados de benchmark:', e);
      }
    }
  }
  
  /**
   * Registra um callback para eventos de benchmark completo
   * @param callback Função a ser chamada quando um benchmark for concluído
   */
  onBenchmarkComplete(callback: (result: BenchmarkResult) => void): void {
    this.completeCallbacks.push(callback);
  }
  
  /**
   * Remove um callback registrado
   * @param callback Função a ser removida dos listeners
   */
  offBenchmarkComplete(callback: (result: BenchmarkResult) => void): void {
    const index = this.completeCallbacks.indexOf(callback);
    if (index !== -1) {
      this.completeCallbacks.splice(index, 1);
    }
  }
  
  /**
   * Notifica todos os callbacks registrados sobre um resultado de benchmark
   * @param result Resultado do benchmark
   */
  private notifyCallbacks(result: BenchmarkResult): void {
    for (const callback of this.completeCallbacks) {
      try {
        callback(result);
      } catch (e) {
        console.error('Erro ao executar callback de benchmark:', e);
      }
    }
  }
} 