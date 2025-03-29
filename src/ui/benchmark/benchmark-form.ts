import * as PIXI from 'pixi.js';
import { IBenchmarkComponent, IBenchmarkFormData, IUIElementFactory } from './benchmark-interfaces';
import { TextElement, ButtonElement } from '../../core/ui/elements';
import { BenchmarkEventType, BenchmarkEventPayload } from './benchmark-events';
import EventEmitter from 'eventemitter3';

/**
 * Componente responsável pelo formulário de configuração do benchmark
 */
export class BenchmarkFormComponent implements IBenchmarkComponent {
  private container: PIXI.Container;
  private uiFactory: IUIElementFactory;
  private eventEmitter: any; // EventEmitter
  private isVisible: boolean = false;
  
  // Elementos de UI
  private scenarioInput?: TextElement;
  private durationInput?: TextElement;
  private targetFpsInput?: TextElement;
  private warmupInput?: TextElement;
  private startButton?: ButtonElement;
  private stopButton?: ButtonElement;
  
  // Valores padrão
  private defaultValues: IBenchmarkFormData = {
    scenarioName: 'MenuPrincipal',
    duration: 5,
    targetFps: 60,
    warmupTime: 2
  };
  
  /**
   * Inicializa o componente de formulário
   * @param uiFactory Factory para criar elementos de UI
   * @param parent Container pai onde o componente será adicionado
   * @param x Posição X do componente
   * @param y Posição Y do componente
   */
  constructor(
    uiFactory: IUIElementFactory,
    parent: PIXI.Container,
    private x: number,
    private y: number,
    eventEmitter: any
  ) {
    this.uiFactory = uiFactory;
    this.eventEmitter = eventEmitter;
    this.container = this.uiFactory.createContainer(x, y);
    parent.addChild(this.container);
  }
  
  /**
   * Renderiza o componente de formulário
   */
  render(): void {
    // Background do formulário
    const formBg = this.uiFactory.createPanel(0, 0, 360, 200, 0x333333, 0.9);
    this.container.addChild(formBg);
    
    // Título do formulário
    const titleStyle = { fontSize: 16, fill: 0xFFFFFF, fontWeight: 'bold' };
    const title = this.uiFactory.createText('formTitle', 'Configuração de Benchmark', 10, 10, titleStyle);
    this.container.addChild(title.displayObject);
    
    // Campos de entrada
    const spacing = 30;
    const baseY = 40;
    
    // Campo de texto para o cenário
    this.createInputGroup('Cenário:', 'scenarioInput', this.defaultValues.scenarioName.toString(), 10, baseY);
    
    // Campo de texto para a duração
    this.createInputGroup(
      'Duração (seg):', 
      'durationInput', 
      this.defaultValues.duration.toString(), 
      10, 
      baseY + spacing
    );
    
    // Campo de texto para o FPS alvo
    this.createInputGroup(
      'FPS Alvo:', 
      'targetFpsInput', 
      this.defaultValues.targetFps.toString(), 
      10, 
      baseY + spacing * 2
    );
    
    // Campo de texto para o tempo de aquecimento
    this.createInputGroup(
      'Aquecimento (seg):', 
      'warmupInput', 
      this.defaultValues.warmupTime.toString(), 
      10, 
      baseY + spacing * 3
    );
    
    // Botões
    this.startButton = this.uiFactory.createButton(
      'startBenchmarkButton',
      'Iniciar Benchmark',
      60,
      baseY + spacing * 4,
      240,
      30,
      () => this.handleStart(),
      { fontSize: 16, fill: 0xFFFFFF }
    );
    this.container.addChild(this.startButton.displayObject);
    
    this.stopButton = this.uiFactory.createButton(
      'stopBenchmarkButton',
      'Parar Benchmark',
      60,
      baseY + spacing * 4,
      240,
      30,
      () => this.handleStop(),
      { fontSize: 16, fill: 0xFFFFFF }
    );
    this.container.addChild(this.stopButton.displayObject);
    this.stopButton.setVisible(false);
    
    this.setVisible(false);
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
    const label = this.uiFactory.createText(
      `${inputId}Label`,
      labelText,
      x,
      y,
      { fontSize: 14, fill: 0xFFFFFF }
    );
    this.container.addChild(label.displayObject);
    
    // Background do input
    const inputBg = this.uiFactory.createPanel(x + 140, y - 2, 180, 24, 0x222222, 1);
    this.container.addChild(inputBg);
    
    // Texto do input
    const input = this.uiFactory.createText(
      inputId,
      defaultValue,
      x + 145,
      y,
      { fontSize: 14, fill: 0xFFFFFF }
    );
    this.container.addChild(input.displayObject);
    
    // Armazenar referência ao input
    if (inputId === 'scenarioInput') this.scenarioInput = input;
    else if (inputId === 'durationInput') this.durationInput = input;
    else if (inputId === 'targetFpsInput') this.targetFpsInput = input;
    else if (inputId === 'warmupInput') this.warmupInput = input;
    
    return input;
  }
  
