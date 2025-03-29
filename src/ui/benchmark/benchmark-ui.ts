import * as PIXI from 'pixi.js';
import { UISystem } from '../../core/ui/ui-system';
import EventEmitter from 'eventemitter3';
import { BenchmarkConfig, BenchmarkResult } from '../../systems/benchmark-system';

import { 
  BenchmarkFormComponent, 
  BenchmarkResultsComponent,
  BenchmarkVisualizerComponent
} from './index';

import { 
  UIElementFactory, 
  BenchmarkService 
} from './index';

import { 
  IBenchmarkFormData, 
  IBenchmarkService
} from './benchmark-interfaces';

import { 
  BenchmarkEventType, 
  BenchmarkEventPayload 
} from './benchmark-events';

/**
 * Interface principal para o sistema de benchmark
 * Coordena os componentes e gerencia a visualização
 */
export class BenchmarkUI {
  private uiSystem: UISystem;
  private benchmarkService: IBenchmarkService;
  private uiFactory: UIElementFactory;
  private eventEmitter: any;
  
  private container: PIXI.Container;
  private isVisible: boolean = false;
  
  // Dimensões
  private screenWidth: number;
  private screenHeight: number;
  
  // Componentes
  private formComponent: BenchmarkFormComponent;
  private resultsComponent: BenchmarkResultsComponent;
  private visualizerComponent: BenchmarkVisualizerComponent;
  
  /**
   * Inicializa a interface do benchmark
   * @param uiSystem Sistema de UI base
   * @param screenWidth Largura da tela
   * @param screenHeight Altura da tela
   */
  constructor(
    uiSystem: UISystem, 
    screenWidth: number, 
    screenHeight: number
  ) {
    this.uiSystem = uiSystem;
    this.screenWidth = screenWidth;
    this.screenHeight = screenHeight;
    
    // Criar o container principal
    this.container = new PIXI.Container();
    
    // Criar emitter para comunicação entre componentes
    this.eventEmitter = new EventEmitter();
    
    // Inicializar helpers
    this.uiFactory = new UIElementFactory(uiSystem);
    this.benchmarkService = new BenchmarkService();
    
    // Inicializar componentes
    this.initComponents();
    
    // Configurar manipuladores de eventos
    this.setupEventListeners();
    
    // Adicionar container principal ao sistema de UI
    this.uiSystem.container.addChild(this.container);
    
    // Esconder por padrão
    this.hide();
  }
  
  /**
   * Inicializa os componentes da UI
   */
  private initComponents(): void {
    // Calcular posições centrais
    const panelWidth = 400;
    const panelHeight = 600;
    const centerX = (this.screenWidth - panelWidth) / 2;
    const centerY = (this.screenHeight - panelHeight) / 2;
    
    // Criar background principal
    const panel = new PIXI.Graphics();
    panel.beginFill(0x000000, 0.8);
    panel.drawRect(0, 0, panelWidth, panelHeight);
    panel.endFill();
    panel.position.set(centerX, centerY);
    this.container.addChild(panel);
    
    // Criar componente de formulário (posicionado no topo)
    this.formComponent = new BenchmarkFormComponent(
      this.uiFactory,
      this.container,
      centerX + 20,
      centerY + 20,
      this.eventEmitter
    );
    this.formComponent.render();
    
    // Criar componente de resultados (posicionado abaixo do formulário)
    this.resultsComponent = new BenchmarkResultsComponent(
      this.uiFactory,
      this.container,
      centerX + 20,
      centerY + 240
    );
    this.resultsComponent.render();
    
    // Criar componente de visualização (na parte inferior)
    this.visualizerComponent = new BenchmarkVisualizerComponent(
      this.uiFactory,
      this.container,
      centerX + 20,
      centerY + 280
    );
    this.visualizerComponent.render();
    
    // Botão para fechar a UI
    const closeButton = this.uiFactory.createButton(
      'closeBenchmarkButton',
      'X',
      centerX + panelWidth - 30,
      centerY + 10,
      20,
      20,
      () => this.hide(),
      {
        fontSize: 14,
        fill: 0xFF0000
      }
    );
    this.container.addChild(closeButton.displayObject);
    
    // Carregar resultados anteriores
    const historicalResults = this.benchmarkService.getHistoricalResults();
    this.resultsComponent.setHistoricalResults(historicalResults);
    this.visualizerComponent.updateData(historicalResults);
  }
  
  /**
   * Configura os listeners de eventos para comunicação entre componentes
   */
  private setupEventListeners(): void {
    // Quando o formulário é submetido, inicia o benchmark
    this.eventEmitter.on(BenchmarkEventType.FORM_SUBMITTED, (data: BenchmarkEventPayload) => {
      if (!data.formData) return;
      
      // Converter para configuração de benchmark
      const config: BenchmarkConfig = {
        scenarioName: data.formData.scenarioName,
        duration: data.formData.duration,
        targetFps: data.formData.targetFps,
        warmupTime: data.formData.warmupTime,
        autoSave: true
      };
      
      // Iniciar benchmark
      this.benchmarkService.startBenchmark(config);
      
      // Emitir evento
      this.eventEmitter.emit(BenchmarkEventType.BENCHMARK_STARTED, {
        timestamp: Date.now()
      });
    });
    
    // Quando o formulário é cancelado, para o benchmark
    this.eventEmitter.on(BenchmarkEventType.FORM_CANCELED, () => {
      this.benchmarkService.stopBenchmark();
      
      // Emitir evento
      this.eventEmitter.emit(BenchmarkEventType.BENCHMARK_STOPPED, {
        timestamp: Date.now()
      });
    });
    
    // Quando um benchmark é completado, atualiza os resultados
    this.benchmarkService.onBenchmarkComplete((result: BenchmarkResult) => {
      // Atualizar componentes
      this.resultsComponent.addResult(result);
      this.visualizerComponent.updateData(this.benchmarkService.getHistoricalResults());
      
      // Reset formulário após benchmark
      if (this.formComponent) {
        this.formComponent.reset();
      }
      
      // Emitir evento
      this.eventEmitter.emit(BenchmarkEventType.BENCHMARK_COMPLETED, {
        timestamp: Date.now(),
        result: {
          scenario: result.scenario,
          averageFps: result.averageFps,
          minFps: result.minFps,
          maxFps: result.maxFps,
          duration: result.duration,
          timestamp: result.timestamp
        }
      });
    });
  }
  
  /**
   * Mostra a interface de benchmark
   */
  show(): void {
    if (this.isVisible) return;
    
    this.isVisible = true;
    this.container.visible = true;
    
    // Emitir evento
    this.eventEmitter.emit(BenchmarkEventType.UI_OPENED, {
      timestamp: Date.now()
    });
  }
  
  /**
   * Esconde a interface de benchmark
   */
  hide(): void {
    if (!this.isVisible) return;
    
    this.isVisible = false;
    this.container.visible = false;
    
    // Emitir evento
    this.eventEmitter.emit(BenchmarkEventType.UI_CLOSED, {
      timestamp: Date.now()
    });
  }
  
  /**
   * Alterna a visibilidade da interface
   */
  toggle(): void {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }
  
  /**
   * Destrói a interface e libera recursos
   */
  destroy(): void {
    // Destruir componentes
    this.formComponent.destroy();
    this.resultsComponent.destroy();
    this.visualizerComponent.destroy();
    
    // Remover event listeners
    this.eventEmitter.removeAllListeners();
    
    // Remover container
    if (this.container.parent) {
      this.container.parent.removeChild(this.container);
    }
    this.container.destroy({ children: true });
  }
} 