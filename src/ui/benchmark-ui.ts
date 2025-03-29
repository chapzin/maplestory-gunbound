import * as PIXI from 'pixi.js';
import { UISystem } from '../core/ui/ui-system';
import { 
  TextElement, 
  ButtonElement, 
  ProgressBarElement 
} from '../core/ui/elements';
import { BenchmarkSystem, BenchmarkConfig, BenchmarkResult } from '../systems/benchmark-system';

/**
 * Interface de usuário para o sistema de benchmark
 * Permite iniciar benchmarks com diferentes configurações e visualizar resultados
 */
export class BenchmarkUI {
  private uiSystem: UISystem;
  private benchmarkSystem: BenchmarkSystem;
  private isVisible: boolean = false;
  private panelContainer: PIXI.Container;
  private resultsContainer: PIXI.Container;
  private screenWidth: number;
  private screenHeight: number;
  
  // Elementos da UI
  private startButton?: ButtonElement;
  private stopButton?: ButtonElement;
  private scenarioInput?: TextElement;
  private durationInput?: TextElement;
  private targetFpsInput?: TextElement;
  private warmupInput?: TextElement;
  private resultsText?: TextElement;
  private progressBar?: ProgressBarElement;
  
  /**
   * Inicializa a interface do benchmark
   * @param uiSystem Sistema de UI base
   * @param benchmarkSystem Sistema de benchmark
   * @param screenWidth Largura da tela
   * @param screenHeight Altura da tela
   */
  constructor(
    uiSystem: UISystem, 
    screenWidth: number, 
    screenHeight: number
  ) {
    this.uiSystem = uiSystem;
    this.benchmarkSystem = BenchmarkSystem.getInstance();
    this.screenWidth = screenWidth;
    this.screenHeight = screenHeight;
    
    // Cria containers para os elementos
    this.panelContainer = new PIXI.Container();
    this.resultsContainer = new PIXI.Container();
    
    // Inicializa a UI
    this.initUI();
  }
  
  /**
   * Inicializa todos os elementos da UI do benchmark
   */
  private initUI(): void {
    // Painel principal
    const panel = new PIXI.Graphics();
    panel.beginFill(0x000000, 0.8);
    panel.drawRect(0, 0, 400, 400);
    panel.endFill();
    panel.position.set(
      (this.screenWidth - 400) / 2,
      (this.screenHeight - 400) / 2
    );
    this.panelContainer.addChild(panel);
    
    // Título
    const title = new PIXI.Text('Sistema de Benchmark', {
      fontFamily: 'Arial',
      fontSize: 20,
      fill: 0xFFFFFF,
      fontWeight: 'bold'
    });
    title.position.set(
      panel.width / 2 - title.width / 2,
      20
    );
    this.panelContainer.addChild(title);
    
    // Posição base para os elementos de entrada
    const baseX = panel.x + 20;
    const baseY = panel.y + 60;
    const spacing = 40;
    
    // Campo de texto para o cenário
    this.createInputGroup('Cenário:', 'scenarioInput', 'MenuPrincipal', baseX, baseY);
    
    // Campo de texto para a duração
    this.createInputGroup('Duração (seg):', 'durationInput', '5', baseX, baseY + spacing);
    
    // Campo de texto para o FPS alvo
    this.createInputGroup('FPS Alvo:', 'targetFpsInput', '60', baseX, baseY + spacing * 2);
    
    // Campo de texto para o tempo de aquecimento
    this.createInputGroup('Aquecimento (seg):', 'warmupInput', '2', baseX, baseY + spacing * 3);
    
    // Barra de progresso
    this.progressBar = this.uiSystem.createProgressBar(
      'benchmarkProgress',
      baseX,
      baseY + spacing * 4,
      360,
      20,
      0,
      100,
      0x333333,
      0x00CC00
    );
    this.progressBar.setVisible(false);
    
    // Botão para iniciar benchmark
    this.startButton = this.uiSystem.createButton(
      'startBenchmarkButton',
      'Iniciar Benchmark',
      baseX + 80,
      baseY + spacing * 5,
      200,
      30,
      () => this.startBenchmark(),
      {
        fontSize: 16,
        fill: 0xFFFFFF
      }
    );
    
    // Botão para parar benchmark
    this.stopButton = this.uiSystem.createButton(
      'stopBenchmarkButton',
      'Parar Benchmark',
      baseX + 80,
      baseY + spacing * 5,
      200,
      30,
      () => this.stopBenchmark(),
      {
        fontSize: 16,
        fill: 0xFFFFFF
      }
    );
    this.stopButton.setVisible(false);
    
    // Texto para mostrar resultados
    this.resultsText = this.uiSystem.createText(
      'benchmarkResults',
      'Os resultados do benchmark aparecerão aqui.',
      baseX,
      baseY + spacing * 6,
      {
        fontSize: 14,
        fill: 0xFFFFFF,
        wordWrap: true,
        wordWrapWidth: 360
      }
    );
    
    // Botão para fechar a UI
    const closeButton = this.uiSystem.createButton(
      'closeBenchmarkButton',
      'X',
      panel.x + panel.width - 30,
      panel.y + 10,
      20,
      20,
      () => this.hide(),
      {
        fontSize: 14,
        fill: 0xFF0000
      }
    );
    
    // Container para os gráficos de resultados
    this.resultsContainer.position.set(baseX, baseY + spacing * 8);
    this.panelContainer.addChild(this.resultsContainer);
    
    // Esconde a UI ao inicializar
    this.hide();
    
    // Adiciona ao sistema de UI
    this.uiSystem.container.addChild(this.panelContainer);
  }
  
