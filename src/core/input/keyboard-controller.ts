import { EventEmitter } from 'eventemitter3';
import { 
  IInputController,
  InputEventType,
  KeyEventData,
  KeyMapping,
  GameAction
} from './input-types';

/**
 * Classe responsável por gerenciar eventos e estado do teclado
 */
export class KeyboardController extends EventEmitter implements IInputController {
  private element: HTMLElement | null = null;
  private enabled: boolean = true;
  private keyMapping: KeyMapping = {};
  private keysPressed: Set<string> = new Set();
  
  /**
   * Mapeamento padrão de teclas para ações
   */
  private defaultKeyMapping: KeyMapping = {
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
  
  /**
   * Inicializa o controlador de teclado
   * @param element Elemento HTML para capturar eventos
   */
  initialize(element: HTMLElement): void {
    this.element = element;
    this.keyMapping = { ...this.defaultKeyMapping };
    this.setupEventListeners();
  }
  
  /**
   * Configura os listeners de eventos de teclado
   */
  private setupEventListeners(): void {
    window.addEventListener('keydown', this.handleKeyDown.bind(this));
    window.addEventListener('keyup', this.handleKeyUp.bind(this));
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
      repeat: event.repeat,
      originalEvent: event
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
      repeat: false,
      originalEvent: event
    };
    
    // Adiciona a ação mapeada se existir
    if (this.keyMapping[event.key]) {
      eventData.action = this.keyMapping[event.key];
    }
    
    // Emite o evento
    this.emit(InputEventType.KEY_UP, eventData);
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
   * Obtém o mapeamento atual de teclas
   */
  getKeyMapping(): KeyMapping {
    return { ...this.keyMapping };
  }
  
  /**
   * Redefine para o mapeamento padrão de teclas
   */
  resetToDefaultMapping(): void {
    this.keyMapping = { ...this.defaultKeyMapping };
  }
  
  /**
   * Limpa todas as teclas pressionadas
   */
  clearPressedKeys(): void {
    this.keysPressed.clear();
  }
  
  /**
   * Habilita ou desabilita o controlador de teclado
   * @param enabled Estado de habilitação
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    
    // Se estiver desabilitando, limpa os estados
    if (!enabled) {
      this.clearPressedKeys();
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
    window.removeEventListener('keydown', this.handleKeyDown.bind(this));
    window.removeEventListener('keyup', this.handleKeyUp.bind(this));
    
    this.clearPressedKeys();
    this.removeAllListeners();
    this.element = null;
  }
} 