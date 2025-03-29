import * as PIXI from 'pixi.js';
import { IBenchmarkComponent, IUIElementFactory } from './benchmark-interfaces';
import { TextElement } from '../../core/ui/elements';
import { BenchmarkResult } from '../../systems/benchmark-system';

/**
 * Componente responsável por exibir os resultados do benchmark
 */
export class BenchmarkResultsComponent implements IBenchmarkComponent {
  private container: PIXI.Container;
  private uiFactory: IUIElementFactory;
  private isVisible: boolean = false;
  
  // Elementos de UI
  private resultsText?: TextElement;
  private latestResultPanel?: PIXI.Graphics;
  private historyPanel?: PIXI.Graphics;
  
  // Dados
  private latestResult: BenchmarkResult | null = null;
  private results: BenchmarkResult[] = [];
  
  /**
   * Inicializa o componente de resultados
   * @param uiFactory Factory para criar elementos de UI
   * @param parent Container pai onde o componente será adicionado
   * @param x Posição X do componente
   * @param y Posição Y do componente
   */
  constructor(
    uiFactory: IUIElementFactory,
    parent: PIXI.Container,
    private x: number,
    private y: number
  ) {
    this.uiFactory = uiFactory;
    this.container = this.uiFactory.createContainer(x, y);
    parent.addChild(this.container);
  }
  
  /**
   * Renderiza o componente de resultados
   */
  render(): void {
    // Painel de resultados recentes
    this.latestResultPanel = this.uiFactory.createPanel(0, 0, 360, 140, 0x333333, 0.9);
    this.container.addChild(this.latestResultPanel);
    
    // Título do painel
    const titleStyle = { fontSize: 16, fill: 0xFFFFFF, fontWeight: 'bold' };
    const title = this.uiFactory.createText('resultsTitle', 'Resultados do Benchmark', 10, 10, titleStyle);
    this.container.addChild(title.displayObject);
    
    // Texto para mostrar resultados
    this.resultsText = this.uiFactory.createText(
      'benchmarkResults',
      'Nenhum resultado disponível.',
      10,
      40,
      {
        fontSize: 14,
        fill: 0xFFFFFF,
        wordWrap: true,
        wordWrapWidth: 340
      }
    );
    this.container.addChild(this.resultsText.displayObject);
    
    // Painel de histórico (será populado quando houver resultados)
    this.historyPanel = this.uiFactory.createPanel(0, 150, 360, 150, 0x333333, 0.9);
    this.container.addChild(this.historyPanel);
    
    // Título do histórico
    const historyTitle = this.uiFactory.createText(
      'historyTitle', 
      'Histórico de Benchmarks', 
      10, 
      160, 
      titleStyle
    );
    this.container.addChild(historyTitle.displayObject);
    
    // Estado inicial
    this.setVisible(false);
    this.updateHistoryDisplay();
  }
  
  /**
   * Define a visibilidade do componente
   */
  setVisible(visible: boolean): void {
    this.isVisible = visible;
    this.container.visible = visible;
  }
  
  /**
   * Destrói o componente e libera recursos
   */
  destroy(): void {
    if (this.container.parent) {
      this.container.parent.removeChild(this.container);
    }
    this.container.destroy({ children: true });
  }
  
  /**
   * Adiciona um novo resultado de benchmark
   * @param result Resultado do benchmark
   */
  addResult(result: BenchmarkResult): void {
    this.latestResult = result;
    this.results.push(result);
    
    // Limitar o histórico a 10 últimos resultados
    if (this.results.length > 10) {
      this.results.shift();
    }
    
    this.updateResultDisplay();
    this.updateHistoryDisplay();
  }
  
  /**
   * Atualiza a exibição do resultado mais recente
   */
  private updateResultDisplay(): void {
    if (!this.resultsText || !this.latestResult) return;
    
    const result = this.latestResult;
    let resultText = `Cenário: ${result.scenario}\n`;
    resultText += `FPS Médio: ${result.averageFps.toFixed(2)}\n`;
    resultText += `FPS Mínimo: ${result.minFps.toFixed(2)}\n`;
    resultText += `FPS Máximo: ${result.maxFps.toFixed(2)}\n`;
    
    if (result.targetFps) {
      const percentage = ((result.averageFps / result.targetFps) * 100).toFixed(2);
      resultText += `Alvo (${result.targetFps} FPS): ${percentage}%\n`;
    }
    
    resultText += `Tempo de Renderização: ${result.renderTime.toFixed(2)}ms\n`;
    resultText += `Uso de Memória: ${(result.memoryUsage / 1024 / 1024).toFixed(2)} MB\n`;
    resultText += `Duração: ${result.duration}s\n`;
    resultText += `Status: ${result.success ? 'Sucesso' : 'Falha'}`;
    
    this.resultsText.setText(resultText);
  }
  
  /**
   * Atualiza a exibição do histórico de resultados
   */
  private updateHistoryDisplay(): void {
    // Limpar elementos existentes no painel de histórico
    this.clearHistoryPanel();
    
    if (this.results.length === 0) {
      // Mensagem se não houver histórico
      const noHistoryText = this.uiFactory.createText(
        'noHistoryText',
        'Não há histórico de benchmarks.',
        10,
        190,
        { fontSize: 14, fill: 0xCCCCCC }
      );
      this.container.addChild(noHistoryText.displayObject);
      return;
    }
    
    // Desenhar histórico como lista simples
    const maxItems = 5; // Limitar número de itens visíveis
    const recentResults = this.results.slice(-maxItems).reverse();
    
    recentResults.forEach((result, index) => {
      const y = 190 + index * 22;
      
      // Formato: <data> - <cenário>: <FPS Médio> FPS
      const date = new Date(result.timestamp);
      const dateStr = date.toLocaleDateString();
      const timeStr = date.toLocaleTimeString();
      const text = `${dateStr} ${timeStr} - ${result.scenario}: ${result.averageFps.toFixed(2)} FPS`;
      
      const historyItem = this.uiFactory.createText(
        `historyItem${index}`,
        text,
        10,
        y,
        { fontSize: 13, fill: 0xFFFFFF }
      );
      this.container.addChild(historyItem.displayObject);
    });
  }
  
  /**
   * Limpa os elementos visuais do painel de histórico
   */
  private clearHistoryPanel(): void {
    // Remover elementos filhos do container que representam itens do histórico
    for (let i = this.container.children.length - 1; i >= 0; i--) {
      const child = this.container.children[i];
      if (child.name && child.name.startsWith('historyItem') || child.name === 'noHistoryText') {
        this.container.removeChild(child);
      }
    }
  }
  
  /**
   * Limpa todos os resultados
   */
  clearResults(): void {
    this.latestResult = null;
    this.results = [];
    
    if (this.resultsText) {
      this.resultsText.setText('Nenhum resultado disponível.');
    }
    
    this.updateHistoryDisplay();
  }
  
  /**
   * Define uma lista de resultados históricos
   * @param results Lista de resultados
   */
  setHistoricalResults(results: BenchmarkResult[]): void {
    this.results = [...results];
    
    // Definir o resultado mais recente
    if (results.length > 0) {
      // Encontrar resultado com timestamp mais recente
      this.latestResult = results.reduce((latest, current) => 
        latest.timestamp > current.timestamp ? latest : current
      );
    } else {
      this.latestResult = null;
    }
    
    this.updateResultDisplay();
    this.updateHistoryDisplay();
  }
} 