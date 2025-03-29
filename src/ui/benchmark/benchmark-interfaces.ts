import * as PIXI from 'pixi.js';
import { UISystem } from '../../core/ui/ui-system';
import { BenchmarkConfig, BenchmarkResult } from '../../systems/benchmark-system';
import { EventEmitter } from 'eventemitter3';

/**
 * Interface base para componentes de benchmark
 */
export interface IBenchmarkComponent {
  /**
   * Renderiza o componente
   */
  render(): void;
  
  /**
   * Define a visibilidade do componente
   */
  setVisible(visible: boolean): void;
  
  /**
   * Destrói o componente e libera recursos
   */
  destroy(): void;
}

/**
 * Interface para os dados de formulário do benchmark
 */
export interface IBenchmarkFormData {
  /**
   * Nome do cenário de benchmark
   */
  scenarioName: string;
  
  /**
   * Duração do benchmark em segundos
   */
  duration: number;
  
  /**
   * FPS alvo para o benchmark
   */
  targetFps: number;
  
  /**
   * Tempo de aquecimento em segundos
   */
  warmupTime: number;
}

/**
 * Interface para factories de elementos de UI
 * Abstrai a dependência direta de PIXI.js
 */
export interface IUIElementFactory {
  /**
   * Cria um texto
   */
  createText(id: string, text: string, x: number, y: number, style?: any): any;
  
  /**
   * Cria um botão
   */
  createButton(id: string, label: string, x: number, y: number, width: number, height: number, onClick: () => void, style?: any): any;
  
  /**
   * Cria uma barra de progresso
   */
  createProgressBar(id: string, x: number, y: number, width: number, height: number, value?: number, maxValue?: number, bgColor?: number, fillColor?: number): any;
  
  /**
   * Cria um container gráfico
   */
  createContainer(x: number, y: number): PIXI.Container;
  
  /**
   * Cria um painel (retângulo com preenchimento)
   */
  createPanel(x: number, y: number, width: number, height: number, bgColor: number, alpha: number): PIXI.Graphics;
}

/**
 * Service interface for benchmark operations
 */
export interface IBenchmarkService {
  /**
   * Inicia um benchmark com as configurações fornecidas
   */
  startBenchmark(config: BenchmarkConfig): void;
  
  /**
   * Para o benchmark atual
   */
  stopBenchmark(): void;
  
  /**
   * Obtém os resultados históricos de benchmarks
   */
  getHistoricalResults(): BenchmarkResult[];
  
  /**
   * Registra um callback para eventos de benchmark
   */
  onBenchmarkComplete(callback: (result: BenchmarkResult) => void): void;
  
  /**
   * Remove um callback registrado
   */
  offBenchmarkComplete(callback: (result: BenchmarkResult) => void): void;
} 