import { EventEmitter } from 'eventemitter3';
import {
  InputEventType,
  GameAction,
  KeyEventData,
  MouseEventData,
  TouchEventData,
  InputOptions,
  PointerPosition
} from './input-types';
import { KeyboardController } from './keyboard-controller';
import { MouseController } from './mouse-controller';
import { TouchController } from './touch-controller';
import { ActionMapper } from './action-mapper';

/**
 * Classe responsável por gerenciar todas as entradas do usuário
 * Coordena os controladores especializados e propaga eventos
 */
export class InputManager extends EventEmitter {
  private element: HTMLElement;
  private enabled: boolean = true;
  
  // Controladores especializados
  private keyboardController: KeyboardController;
  private mouseController: MouseController;
  private touchController: TouchController;
  private actionMapper: ActionMapper;
  
  /**
   * Inicializa o gerenciador de entrada
   * @param element Elemento HTML para capturar eventos
   * @param options Opções de configuração
   */
  constructor(element: HTMLElement, options?: InputOptions) {
    super();
    
    this.element = element;
    
    // Inicializa os controladores
    this.keyboardController = new KeyboardController();
    this.mouseController = new MouseController();
    this.touchController = new TouchController();
    this.actionMapper = new ActionMapper();
    
    // Aplica opções de configuração, se fornecidas
    if (options) {
      this.applyOptions(options);
    }
    
    // Inicializa todos os controladores
    this.initializeControllers();
    
    // Configura os listeners para propagar eventos
    this.setupEventForwarding();
  }
  
  /**
   * Aplica opções de configuração
   * @param options Opções de configuração
   */
  private applyOptions(options: InputOptions): void {
    if (options.preventContextMenu !== undefined) {
      this.mouseController.setPreventContextMenu(options.preventContextMenu);
    }
    
    if (options.preventDefaultTouchBehavior !== undefined) {
      this.touchController.setPreventDefaultBehavior(options.preventDefaultTouchBehavior);
    }
    
    if (options.touchToMouseEmulation !== undefined) {
      this.touchController.setTouchToMouseEmulation(options.touchToMouseEmulation);
    }
  }
  
  /**
   * Inicializa todos os controladores
   */
  private initializeControllers(): void {
    this.keyboardController.initialize(this.element);
    this.mouseController.initialize(this.element);
    this.touchController.initialize(this.element);
  }
  
  /**
   * Configura o encaminhamento de eventos dos controladores para o gerenciador
   */
  private setupEventForwarding(): void {
    // Eventos de teclado
    this.keyboardController.on(InputEventType.KEY_DOWN, this.handleKeyDown.bind(this));
    this.keyboardController.on(InputEventType.KEY_UP, this.handleKeyUp.bind(this));
    
    // Eventos de mouse
    this.mouseController.on(InputEventType.MOUSE_DOWN, this.handleMouseDown.bind(this));
    this.mouseController.on(InputEventType.MOUSE_UP, this.handleMouseUp.bind(this));
    this.mouseController.on(InputEventType.MOUSE_MOVE, this.handleMouseMove.bind(this));
    
    // Eventos de toque
    this.touchController.on(InputEventType.TOUCH_START, this.handleTouchStart.bind(this));
    this.touchController.on(InputEventType.TOUCH_END, this.handleTouchEnd.bind(this));
    this.touchController.on(InputEventType.TOUCH_MOVE, this.handleTouchMove.bind(this));
    
    // Eventos de ação
    for (const action of Object.values(GameAction)) {
      this.keyboardController.on(action, (data: KeyEventData) => this.emit(action, data));
      this.mouseController.on(action, (data: MouseEventData) => this.emit(action, data));
      this.touchController.on(action, (data: MouseEventData) => this.emit(action, data));
    }
  }
  
  /**
   * Handler para evento keydown
   */
  private handleKeyDown(data: KeyEventData): void {
    // Propagar o evento
    this.emit(InputEventType.KEY_DOWN, data);
  }
  
