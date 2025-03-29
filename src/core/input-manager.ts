import { EventEmitter } from 'eventemitter3';

/**
 * Tipos de eventos de input
 */
export enum InputEventType {
  KEY_DOWN = 'keyDown',
  KEY_UP = 'keyUp',
  MOUSE_DOWN = 'mouseDown',
  MOUSE_UP = 'mouseUp',
  MOUSE_MOVE = 'mouseMove',
  TOUCH_START = 'touchStart',
  TOUCH_END = 'touchEnd',
  TOUCH_MOVE = 'touchMove'
}

/**
 * Tipos de ações que podem ser mapeadas para inputs
 */
export enum GameAction {
  MOVE_LEFT = 'moveLeft',
  MOVE_RIGHT = 'moveRight',
  INCREASE_ANGLE = 'increaseAngle',
  DECREASE_ANGLE = 'decreaseAngle',
  INCREASE_POWER = 'increasePower',
  DECREASE_POWER = 'decreasePower',
  FIRE = 'fire',
  END_TURN = 'endTurn',
  PAUSE = 'pause',
  CONFIRM = 'confirm',
  CANCEL = 'cancel'
}

/**
 * Dados para eventos de teclado
 */
export interface KeyEventData {
  key: string;
  code: string;
  altKey: boolean;
  ctrlKey: boolean;
  shiftKey: boolean;
  repeat: boolean;
  action?: GameAction;
}

/**
 * Dados para eventos de mouse
 */
export interface MouseEventData {
  x: number;
  y: number;
  button: number;
  altKey: boolean;
  ctrlKey: boolean;
  shiftKey: boolean;
  action?: GameAction;
}

/**
 * Dados para eventos de toque
 */
export interface TouchEventData {
  touches: { x: number, y: number }[];
  changedTouches: { x: number, y: number }[];
  altKey: boolean;
  ctrlKey: boolean;
  shiftKey: boolean;
  action?: GameAction;
}

/**
 * Mapeamento de teclas para ações do jogo
 */
export interface KeyMapping {
  [key: string]: GameAction;
}

/**
 * Classe responsável por gerenciar entradas do usuário
 */
export class InputManager extends EventEmitter {
  private element: HTMLElement;
  private enabled: boolean = true;
  
  // Mapeamentos de entrada
  private keyMapping: KeyMapping = {
    'ArrowLeft': GameAction.MOVE_LEFT,
    'ArrowRight': GameAction.MOVE_RIGHT,
    'ArrowUp': GameAction.INCREASE_ANGLE,
    'ArrowDown': GameAction.DECREASE_ANGLE,
    'w': GameAction.INCREASE_POWER,
    's': GameAction.DECREASE_POWER,
    ' ': GameAction.FIRE,
    'Enter': GameAction.END_TURN,
    'p': GameAction.PAUSE,
    'Escape': GameAction.CANCEL
  };
  
  // Estado das teclas e mouse
  private keysPressed: Set<string> = new Set();
  private buttonsPressed: Set<number> = new Set();
  private mousePosition: { x: number, y: number } = { x: 0, y: 0 };
  private touchPositions: { x: number, y: number }[] = [];
  
  /**
   * Inicializa o gerenciador de entrada
   * @param element Elemento HTML para capturar eventos
   */
  constructor(element: HTMLElement) {
    super();
    this.element = element;
    this.setupEventListeners();
  }
  
  /**
   * Configura os listeners de eventos
   */
  private setupEventListeners(): void {
    // Eventos de teclado
    window.addEventListener('keydown', this.handleKeyDown.bind(this));
    window.addEventListener('keyup', this.handleKeyUp.bind(this));
    
    // Eventos de mouse
    this.element.addEventListener('mousedown', this.handleMouseDown.bind(this));
    this.element.addEventListener('mouseup', this.handleMouseUp.bind(this));
    this.element.addEventListener('mousemove', this.handleMouseMove.bind(this));
    
    // Eventos de touch
    this.element.addEventListener('touchstart', this.handleTouchStart.bind(this));
    this.element.addEventListener('touchend', this.handleTouchEnd.bind(this));
    this.element.addEventListener('touchmove', this.handleTouchMove.bind(this));
    
    // Previne comportamentos padrão indesejados em dispositivos móveis
    this.element.addEventListener('contextmenu', (e) => {
      e.preventDefault();
    });
  }
  
