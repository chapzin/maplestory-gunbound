import * as PIXI from 'pixi.js';
import { IBenchmarkComponent, IUIElementFactory } from './benchmark-interfaces';
import { BenchmarkResult } from '../../systems/benchmark-system';

/**
 * Componente responsável pela visualização gráfica dos resultados do benchmark
 */
export class BenchmarkVisualizerComponent implements IBenchmarkComponent {
  private container: PIXI.Container;
  private uiFactory: IUIElementFactory;
  private isVisible: boolean = false;
  
  // Elementos gráficos
  private graphContainer: PIXI.Container;
  private axisContainer: PIXI.Container;
  private dataContainer: PIXI.Container;
  
  // Dimensões do gráfico
  private readonly graphWidth: number = 340;
  private readonly graphHeight: number = 200;
  private readonly paddingLeft: number = 40;
  private readonly paddingBottom: number = 30;
  private readonly paddingTop: number = 20;
  private readonly paddingRight: number = 10;
  
  // Dados
  private results: BenchmarkResult[] = [];
  
  /**
   * Inicializa o componente de visualização
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
    
    // Criar containers aninhados
    this.graphContainer = this.uiFactory.createContainer(0, 0);
    this.axisContainer = this.uiFactory.createContainer(0, 0);
    this.dataContainer = this.uiFactory.createContainer(this.paddingLeft, this.paddingTop);
    
    // Adicionar à hierarquia
    this.container.addChild(this.graphContainer);
    this.graphContainer.addChild(this.axisContainer);
    this.graphContainer.addChild(this.dataContainer);
    
    parent.addChild(this.container);
  }
  
  /**
   * Renderiza o componente de visualização
   */
  render(): void {
    // Fundo do gráfico
    const background = this.uiFactory.createPanel(
      0, 0, 
      this.graphWidth + this.paddingLeft + this.paddingRight, 
      this.graphHeight + this.paddingTop + this.paddingBottom, 
      0x333333, 0.9
    );
    this.graphContainer.addChild(background);
    
    // Título do gráfico
    const titleStyle = { fontSize: 16, fill: 0xFFFFFF, fontWeight: 'bold' };
    const title = this.uiFactory.createText(
      'visualizerTitle', 
      'Visualização de Performance', 
      10, 
      10, 
      titleStyle
    );
    this.graphContainer.addChild(title.displayObject);
    
    // Desenhar eixos
    this.drawAxes();
    
    // Estado inicial
    this.setVisible(false);
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
   * Desenha os eixos do gráfico
   */
  private drawAxes(): void {
    // Limpar eixos anteriores
    while (this.axisContainer.children.length > 0) {
      this.axisContainer.removeChildAt(0);
    }
    
    // Criar eixos
    const axisGraphics = new PIXI.Graphics();
    axisGraphics.lineStyle(2, 0xFFFFFF, 0.8);
    
    // Eixo Y (vertical)
    axisGraphics.moveTo(this.paddingLeft, this.paddingTop);
    axisGraphics.lineTo(this.paddingLeft, this.graphHeight + this.paddingTop);
    
    // Eixo X (horizontal)
    axisGraphics.moveTo(this.paddingLeft, this.graphHeight + this.paddingTop);
    axisGraphics.lineTo(this.paddingLeft + this.graphWidth, this.graphHeight + this.paddingTop);
    
    // Adicionar ao container
    this.axisContainer.addChild(axisGraphics);
    
    // Adicionar marcações ao eixo Y
    const yLabelStyle = { fontSize: 12, fill: 0xCCCCCC };
    const numYLabels = 5;
    
    for (let i = 0; i <= numYLabels; i++) {
      const y = this.paddingTop + (this.graphHeight / numYLabels) * (numYLabels - i);
      const value = (60 / numYLabels) * i; // Escala para FPS (0-60 padrão)
      
      // Linha de grade
      const gridLine = new PIXI.Graphics();
      gridLine.lineStyle(1, 0xCCCCCC, 0.2);
      gridLine.moveTo(this.paddingLeft, y);
      gridLine.lineTo(this.paddingLeft + this.graphWidth, y);
      this.axisContainer.addChild(gridLine);
      
      // Label
      const yLabel = this.uiFactory.createText(
        `yAxis${i}`,
        value.toString(),
        this.paddingLeft - 25,
        y - 6,
        yLabelStyle
      );
      this.axisContainer.addChild(yLabel.displayObject);
    }
    
    // Label do eixo Y
    const yAxisLabel = this.uiFactory.createText(
      'yAxisLabel',
      'FPS',
      10,
      this.paddingTop + this.graphHeight / 2 - 10,
      { fontSize: 14, fill: 0xFFFFFF }
    );
    this.axisContainer.addChild(yAxisLabel.displayObject);
  }
  
  /**
   * Atualiza o gráfico com novos dados
   * @param results Resultados do benchmark para visualização
   */
  updateData(results: BenchmarkResult[]): void {
    this.results = [...results];
    
    // Limpar gráficos de dados anteriores
    while (this.dataContainer.children.length > 0) {
      this.dataContainer.removeChildAt(0);
    }
    
    if (this.results.length === 0) return;
    
    // Determinar máximo FPS para escala
    const maxFps = Math.max(...this.results.map(r => r.maxFps), 60); // Mínimo de 60 FPS como máximo
    
    // Filtrar para os últimos 10 resultados
    const dataPoints = this.results.slice(-10);
    
    // Calcular escala
    const xScale = this.graphWidth / Math.max(dataPoints.length - 1, 1);
    const yScale = this.graphHeight / maxFps;
    
    // Desenhar linha para FPS médio
    const lineGraphics = new PIXI.Graphics();
    lineGraphics.lineStyle(3, 0x00CC00, 0.8);
    
    // Iniciar no primeiro ponto
    lineGraphics.moveTo(0, this.graphHeight - dataPoints[0].averageFps * yScale);
    
    // Conectar os pontos
    for (let i = 1; i < dataPoints.length; i++) {
      const x = i * xScale;
      const y = this.graphHeight - dataPoints[i].averageFps * yScale;
      lineGraphics.lineTo(x, y);
    }
    
    this.dataContainer.addChild(lineGraphics);
    
    // Adicionar pontos e rótulos
    for (let i = 0; i < dataPoints.length; i++) {
      const result = dataPoints[i];
      const x = i * xScale;
      const y = this.graphHeight - result.averageFps * yScale;
      
      // Desenhar ponto
      const pointGraphics = new PIXI.Graphics();
      pointGraphics.beginFill(0x00FF00);
      pointGraphics.drawCircle(x, y, 5);
      pointGraphics.endFill();
      this.dataContainer.addChild(pointGraphics);
      
      // Adicionar rótulo de FPS
      const fpsLabel = this.uiFactory.createText(
        `fpsLabel${i}`,
        result.averageFps.toFixed(1),
        x - 10,
        y - 20,
        { fontSize: 12, fill: 0xFFFFFF }
      );
      this.dataContainer.addChild(fpsLabel.displayObject);
      
      // Adicionar rótulos no eixo X (para alguns pontos)
      if (i % 2 === 0 || i === dataPoints.length - 1) {
        const date = new Date(result.timestamp);
        const timeLabel = this.uiFactory.createText(
          `timeLabel${i}`,
          date.toLocaleTimeString().slice(0, 5),
          x - 15,
          this.graphHeight + 5,
          { fontSize: 11, fill: 0xCCCCCC }
        );
        this.dataContainer.addChild(timeLabel.displayObject);
      }
    }
    
    // Adicionar linha de FPS alvo (se existir)
    const targetFps = dataPoints[0].targetFps;
    if (targetFps) {
      const targetY = this.graphHeight - targetFps * yScale;
      
      const targetLine = new PIXI.Graphics();
      targetLine.lineStyle(2, 0xFF9900, 0.6);
      targetLine.moveTo(0, targetY);
      targetLine.lineTo(this.graphWidth, targetY);
      
      this.dataContainer.addChild(targetLine);
      
      // Label para a linha de FPS alvo
      const targetLabel = this.uiFactory.createText(
        'targetFpsLabel',
        `Alvo: ${targetFps} FPS`,
        this.graphWidth - 80,
        targetY - 15,
        { fontSize: 12, fill: 0xFF9900 }
      );
      this.dataContainer.addChild(targetLabel.displayObject);
    }
  }
} 