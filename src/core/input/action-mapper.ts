import { EventEmitter } from 'eventemitter3';
import {
  GameAction,
  KeyMapping,
  KeyEventData,
  MouseEventData
} from './input-types';

/**
 * Classe responsável por mapear inputs para ações do jogo
 */
export class ActionMapper extends EventEmitter {
  private keyMapping: KeyMapping = {};
  private mouseButtonMapping: Map<number, GameAction> = new Map();
  
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
   * Inicializa o mapeador de ações com configurações padrão
   */
  constructor() {
    super();
    
    // Configura o mapeamento padrão de teclas
    this.keyMapping = { ...this.defaultKeyMapping };
    
    // Configura o mapeamento padrão de botões do mouse
    this.mouseButtonMapping.set(0, GameAction.FIRE); // Botão esquerdo
  }
  
  /**
   * Processa um evento de teclado para mapear para uma ação
   * @param eventData Dados do evento de teclado
   * @returns Dados do evento com a ação mapeada, se existir
   */
  mapKeyEvent(eventData: KeyEventData): KeyEventData {
    // Cria uma cópia para não modificar o objeto original
    const mappedEvent = { ...eventData };
    
    // Adiciona a ação mapeada se existir
    if (this.keyMapping[eventData.key]) {
      mappedEvent.action = this.keyMapping[eventData.key];
    }
    
    return mappedEvent;
  }
  
  /**
   * Processa um evento de mouse para mapear para uma ação
   * @param eventData Dados do evento de mouse
   * @returns Dados do evento com a ação mapeada, se existir
   */
  mapMouseEvent(eventData: MouseEventData): MouseEventData {
    // Cria uma cópia para não modificar o objeto original
    const mappedEvent = { ...eventData };
    
    // Adiciona a ação mapeada se existir para esse botão
    if (this.mouseButtonMapping.has(eventData.button)) {
      mappedEvent.action = this.mouseButtonMapping.get(eventData.button);
    }
    
    return mappedEvent;
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
   * Define um mapeamento para um botão do mouse
   * @param button Botão do mouse (0: esquerdo, 1: meio, 2: direito)
   * @param action Ação associada ao botão
   */
  mapMouseButton(button: number, action: GameAction): void {
    this.mouseButtonMapping.set(button, action);
  }
  
  /**
   * Remove o mapeamento de um botão do mouse
   * @param button Botão do mouse a ser desmapeado
   */
  unmapMouseButton(button: number): void {
    this.mouseButtonMapping.delete(button);
  }
  
  /**
   * Obtém o mapeamento atual de teclas
   * @returns Mapeamento de teclas
   */
  getKeyMapping(): KeyMapping {
    return { ...this.keyMapping };
  }
  
  /**
   * Obtém o mapeamento atual de botões do mouse
   * @returns Mapeamento de botões do mouse
   */
  getMouseButtonMapping(): Map<number, GameAction> {
    return new Map(this.mouseButtonMapping);
  }
  
  /**
   * Redefine para o mapeamento padrão de teclas
   */
  resetToDefaultKeyMapping(): void {
    this.keyMapping = { ...this.defaultKeyMapping };
  }
  
  /**
   * Redefine para o mapeamento padrão de botões do mouse
   */
  resetToDefaultMouseMapping(): void {
    this.mouseButtonMapping.clear();
    this.mouseButtonMapping.set(0, GameAction.FIRE); // Botão esquerdo
  }
  
  /**
   * Redefine todos os mapeamentos para o padrão
   */
  resetAllMappings(): void {
    this.resetToDefaultKeyMapping();
    this.resetToDefaultMouseMapping();
  }
} 