  /**
   * Handler para evento keydown
   */
  private handleKeyDown(event: KeyboardEvent): void {
    if (!this.enabled) {
      // Se a entrada estiver desabilitada, permitir apenas a tecla de pausa
      if (event.key !== 'p') {
        return;
      }
    }
    
    // Evita repetições de tecla não desejadas
    if (this.keysPressed.has(event.key) && event.repeat) {
      return;
    }
    
    // Adiciona à lista de teclas pressionadas
    this.keysPressed.add(event.key);
    
    // Cria dados do evento
    const eventData: KeyEventData = {
      key: event.key,
      code: event.code,
      altKey: event.altKey,
      ctrlKey: event.ctrlKey,
      shiftKey: event.shiftKey,
      repeat: event.repeat
    };
    
    // Adiciona a ação mapeada se existir
    if (this.keyMapping[event.key]) {
      eventData.action = this.keyMapping[event.key];
    }
    
    // Emite o evento
    this.emit(InputEventType.KEY_DOWN, eventData);
    
    // Se houver uma ação mapeada para essa tecla, emite também a ação
    if (eventData.action) {
      this.emit(eventData.action, eventData);
    }
  }
  
  /**
   * Handler para evento keyup
   */
  private handleKeyUp(event: KeyboardEvent): void {
    // Remove da lista de teclas pressionadas
    this.keysPressed.delete(event.key);
    
    // Se a entrada estiver desabilitada, ignorar
    if (!this.enabled) {
      return;
    }
    
    // Cria dados do evento
    const eventData: KeyEventData = {
      key: event.key,
      code: event.code,
      altKey: event.altKey,
      ctrlKey: event.ctrlKey,
      shiftKey: event.shiftKey,
      repeat: false
    };
    
    // Adiciona a ação mapeada se existir
    if (this.keyMapping[event.key]) {
      eventData.action = this.keyMapping[event.key];
    }
    
    // Emite o evento
    this.emit(InputEventType.KEY_UP, eventData);
  }
  
  /**
   * Handler para evento mousedown
   */
  private handleMouseDown(event: MouseEvent): void {
    // Se a entrada estiver desabilitada, ignorar
    if (!this.enabled) {
      return;
    }
    
    // Adiciona o botão à lista de botões pressionados
    this.buttonsPressed.add(event.button);
    
    // Atualiza a posição do mouse
    this.updateMousePosition(event);
    
    // Cria dados do evento
    const eventData: MouseEventData = {
      x: this.mousePosition.x,
      y: this.mousePosition.y,
      button: event.button,
      altKey: event.altKey,
      ctrlKey: event.ctrlKey,
      shiftKey: event.shiftKey
    };
    
    // Botão esquerdo do mouse pode ser mapeado para ação de fogo
    if (event.button === 0) {
      eventData.action = GameAction.FIRE;
    }
    
    // Emite o evento
    this.emit(InputEventType.MOUSE_DOWN, eventData);
    
    // Se houver uma ação mapeada, emite também a ação
    if (eventData.action) {
      this.emit(eventData.action, eventData);
    }
  }
  
  /**
   * Handler para evento mouseup
   */
  private handleMouseUp(event: MouseEvent): void {
    // Remove o botão da lista de botões pressionados
    this.buttonsPressed.delete(event.button);
    
    // Se a entrada estiver desabilitada, ignorar
    if (!this.enabled) {
      return;
    }
    
    // Atualiza a posição do mouse
    this.updateMousePosition(event);
    
    // Cria dados do evento
    const eventData: MouseEventData = {
      x: this.mousePosition.x,
      y: this.mousePosition.y,
      button: event.button,
      altKey: event.altKey,
      ctrlKey: event.ctrlKey,
      shiftKey: event.shiftKey
    };
    
    // Emite o evento
    this.emit(InputEventType.MOUSE_UP, eventData);
  }
  
