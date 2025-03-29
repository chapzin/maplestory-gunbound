import { EventEmitter } from 'eventemitter3';
import { 
  IInputController,
  InputEventType,
  MouseEventData,
  GameAction,
  PointerPosition
} from './input-types';

/**
 * Classe responsável por gerenciar eventos e estado do mouse
 */
export class MouseController extends EventEmitter implements IInputController {
  private element: HTMLElement | null = null;
  private enabled: boolean = true;
  private buttonsPressed: Set<number> = new Set();
  private mousePosition: PointerPosition = { x: 0, y: 0 };
  private preventContextMenu: boolean = true;
  
  /**
   * Inicializa o controlador de mouse
   * @param element Elemento HTML para capturar eventos
   */
  initialize(element: HTMLElement): void {
    this.element = element;
    this.setupEventListeners();
  }
  
  /**
   * Configura os listeners de eventos de mouse
   */
  private setupEventListeners(): void {
    if (!this.element) return;
    
    this.element.addEventListener('mousedown', this.handleMouseDown.bind(this));
    this.element.addEventListener('mouseup', this.handleMouseUp.bind(this));
    this.element.addEventListener('mousemove', this.handleMouseMove.bind(this));
    
    if (this.preventContextMenu) {
      this.element.addEventListener('contextmenu', (e) => {
        e.preventDefault();
      });
    }
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
      shiftKey: event.shiftKey,
      originalEvent: event
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
      shiftKey: event.shiftKey,
      originalEvent: event
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
      shiftKey: event.shiftKey,
      originalEvent: event
    };
    
    // Emite o evento
    this.emit(InputEventType.MOUSE_MOVE, eventData);
  }
  
  /**
   * Atualiza a posição do mouse com coordenadas relativas ao elemento
   */
  private updateMousePosition(event: MouseEvent): void {
    if (!this.element) return;
    
    const rect = this.element.getBoundingClientRect();
    
    this.mousePosition = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
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
  getMousePosition(): PointerPosition {
    return { ...this.mousePosition };
  }
  
  /**
   * Configura se o menu de contexto deve ser prevenido
   * @param prevent Verdadeiro para prevenir o menu de contexto
   */
  setPreventContextMenu(prevent: boolean): void {
    this.preventContextMenu = prevent;
  }
  
  /**
   * Limpa todos os botões pressionados
   */
  clearPressedButtons(): void {
    this.buttonsPressed.clear();
  }
  
  /**
   * Habilita ou desabilita o controlador de mouse
   * @param enabled Estado de habilitação
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    
    // Se estiver desabilitando, limpa os estados
    if (!enabled) {
      this.clearPressedButtons();
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
      this.element.removeEventListener('mousedown', this.handleMouseDown.bind(this));
      this.element.removeEventListener('mouseup', this.handleMouseUp.bind(this));
      this.element.removeEventListener('mousemove', this.handleMouseMove.bind(this));
      
      if (this.preventContextMenu) {
        this.element.removeEventListener('contextmenu', (e) => {
          e.preventDefault();
        });
      }
    }
    
    this.clearPressedButtons();
    this.removeAllListeners();
    this.element = null;
  }
} 