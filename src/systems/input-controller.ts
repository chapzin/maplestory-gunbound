import { EventEmitter } from 'eventemitter3';

export enum InputEventType {
  KEY_DOWN = 'keyDown',
  KEY_UP = 'keyUp',
  MOUSE_DOWN = 'mouseDown',
  MOUSE_MOVE = 'mouseMove',
  MOUSE_UP = 'mouseUp'
}

export interface MouseEventData {
  x: number;
  y: number;
  button: number;
  originalEvent: MouseEvent;
}

export interface KeyEventData {
  key: string;
  originalEvent: KeyboardEvent;
}

/**
 * Classe responsável por gerenciar os eventos de entrada do usuário
 */
export class InputController extends EventEmitter {
  private isEnabled: boolean = true;
  private canvas: HTMLElement;
  private keyStates: Map<string, boolean> = new Map();
  
  /**
   * Cria uma nova instância do controlador de input
   * @param canvas Elemento canvas que receberá os eventos
   */
  constructor(canvas: HTMLElement) {
    super();
    this.canvas = canvas;
    this.setupEvents();
  }
  
  /**
   * Configura os listeners de eventos
   */
  private setupEvents(): void {
    // Eventos de teclado
    window.addEventListener('keydown', this.onKeyDown.bind(this));
    window.addEventListener('keyup', this.onKeyUp.bind(this));
    
    // Eventos de mouse
    this.canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
    this.canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
    this.canvas.addEventListener('mouseup', this.onMouseUp.bind(this));
    
    // Previne comportamentos padrão indesejados no canvas
    this.canvas.addEventListener('contextmenu', (e) => {
      e.preventDefault();
    });
  }
  
  /**
   * Handler para evento keydown
   * @param event Evento de teclado
   */
  private onKeyDown(event: KeyboardEvent): void {
    if (!this.isEnabled) return;
    
    this.keyStates.set(event.key, true);
    
    const data: KeyEventData = {
      key: event.key,
      originalEvent: event
    };
    
    this.emit(InputEventType.KEY_DOWN, data);
  }
  
  /**
   * Handler para evento keyup
   * @param event Evento de teclado
   */
  private onKeyUp(event: KeyboardEvent): void {
    if (!this.isEnabled) return;
    
    this.keyStates.set(event.key, false);
    
    const data: KeyEventData = {
      key: event.key,
      originalEvent: event
    };
    
    this.emit(InputEventType.KEY_UP, data);
  }
  
  /**
   * Handler para evento mousedown
   * @param event Evento de mouse
   */
  private onMouseDown(event: MouseEvent): void {
    if (!this.isEnabled) return;
    
    const data: MouseEventData = {
      x: event.clientX,
      y: event.clientY,
      button: event.button,
      originalEvent: event
    };
    
    this.emit(InputEventType.MOUSE_DOWN, data);
  }
  
  /**
   * Handler para evento mousemove
   * @param event Evento de mouse
   */
  private onMouseMove(event: MouseEvent): void {
    if (!this.isEnabled) return;
    
    const data: MouseEventData = {
      x: event.clientX,
      y: event.clientY,
      button: event.button,
      originalEvent: event
    };
    
    this.emit(InputEventType.MOUSE_MOVE, data);
  }
  
  /**
   * Handler para evento mouseup
   * @param event Evento de mouse
   */
  private onMouseUp(event: MouseEvent): void {
    if (!this.isEnabled) return;
    
    const data: MouseEventData = {
      x: event.clientX,
      y: event.clientY,
      button: event.button,
      originalEvent: event
    };
    
    this.emit(InputEventType.MOUSE_UP, data);
  }
  
  /**
   * Verifica se uma tecla está pressionada
   * @param key Tecla a verificar
   * @returns Verdadeiro se a tecla estiver pressionada
   */
  isKeyDown(key: string): boolean {
    return this.keyStates.get(key) === true;
  }
  
  /**
   * Habilita ou desabilita o controlador de input
   * @param enabled Estado de habilitação
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    
    // Se estiver desabilitando, limpa todos os estados de teclas
    if (!enabled) {
      this.keyStates.clear();
    }
  }
  
  /**
   * Verifica se o controlador está habilitado
   * @returns Estado de habilitação
   */
  getEnabled(): boolean {
    return this.isEnabled;
  }
  
  /**
   * Remove todos os event listeners
   */
  dispose(): void {
    window.removeEventListener('keydown', this.onKeyDown.bind(this));
    window.removeEventListener('keyup', this.onKeyUp.bind(this));
    
    this.canvas.removeEventListener('mousedown', this.onMouseDown.bind(this));
    this.canvas.removeEventListener('mousemove', this.onMouseMove.bind(this));
    this.canvas.removeEventListener('mouseup', this.onMouseUp.bind(this));
    this.canvas.removeEventListener('contextmenu', (e) => {
      e.preventDefault();
    });
    
    this.removeAllListeners();
  }
} 