  /**
   * Handler para evento mousemove
   */
  private handleMouseMove(event: MouseEvent): void {
    // Se a entrada estiver desabilitada, ignorar
    if (!this.enabled) {
      return;
    }
    
    // Atualiza a posição do mouse
    this.updateMousePosition(event);
    
    // Cria dados do evento
    const eventData: MouseEventData = {
      x: this.mousePosition.x,
      y: this.mousePosition.y,
      button: -1, // Nenhum botão
      altKey: event.altKey,
      ctrlKey: event.ctrlKey,
      shiftKey: event.shiftKey
    };
    
    // Emite o evento
    this.emit(InputEventType.MOUSE_MOVE, eventData);
  }
  
  /**
   * Handler para evento touchstart
   */
  private handleTouchStart(event: TouchEvent): void {
    // Se a entrada estiver desabilitada, ignorar
    if (!this.enabled) {
      return;
    }
    
    // Impede o comportamento padrão para evitar eventos de mouse duplicados
    event.preventDefault();
    
    // Atualiza as posições de toque
    this.updateTouchPositions(event);
    
    // Cria dados do evento
    const eventData: TouchEventData = {
      touches: this.getFormattedTouches(event.touches),
      changedTouches: this.getFormattedTouches(event.changedTouches),
      altKey: event.altKey,
      ctrlKey: event.ctrlKey,
      shiftKey: event.shiftKey
    };
    
    // Emite o evento
    this.emit(InputEventType.TOUCH_START, eventData);
    
    // Também emite um evento de mousedown para compatibilidade
    this.emit(InputEventType.MOUSE_DOWN, {
      x: eventData.changedTouches[0]?.x || 0,
      y: eventData.changedTouches[0]?.y || 0,
      button: 0, // Simula botão esquerdo
      altKey: event.altKey,
      ctrlKey: event.ctrlKey,
      shiftKey: event.shiftKey,
      action: GameAction.FIRE
    });
  }
  
  /**
   * Handler para evento touchend
   */
  private handleTouchEnd(event: TouchEvent): void {
    // Se a entrada estiver desabilitada, ignorar
    if (!this.enabled) {
      return;
    }
    
    // Impede o comportamento padrão para evitar eventos de mouse duplicados
    event.preventDefault();
    
    // Cria dados do evento
    const eventData: TouchEventData = {
      touches: this.getFormattedTouches(event.touches),
      changedTouches: this.getFormattedTouches(event.changedTouches),
      altKey: event.altKey,
      ctrlKey: event.ctrlKey,
      shiftKey: event.shiftKey
    };
    
    // Atualiza as posições de toque
    this.updateTouchPositions(event);
    
    // Emite o evento
    this.emit(InputEventType.TOUCH_END, eventData);
    
    // Também emite um evento de mouseup para compatibilidade
    this.emit(InputEventType.MOUSE_UP, {
      x: eventData.changedTouches[0]?.x || 0,
      y: eventData.changedTouches[0]?.y || 0,
      button: 0, // Simula botão esquerdo
      altKey: event.altKey,
      ctrlKey: event.ctrlKey,
      shiftKey: event.shiftKey
    });
  }
  
  /**
   * Handler para evento touchmove
   */
  private handleTouchMove(event: TouchEvent): void {
    // Se a entrada estiver desabilitada, ignorar
    if (!this.enabled) {
      return;
    }
    
    // Impede o comportamento padrão para evitar eventos de mouse duplicados
    event.preventDefault();
    
    // Atualiza as posições de toque
    this.updateTouchPositions(event);
    
    // Cria dados do evento
    const eventData: TouchEventData = {
      touches: this.getFormattedTouches(event.touches),
      changedTouches: this.getFormattedTouches(event.changedTouches),
      altKey: event.altKey,
      ctrlKey: event.ctrlKey,
      shiftKey: event.shiftKey
    };
    
    // Emite o evento
    this.emit(InputEventType.TOUCH_MOVE, eventData);
    
    // Também emite um evento de mousemove para compatibilidade
    this.emit(InputEventType.MOUSE_MOVE, {
      x: eventData.changedTouches[0]?.x || 0,
      y: eventData.changedTouches[0]?.y || 0,
      button: -1,
      altKey: event.altKey,
      ctrlKey: event.ctrlKey,
      shiftKey: event.shiftKey
    });
  }
  