  /**
   * Cria um grupo de input com label e campo de texto
   */
  private createInputGroup(
    labelText: string,
    inputId: string,
    defaultValue: string,
    x: number,
    y: number
  ): TextElement {
    // Label
    const label = this.uiSystem.createText(
      `${inputId}Label`,
      labelText,
      x,
      y,
      {
        fontSize: 14,
        fill: 0xFFFFFF
      }
    );
    
    // Campo de entrada - usando um contêiner com background
    const inputBg = new PIXI.Graphics();
    inputBg.beginFill(0x333333);
    inputBg.drawRect(0, 0, 100, 24);
    inputBg.endFill();
    inputBg.position.set(x + 160, y - 2);
    this.panelContainer.addChild(inputBg);
    
    // Texto do input
    const input = this.uiSystem.createText(
      inputId,
      defaultValue,
      x + 165,
      y,
      {
        fontSize: 14,
        fill: 0xFFFFFF
      }
    );
    
    return input;
  }
  
  /**
   * Inicia um benchmark com as configurações fornecidas
   */
  private startBenchmark(): void {
    if (!this.scenarioInput || !this.durationInput || 
        !this.targetFpsInput || !this.warmupInput ||
        !this.progressBar || !this.startButton || 
        !this.stopButton || !this.resultsText) {
      console.error('Elementos de UI não inicializados corretamente');
      return;
    }
    
    // Obtém os valores dos campos
    const scenarioName = (this.scenarioInput.displayObject as PIXI.Text).text;
    const duration = parseInt((this.durationInput.displayObject as PIXI.Text).text) || 5;
    const targetFps = parseInt((this.targetFpsInput.displayObject as PIXI.Text).text) || 60;
    const warmupTime = parseInt((this.warmupInput.displayObject as PIXI.Text).text) || 2;
    
    // Configura o benchmark
    const config: BenchmarkConfig = {
      scenarioName,
      duration,
      targetFps,
      warmupTime,
      autoSave: true,
      callback: (report) => this.onBenchmarkComplete(report)
    };
    
    // Inicia o benchmark
    this.benchmarkSystem.startBenchmark(config);
    
    // Atualiza a UI
    this.startButton.setVisible(false);
    this.stopButton.setVisible(true);
    this.progressBar.setVisible(true);
    this.progressBar.setValue(0);
    
    // Atualiza o texto de resultados
    this.resultsText.setText('Benchmark em andamento...');
    
    // Configura timer para atualizar a barra de progresso
    const totalTime = warmupTime + duration;
    let elapsedTime = 0;
    
    const progressInterval = setInterval(() => {
      elapsedTime += 0.1;
      const progress = (elapsedTime / totalTime) * 100;
      
      if (progress >= 100 || !this.benchmarkSystem.isActive()) {
        clearInterval(progressInterval);
        if (this.progressBar) {
          this.progressBar.setValue(100);
        }
        return;
      }
      
      if (this.progressBar) {
        this.progressBar.setValue(progress);
      }
    }, 100);
  }
  
  /**
   * Para o benchmark em andamento
   */
  private stopBenchmark(): void {
    if (!this.startButton || !this.stopButton || !this.progressBar) {
      return;
    }
    
    // Para o benchmark
    const report = this.benchmarkSystem.stopBenchmark();
    
    // Atualiza a UI
    this.startButton.setVisible(true);
    this.stopButton.setVisible(false);
    
    if (!report) {
      if (this.resultsText) {
        this.resultsText.setText('Benchmark interrompido pelo usuário.');
      }
    }
  }
  
  /**
   * Manipula o término do benchmark
   * @param report Relatório de performance
   */
  private onBenchmarkComplete(report: any): void {
    if (!this.startButton || !this.stopButton || !this.resultsText) {
      return;
    }
    
    // Atualiza a UI
    this.startButton.setVisible(true);
    this.stopButton.setVisible(false);
    
    // Formata o relatório como texto
    const resultText = `
      Cenário: ${report.scenarioName}
      Duração: ${report.duration.toFixed(2)}s
      FPS Médio: ${report.averageFps.toFixed(2)}
      FPS Mínimo: ${report.minFps.toFixed(2)}
      FPS Máximo: ${report.maxFps.toFixed(2)}
      Tempo de Renderização: ${report.averageRenderTime.toFixed(2)}ms
      Uso de Memória: ${report.averageMemoryUsage.toFixed(2)} MB
    `;
    
    this.resultsText.setText(resultText);
    
    // Adiciona resultados históricos
    this.displayHistoricalResults();
  }
  
