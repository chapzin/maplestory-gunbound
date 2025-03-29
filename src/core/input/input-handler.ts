import { EventEmitter, EventCallback } from '../../utils/event-emitter';
import { InputEventType, KeyEventData, MouseEventData } from '../../systems/input-controller';

/**
 * Interface para o manipulador de entrada
 */
export interface IInputHandler {
  /**
   * Inicializa o manipulador de entrada
   * @param canvas Elemento canvas para captura de eventos
   */
  initialize(canvas: HTMLElement): void;
  
  /**
   * Define se o manipulador está ativo
   * @param enabled Estado de ativação
   */
  setEnabled(enabled: boolean): void;
  
  /**
   * Registra um callback para um tipo de evento de entrada
   * @param eventType Tipo do evento
   * @param callback Função de callback
   */
  on(eventType: string, callback: EventCallback): void;
  
  /**
   * Remove um callback registrado para um tipo de evento de entrada
   * @param eventType Tipo do evento
   * @param callback Função de callback a ser removida
   */
  off(eventType: string, callback: EventCallback): void;
  
  /**
   * Atualiza o estado de entrada
   * @param delta Delta time
   */
  update(delta: number): void;
  
  /**
   * Libera recursos do manipulador de entrada
   */
  dispose(): void;
}

/**
 * Implementação do manipulador de entrada
 */
export class InputHandler implements IInputHandler {
  private canvas: HTMLElement;
  private enabled: boolean = true;
  private eventEmitter: EventEmitter = new EventEmitter();
  private initialized: boolean = false;
  
  // Referências para os handlers para poderem ser removidos posteriormente
  private handleKeyDownRef: (e: KeyboardEvent) => void;
  private handleMouseDownRef: (e: MouseEvent) => void;
  private handleMouseMoveRef: (e: MouseEvent) => void;
  private handleMouseUpRef: (e: MouseEvent) => void;
  private handleTouchStartRef: (e: TouchEvent) => void;
  private handleTouchMoveRef: (e: TouchEvent) => void;
  private handleTouchEndRef: (e: TouchEvent) => void;
  
  /**
   * Inicializa o manipulador de entrada
   * @param canvas Elemento canvas para captura de eventos
   */
  initialize(canvas: HTMLElement): void {
    if (this.initialized) return;
    
    this.canvas = canvas;
    
    // Criar handlers com binding para poder removê-los depois
    this.handleKeyDownRef = this.handleKeyDown.bind(this);
    this.handleMouseDownRef = this.handleMouseDown.bind(this);
    this.handleMouseMoveRef = this.handleMouseMove.bind(this);
    this.handleMouseUpRef = this.handleMouseUp.bind(this);
    this.handleTouchStartRef = this.handleTouchStart.bind(this);
    this.handleTouchMoveRef = this.handleTouchMove.bind(this);
    this.handleTouchEndRef = this.handleTouchEnd.bind(this);
    
    // Adicionar event listeners
    window.addEventListener('keydown', this.handleKeyDownRef);
    this.canvas.addEventListener('mousedown', this.handleMouseDownRef);
    this.canvas.addEventListener('mousemove', this.handleMouseMoveRef);
    this.canvas.addEventListener('mouseup', this.handleMouseUpRef);
    
    // Adicionar event listeners de toque para dispositivos móveis
    this.canvas.addEventListener('touchstart', this.handleTouchStartRef);
    this.canvas.addEventListener('touchmove', this.handleTouchMoveRef);
    this.canvas.addEventListener('touchend', this.handleTouchEndRef);
    
    this.initialized = true;
  }
  
  /**
   * Define se o manipulador está ativo
   * @param enabled Estado de ativação
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }
  
  /**
   * Registra um callback para um tipo de evento de entrada
   * @param eventType Tipo do evento
   * @param callback Função de callback
   */
  on(eventType: string, callback: EventCallback): void {
    this.eventEmitter.on(eventType, callback);
  }
  
  /**
   * Remove um callback registrado para um tipo de evento de entrada
   * @param eventType Tipo do evento
   * @param callback Função de callback a ser removida
   */
  off(eventType: string, callback: EventCallback): void {
    this.eventEmitter.off(eventType, callback);
  }
  
  /**
   * Atualiza o estado de entrada
   * @param delta Delta time
   */
  update(delta: number): void {
    // Atualizar estado de entrada se necessário
  }
  
  /**
   * Manipulador de evento de tecla pressionada
   * @param e Evento de tecla
   */
  private handleKeyDown(e: KeyboardEvent): void {
    if (!this.enabled) return;
    
    const data: KeyEventData = {
      key: e.key,
      originalEvent: e
    };
    
    this.eventEmitter.emit(InputEventType.KEY_DOWN, data);
  }
  
  /**
   * Manipulador de evento de mouse pressionado
   * @param e Evento de mouse
   */
  private handleMouseDown(e: MouseEvent): void {
    if (!this.enabled) return;
    
    const rect = this.canvas.getBoundingClientRect();
    const data: MouseEventData = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      button: e.button,
      originalEvent: e
    };
    