  /**
   * Define a visibilidade do componente
   */
  setVisible(visible: boolean): void {
    this.isVisible = visible;
    this.container.visible = visible;
  }
  
  /**
   * Obtém os dados do formulário
   */
  getFormData(): IBenchmarkFormData {
    return {
      scenarioName: this.scenarioInput ? (this.scenarioInput.displayObject as PIXI.Text).text : this.defaultValues.scenarioName,
      duration: this.parseNumericInput(this.durationInput, this.defaultValues.duration),
      targetFps: this.parseNumericInput(this.targetFpsInput, this.defaultValues.targetFps),
      warmupTime: this.parseNumericInput(this.warmupInput, this.defaultValues.warmupTime)
    };
  }
  
  /**
   * Converte um elemento de texto para número com valor padrão
   */
  private parseNumericInput(input: TextElement | undefined, defaultValue: number): number {
    if (!input) return defaultValue;
    const value = parseInt((input.displayObject as PIXI.Text).text);
    return isNaN(value) ? defaultValue : value;
  }
  
  /**
   * Manipula o clique no botão de início
   */
  private handleStart(): void {
    if (!this.startButton || !this.stopButton) return;
    
    this.startButton.setVisible(false);
    this.stopButton.setVisible(true);
    
    const formData = this.getFormData();
    
    // Emitir evento de submissão do formulário
    this.eventEmitter.emit(BenchmarkEventType.FORM_SUBMITTED, {
      timestamp: Date.now(),
      formData
    } as BenchmarkEventPayload);
  }
  
  /**
   * Manipula o clique no botão de parada
   */
  private handleStop(): void {
    if (!this.startButton || !this.stopButton) return;
    
    this.startButton.setVisible(true);
    this.stopButton.setVisible(false);
    
    // Emitir evento de cancelamento do formulário
    this.eventEmitter.emit(BenchmarkEventType.FORM_CANCELED, {
      timestamp: Date.now()
    } as BenchmarkEventPayload);
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
   * Retorna se o componente está visível
   */
  isComponentVisible(): boolean {
    return this.isVisible;
  }
  
  /**
   * Reinicia o formulário para o estado inicial
   */
  reset(): void {
    if (!this.startButton || !this.stopButton) return;
    
    this.startButton.setVisible(true);
    this.stopButton.setVisible(false);
    
    // Restaurar valores padrão
    if (this.scenarioInput) this.scenarioInput.setText(this.defaultValues.scenarioName);
    if (this.durationInput) this.durationInput.setText(this.defaultValues.duration.toString());
    if (this.targetFpsInput) this.targetFpsInput.setText(this.defaultValues.targetFps.toString());
    if (this.warmupInput) this.warmupInput.setText(this.defaultValues.warmupTime.toString());
  }
} 