  /**
   * Exibe resultados históricos em um gráfico simples
   */
  private displayHistoricalResults(): void {
    // Limpa o container de resultados
    this.resultsContainer.removeChildren();
    
    // Obtém resultados históricos
    const results = this.benchmarkSystem.getResults();
    if (results.length <= 1) {
      return; // Não há dados suficientes para comparação
    }
    
    // Dimensões do gráfico
    const width = 360;
    const height = 100;
    
    // Cria o fundo do gráfico
    const background = new PIXI.Graphics();
    background.beginFill(0x222222);
    background.drawRect(0, 0, width, height);
    background.endFill();
    this.resultsContainer.addChild(background);
    
    // Desenha a grade
    const grid = new PIXI.Graphics();
    grid.lineStyle(1, 0x444444, 0.5);
    
    // Linhas horizontais
    for (let i = 0; i <= height; i += 20) {
      grid.moveTo(0, i);
      grid.lineTo(width, i);
    }
    
    // Linhas verticais
    for (let i = 0; i <= width; i += 30) {
      grid.moveTo(i, 0);
      grid.lineTo(i, height);
    }
    
    this.resultsContainer.addChild(grid);
    
    // Desenha barras para cada resultado (apenas últimos 10)
    const recentResults = results.slice(-10);
    const barWidth = Math.min(width / recentResults.length - 5, 30);
    const maxFps = Math.max(...recentResults.map(r => r.averageFps));
    
    for (let i = 0; i < recentResults.length; i++) {
      const result = recentResults[i];
      const normalizedHeight = (result.averageFps / maxFps) * height;
      const x = i * (width / recentResults.length) + (width / recentResults.length - barWidth) / 2;
      const y = height - normalizedHeight;
      
      // Desenha a barra
      const bar = new PIXI.Graphics();
      
      // Cor da barra baseada no FPS (vermelho para baixo, verde para alto)
      const targetFps = result.targetFps || 60;
      const fpsRatio = result.averageFps / targetFps;
      let color;
      
      if (fpsRatio >= 1) {
        color = 0x00FF00; // Verde
      } else if (fpsRatio >= 0.8) {
        color = 0xFFFF00; // Amarelo
      } else {
        color = 0xFF0000; // Vermelho
      }
      
      bar.beginFill(color);
      bar.drawRect(x, y, barWidth, normalizedHeight);
      bar.endFill();
      
      this.resultsContainer.addChild(bar);
      
      // Adiciona valor de FPS acima da barra
      const fpsText = new PIXI.Text(result.averageFps.toFixed(0), {
        fontFamily: 'Arial',
        fontSize: 10,
        fill: 0xFFFFFF
      });
      fpsText.position.set(x + barWidth / 2 - fpsText.width / 2, y - 15);
      this.resultsContainer.addChild(fpsText);
    }
  }
  
  /**
   * Mostra a interface do benchmark
   */
  public show(): void {
    if (!this.isVisible) {
      this.panelContainer.visible = true;
      this.isVisible = true;
    }
  }
  
  /**
   * Esconde a interface do benchmark
   */
  public hide(): void {
    if (this.isVisible) {
      this.panelContainer.visible = false;
      this.isVisible = false;
    }
  }
  
  /**
   * Alterna a visibilidade da interface
   */
  public toggle(): void {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }
  
  /**
   * Libera recursos utilizados
   */
  public destroy(): void {
    // Remove elementos do sistema de UI
    this.uiSystem.removeElement('scenarioInput');
    this.uiSystem.removeElement('scenarioInputLabel');
    this.uiSystem.removeElement('durationInput');
    this.uiSystem.removeElement('durationInputLabel');
    this.uiSystem.removeElement('targetFpsInput');
    this.uiSystem.removeElement('targetFpsInputLabel');
    this.uiSystem.removeElement('warmupInput');
    this.uiSystem.removeElement('warmupInputLabel');
    this.uiSystem.removeElement('benchmarkProgress');
    this.uiSystem.removeElement('startBenchmarkButton');
    this.uiSystem.removeElement('stopBenchmarkButton');
    this.uiSystem.removeElement('benchmarkResults');
    this.uiSystem.removeElement('closeBenchmarkButton');
    
    // Remove containers
    this.resultsContainer.removeChildren();
    this.panelContainer.removeChildren();
    this.uiSystem.container.removeChild(this.panelContainer);
  }
} 