    this.eventEmitter.emit(InputEventType.MOUSE_DOWN, data);
  }
  
  /**
   * Manipulador de evento de mouse movido
   * @param e Evento de mouse
   */
  private handleMouseMove(e: MouseEvent): void {
    if (!this.enabled) return;
    
    const rect = this.canvas.getBoundingClientRect();
    const data: MouseEventData = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      button: e.button,
      originalEvent: e
    };
    
    this.eventEmitter.emit(InputEventType.MOUSE_MOVE, data);
  }
  
  /**
   * Manipulador de evento de mouse liberado
   * @param e Evento de mouse
   */
  private handleMouseUp(e: MouseEvent): void {
    if (!this.enabled) return;
    
    const rect = this.canvas.getBoundingClientRect();
    const data: MouseEventData = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      button: e.button,
      originalEvent: e
    };
    
    this.eventEmitter.emit(InputEventType.MOUSE_UP, data);
  }
  
  /**
   * Manipulador de evento de toque iniciado
   * @param e Evento de toque
   */
  private handleTouchStart(e: TouchEvent): void {
    if (!this.enabled) return;
    
    e.preventDefault();
    
    const rect = this.canvas.getBoundingClientRect();
    const touch = e.touches[0];
    
    // Criar um MouseEvent sintético para manter a compatibilidade
    const mouseEvent = this.createMouseEventFromTouch(e, touch, 'mousedown');
    
    const data: MouseEventData = {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top,
      button: 0, // Simula botão esquerdo do mouse
      originalEvent: mouseEvent
    };
    
    this.eventEmitter.emit(InputEventType.MOUSE_DOWN, data);
  }
  
  /**
   * Manipulador de evento de toque movido
   * @param e Evento de toque
   */
  private handleTouchMove(e: TouchEvent): void {
    if (!this.enabled) return;
    
    e.preventDefault();
    
    const rect = this.canvas.getBoundingClientRect();
    const touch = e.touches[0];
    
    // Criar um MouseEvent sintético para manter a compatibilidade
    const mouseEvent = this.createMouseEventFromTouch(e, touch, 'mousemove');
    
    const data: MouseEventData = {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top,
      button: 0,
      originalEvent: mouseEvent
    };
    
    this.eventEmitter.emit(InputEventType.MOUSE_MOVE, data);
  }
  
  /**
   * Manipulador de evento de toque finalizado
   * @param e Evento de toque
   */
  private handleTouchEnd(e: TouchEvent): void {
    if (!this.enabled) return;
    
    e.preventDefault();
    
    const rect = this.canvas.getBoundingClientRect();
    let x = 0;
    let y = 0;
    let touch: Touch | null = null;
    
    // Se houver um toque anterior, use sua posição
    if (e.changedTouches.length > 0) {
      touch = e.changedTouches[0];
      x = touch.clientX - rect.left;
      y = touch.clientY - rect.top;
    }
    
    // Criar um MouseEvent sintético para manter a compatibilidade
    const mouseEvent = this.createMouseEventFromTouch(e, touch, 'mouseup');
    
    const data: MouseEventData = {
      x,
      y,
      button: 0,
      originalEvent: mouseEvent
    };
    
    this.eventEmitter.emit(InputEventType.MOUSE_UP, data);
  }
  
  /**
   * Cria um MouseEvent a partir de um TouchEvent para compatibilidade
   * @param touchEvent Evento de toque original
   * @param touch O objeto Touch específico
   * @param type Tipo de evento de mouse a criar
   * @returns MouseEvent sintético
   */
  private createMouseEventFromTouch(touchEvent: TouchEvent, touch: Touch | null, type: string): MouseEvent {
    // Valores padrão caso touch seja null
    const clientX = touch ? touch.clientX : 0;
    const clientY = touch ? touch.clientY : 0;
    
    // Criar um evento MouseEvent sintético para compatibilidade
    return new MouseEvent(type, {
      bubbles: true,
      cancelable: true,
      view: window,
      detail: 1,
      screenX: 0,
      screenY: 0,
      clientX,
      clientY,
      ctrlKey: false,
      altKey: false,
      shiftKey: false,
      metaKey: false,
      button: 0,
      relatedTarget: null
    });
  }
  
  /**
   * Libera recursos do manipulador de entrada
   */
  dispose(): void {
    if (!this.initialized) return;
    
    // Remover event listeners
    window.removeEventListener('keydown', this.handleKeyDownRef);
    this.canvas.removeEventListener('mousedown', this.handleMouseDownRef);
    this.canvas.removeEventListener('mousemove', this.handleMouseMoveRef);
    this.canvas.removeEventListener('mouseup', this.handleMouseUpRef);
    
    this.canvas.removeEventListener('touchstart', this.handleTouchStartRef);
    this.canvas.removeEventListener('touchmove', this.handleTouchMoveRef);
    this.canvas.removeEventListener('touchend', this.handleTouchEndRef);
    
    // Limpar event emitter
    this.eventEmitter.removeAllListeners();
    
    this.initialized = false;
  }
} 