  /**
   * Handler para evento keyup
   */
  private handleKeyUp(data: KeyEventData): void {
    // Propagar o evento
    this.emit(InputEventType.KEY_UP, data);
  }
  
  /**
   * Handler para evento mousedown
   */
  private handleMouseDown(data: MouseEventData): void {
    // Propagar o evento
    this.emit(InputEventType.MOUSE_DOWN, data);
  }
  
  /**
   * Handler para evento mouseup
   */
  private handleMouseUp(data: MouseEventData): void {
    // Propagar o evento
    this.emit(InputEventType.MOUSE_UP, data);
  }
  
  /**
   * Handler para evento mousemove
   */
  private handleMouseMove(data: MouseEventData): void {
    // Propagar o evento
    this.emit(InputEventType.MOUSE_MOVE, data);
  }
  
  /**
   * Handler para evento touchstart
   */
  private handleTouchStart(data: TouchEventData): void {
    // Propagar o evento
    this.emit(InputEventType.TOUCH_START, data);
  }
  
  /**
   * Handler para evento touchend
   */
  private handleTouchEnd(data: TouchEventData): void {
    // Propagar o evento
    this.emit(InputEventType.TOUCH_END, data);
  }
  
  /**
   * Handler para evento touchmove
   */
  private handleTouchMove(data: TouchEventData): void {
    // Propagar o evento
    this.emit(InputEventType.TOUCH_MOVE, data);
  }
  
  /**
   * Define um novo mapeamento de teclas
   * @param mapping Novo mapeamento de teclas
   */
  setKeyMapping(mapping: Record<string, GameAction>): void {
    this.keyboardController.setKeyMapping(mapping);
  }
  
  /**
   * Atualiza o mapeamento para uma tecla específica
   * @param key Tecla a ser mapeada
   * @param action Ação associada à tecla
   */
  mapKey(key: string, action: GameAction): void {
    this.keyboardController.mapKey(key, action);
  }
  
  /**
   * Remove o mapeamento de uma tecla
   * @param key Tecla a ser desmapeada
   */
  unmapKey(key: string): void {
    this.keyboardController.unmapKey(key);
  }
  
  /**
   * Verifica se uma tecla está pressionada
   * @param key Tecla a verificar
   * @returns Verdadeiro se a tecla estiver pressionada
   */
  isKeyPressed(key: string): boolean {
    return this.keyboardController.isKeyPressed(key);
  }
  
  /**
   * Verifica se um botão do mouse está pressionado
   * @param button Botão a verificar (0: esquerdo, 1: meio, 2: direito)
   * @returns Verdadeiro se o botão estiver pressionado
   */
  isMouseButtonPressed(button: number): boolean {
    return this.mouseController.isMouseButtonPressed(button);
  }
  
  /**
   * Obtém a posição atual do mouse
   * @returns Posição do mouse
   */
  getMousePosition(): PointerPosition {
    return this.mouseController.getMousePosition();
  }
  
  /**
   * Obtém as posições atuais de toque
   * @returns Array de posições de toque
   */
  getTouchPositions(): PointerPosition[] {
    return this.touchController.getTouchPositions();
  }
  
  /**
   * Habilita ou desabilita a entrada
   * @param enabled Estado de habilitação
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    
    // Propaga para todos os controladores
    this.keyboardController.setEnabled(enabled);
    this.mouseController.setEnabled(enabled);
    this.touchController.setEnabled(enabled);
  }
  
  /**
   * Verifica se a entrada está habilitada
   * @returns Estado de habilitação
   */
  isEnabled(): boolean {
    return this.enabled;
  }
  
  /**
   * Limpa os recursos e remove os listeners de eventos
   */
  dispose(): void {
    // Desconecta todos os listeners
    this.removeAllListeners();
    
    // Elimina os controladores
    this.keyboardController.dispose();
    this.mouseController.dispose();
    this.touchController.dispose();
  }
} 