import { EventEmitter } from 'eventemitter3';
import {
  IInputController,
  InputEventType,
  TouchEventData,
  MouseEventData,
  GameAction,
  PointerPosition
} from './input-types';

/**
 * Classe responsável por gerenciar eventos de toque
 */
export class TouchController extends EventEmitter implements IInputController {
  private element: HTMLElement | null = null;
  private enabled: boolean = true;
  private touchPositions: PointerPosition[] = [];
  private preventDefaultBehavior: boolean = true;
  private touchToMouseEmulation: boolean = true;
  
  /**
   * Inicializa o controlador de toque
   * @param element Elemento HTML para capturar eventos
   */
  initialize(element: HTMLElement): void {
    this.element = element;
    this.setupEventListeners();
  }
  
  /**
   * Configura os listeners de eventos de toque
   */
  private setupEventListeners(): void {
    if (!this.element) return;
    
    this.element.addEventListener('touchstart', this.handleTouchStart.bind(this));
    this.element.addEventListener('touchend', this.handleTouchEnd.bind(this));
    this.element.addEventListener('touchmove', this.handleTouchMove.bind(this));
  }
  
  /**
   * Handler para evento touchstart
   */
  private handleTouchStart(event: TouchEvent): void {
    // Se a entrada estiver desabilitada, ignorar
    if (!this.enabled) {
      return;
    }
    
    // Impede o comportamento padrão se configurado
    if (this.preventDefaultBehavior) {
      event.preventDefault();
    }
    
    // Atualiza as posições de toque
    this.updateTouchPositions(event);
    
    // Cria dados do evento
    const eventData: TouchEventData = {
      touches: this.getFormattedTouches(event.touches),
      changedTouches: this.getFormattedTouches(event.changedTouches),
      altKey: event.altKey,
      ctrlKey: event.ctrlKey,
      shiftKey: event.shiftKey,
      originalEvent: event
    };
    
    // Emite o evento de toque
    this.emit(InputEventType.TOUCH_START, eventData);
    
    // Emulação de mouse, se habilitada
    if (this.touchToMouseEmulation) {
      this.emulateMouseEvent(InputEventType.MOUSE_DOWN, eventData, 0);
    }
  }
  
  /**
   * Handler para evento touchend
   */
  private handleTouchEnd(event: TouchEvent): void {
    // Se a entrada estiver desabilitada, ignorar
    if (!this.enabled) {
      return;
    }
    
    // Impede o comportamento padrão se configurado
    if (this.preventDefaultBehavior) {
      event.preventDefault();
    }
    
    // Cria dados do evento
    const eventData: TouchEventData = {
      touches: this.getFormattedTouches(event.touches),
      changedTouches: this.getFormattedTouches(event.changedTouches),
      altKey: event.altKey,
      ctrlKey: event.ctrlKey,
      shiftKey: event.shiftKey,
      originalEvent: event
    };
    
    // Atualiza as posições de toque
    this.updateTouchPositions(event);
    
    // Emite o evento de toque
    this.emit(InputEventType.TOUCH_END, eventData);
    
    // Emulação de mouse, se habilitada
    if (this.touchToMouseEmulation) {
      this.emulateMouseEvent(InputEventType.MOUSE_UP, eventData, 0);
    }
  }
  
  /**
   * Handler para evento touchmove
   */
  private handleTouchMove(event: TouchEvent): void {
    // Se a entrada estiver desabilitada, ignorar
    if (!this.enabled) {
      return;
    }
    
    // Impede o comportamento padrão se configurado
    if (this.preventDefaultBehavior) {
      event.preventDefault();
    }
    
    // Atualiza as posições de toque
    this.updateTouchPositions(event);
    
    // Cria dados do evento
    const eventData: TouchEventData = {
      touches: this.getFormattedTouches(event.touches),
      changedTouches: this.getFormattedTouches(event.changedTouches),
      altKey: event.altKey,
      ctrlKey: event.ctrlKey,
      shiftKey: event.shiftKey,
      originalEvent: event
    };
    
    // Emite o evento de toque
    this.emit(InputEventType.TOUCH_MOVE, eventData);
    
    // Emulação de mouse, se habilitada
    if (this.touchToMouseEmulation) {
      this.emulateMouseEvent(InputEventType.MOUSE_MOVE, eventData, -1);
    }
  }
  
  /**
   * Atualiza as posições de toque
   */
  private updateTouchPositions(event: TouchEvent): void {
    if (!this.element) return;
    
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
   * Converte uma lista de toques para o formato de posição
   */
  private getFormattedTouches(touchList: TouchList): PointerPosition[] {
    if (!this.element) return [];
    
    const rect = this.element.getBoundingClientRect();
    const touches: PointerPosition[] = [];
    
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
   * Emula um evento de mouse a partir de um evento de toque
   */
  private emulateMouseEvent(
    eventType: InputEventType, 
    touchEvent: TouchEventData, 
    button: number
  ): void {
    // Pega o primeiro toque como posição do mouse
    const x = touchEvent.changedTouches[0]?.x || 0;
    const y = touchEvent.changedTouches[0]?.y || 0;
    
    // Cria dados para o evento de mouse emulado
    const mouseEventData: MouseEventData = {
      x,
      y,
      button,
      altKey: touchEvent.altKey,
      ctrlKey: touchEvent.ctrlKey,
      shiftKey: touchEvent.shiftKey
    };
    
    // Adiciona ação para evento de clique
    if (eventType === InputEventType.MOUSE_DOWN && button === 0) {
      mouseEventData.action = GameAction.FIRE;
    }
    
    // Emite o evento de mouse emulado
    this.emit(eventType, mouseEventData);
    
    // Se for um clique com ação, emite também o evento da ação
    if (mouseEventData.action) {
      this.emit(mouseEventData.action, mouseEventData);
    }
  }
  
  /**
   * Obtém as posições atuais de toque
   * @returns Array de posições de toque
   */
  getTouchPositions(): PointerPosition[] {
    return [...this.touchPositions];
  }
  
  /**
   * Configura se os comportamentos padrão de toque devem ser prevenidos
   * @param prevent Verdadeiro para prevenir comportamentos padrão
   */
  setPreventDefaultBehavior(prevent: boolean): void {
    this.preventDefaultBehavior = prevent;
  }
  
  /**
   * Configura se eventos de toque devem emular eventos de mouse
   * @param emulate Verdadeiro para emular eventos de mouse
   */
  setTouchToMouseEmulation(emulate: boolean): void {
    this.touchToMouseEmulation = emulate;
  }
  
  /**
   * Limpa todas as posições de toque
   */
  clearTouchPositions(): void {
    this.touchPositions = [];
  }
  
  /**
   * Habilita ou desabilita o controlador de toque
   * @param enabled Estado de habilitação
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    
    // Se estiver desabilitando, limpa os estados
    if (!enabled) {
      this.clearTouchPositions();
    }
  }
  
  /**
   * Verifica se o controlador está habilitado
   * @returns Estado de habilitação
   */
  isEnabled(): boolean {
    return this.enabled;
  }
  
  /**
   * Limpa os recursos e remove os listeners de eventos
   */
  dispose(): void {
    if (this.element) {
      this.element.removeEventListener('touchstart', this.handleTouchStart.bind(this));
      this.element.removeEventListener('touchend', this.handleTouchEnd.bind(this));
      this.element.removeEventListener('touchmove', this.handleTouchMove.bind(this));
    }
    
    this.clearTouchPositions();
    this.removeAllListeners();
    this.element = null;
  }
} 