  /**
   * Atualiza a posição do mouse com coordenadas relativas ao elemento
   */
  private updateMousePosition(event: MouseEvent): void {
    const rect = this.element.getBoundingClientRect();
    
    this.mousePosition = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
  }
  
  /**
   * Atualiza as posições de toque
   */
  private updateTouchPositions(event: TouchEvent): void {
    const rect = this.element.getBoundingClientRect();
    
    this.touchPositions = [];
    
    for (let i = 0; i < event.touches.length; i++) {
      const touch = event.touches[i];
      this.touchPositions.push({
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
      });
    }
  }
  
  /**
   * Converte uma lista de toques para um formato mais simples
   */
  private getFormattedTouches(touchList: TouchList): { x: number, y: number }[] {
    const rect = this.element.getBoundingClientRect();
    const touches: { x: number, y: number }[] = [];
    
    for (let i = 0; i < touchList.length; i++) {
      const touch = touchList[i];
      touches.push({
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
      });
    }
    
    return touches;
  }
  
  /**
   * Define um novo mapeamento de teclas
   * @param mapping Novo mapeamento de teclas
   */
  setKeyMapping(mapping: KeyMapping): void {
    this.keyMapping = { ...mapping };
  }
  
  /**
   * Atualiza o mapeamento para uma tecla específica
   * @param key Tecla a ser mapeada
   * @param action Ação associada à tecla
   */
  mapKey(key: string, action: GameAction): void {
    this.keyMapping[key] = action;
  }
  
  /**
   * Remove o mapeamento de uma tecla
   * @param key Tecla a ser desmapeada
   */
  unmapKey(key: string): void {
    delete this.keyMapping[key];
  }
  
  /**
   * Verifica se uma tecla está pressionada
   * @param key Tecla a verificar
   * @returns Verdadeiro se a tecla estiver pressionada
   */
  isKeyPressed(key: string): boolean {
    return this.keysPressed.has(key);
  }
  
  /**
   * Verifica se um botão do mouse está pressionado
   * @param button Botão a verificar (0: esquerdo, 1: meio, 2: direito)
   * @returns Verdadeiro se o botão estiver pressionado
   */
  isMouseButtonPressed(button: number): boolean {
    return this.buttonsPressed.has(button);
  }
  
  /**
   * Obtém a posição atual do mouse
   * @returns Posição do mouse
   */
  getMousePosition(): { x: number, y: number } {
    return { ...this.mousePosition };
  }
  
  /**
   * Obtém as posições atuais de toque
   * @returns Array de posições de toque
   */
  getTouchPositions(): { x: number, y: number }[] {
    return [...this.touchPositions];
  }
  
  /**
   * Habilita ou desabilita a entrada
   * @param enabled Estado de habilitação
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    
    // Se estiver desabilitando, limpa os estados de entrada
    if (!enabled) {
      this.keysPressed.clear();
      this.buttonsPressed.clear();
    }
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
    // Remove os listeners de eventos
    window.removeEventListener('keydown', this.handleKeyDown.bind(this));
    window.removeEventListener('keyup', this.handleKeyUp.bind(this));
    
    this.element.removeEventListener('mousedown', this.handleMouseDown.bind(this));
    this.element.removeEventListener('mouseup', this.handleMouseUp.bind(this));
    this.element.removeEventListener('mousemove', this.handleMouseMove.bind(this));
    
    this.element.removeEventListener('touchstart', this.handleTouchStart.bind(this));
    this.element.removeEventListener('touchend', this.handleTouchEnd.bind(this));
    this.element.removeEventListener('touchmove', this.handleTouchMove.bind(this));
    
    this.element.removeEventListener('contextmenu', this.handleMouseDown.bind(this));
    
    // Limpa os estados
    this.keysPressed.clear();
    this.buttonsPressed.clear();
    this.touchPositions = [];
    
    // Remove todos os listeners de eventos
    this.removeAllListeners();
  }
} 