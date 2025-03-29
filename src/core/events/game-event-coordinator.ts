import { EventEmitter, EventCallback } from '../../utils/event-emitter';
import { GameSystems } from '../interfaces/game-systems';

/**
 * Interface para o coordenador de eventos do jogo
 */
export interface IGameEventCoordinator {
  /**
   * Inicializa o coordenador de eventos
   * @param systems Sistemas do jogo
   */
  initialize(systems: GameSystems): void;
  
  /**
   * Configura os eventos necessários
   */
  setupEvents(): void;
  
  /**
   * Registra um callback para um tipo de evento
   * @param eventType Tipo do evento
   * @param callback Função de callback
   */
  on(eventType: string, callback: EventCallback): void;
  
  /**
   * Emite um evento
   * @param eventType Tipo do evento
   * @param data Dados do evento
   */
  emit(eventType: string, data: any): void;
  
  /**
   * Libera recursos do coordenador de eventos
   */
  dispose(): void;
}

/**
 * Implementação do coordenador de eventos do jogo
 * Esta classe coordena a comunicação entre os diferentes componentes
 * do jogo, traduzindo eventos de um sistema para outro.
 */
export class GameEventCoordinator implements IGameEventCoordinator {
  private systems: GameSystems;
  private eventEmitter: EventEmitter = new EventEmitter();
  private eventHandlers: Map<string, EventCallback> = new Map();
  private initialized: boolean = false;
  
  /**
   * Inicializa o coordenador de eventos
   * @param systems Sistemas do jogo
   */
  initialize(systems: GameSystems): void {
    if (this.initialized) return;
    
    this.systems = systems;
    this.initialized = true;
  }
  
  /**
   * Configura os eventos necessários
   */
  setupEvents(): void {
    if (!this.initialized) {
      console.warn('GameEventCoordinator não foi inicializado');
      return;
    }
    
    // Configurar eventos de entrada
    this.setupInputEvents();
    
    // Configurar eventos de veículos
    this.setupVehicleEvents();
    
    // Configurar eventos de turnos
    this.setupTurnEvents();
    
    // Configurar eventos de projéteis
    this.setupProjectileEvents();
    
    // Configurar eventos de mira
    this.setupAimingEvents();
    
    // Configurar eventos de estado do jogo
    this.setupGameStateEvents();
    
    // Configurar eventos de áudio
    this.setupAudioEvents();
  }
  
  /**
   * Configura os eventos de entrada do usuário
   */
  private setupInputEvents(): void {
    // Implementação será feita na versão final
  }
  
  /**
   * Configura os eventos relacionados a veículos
   */
  private setupVehicleEvents(): void {
    // Implementação será feita na versão final
  }
  
  /**
   * Configura os eventos relacionados a turnos
   */
  private setupTurnEvents(): void {
    // Implementação será feita na versão final
  }
  
  /**
   * Configura os eventos relacionados a projéteis
   */
  private setupProjectileEvents(): void {
    // Implementação será feita na versão final
  }
  
  /**
   * Configura os eventos relacionados ao sistema de mira
   */
  private setupAimingEvents(): void {
    // Implementação será feita na versão final
  }
  
  /**
   * Configura os eventos relacionados ao estado do jogo
   */
  private setupGameStateEvents(): void {
    // Implementação será feita na versão final
  }
  
  /**
   * Configura os eventos relacionados ao áudio
   */
  private setupAudioEvents(): void {
    // Implementação será feita na versão final
  }
  
  /**
   * Registra um callback para um tipo de evento
   * @param eventType Tipo do evento
   * @param callback Função de callback
   */
  on(eventType: string, callback: EventCallback): void {
    this.eventEmitter.on(eventType, callback);
  }
  
  /**
   * Emite um evento
   * @param eventType Tipo do evento
   * @param data Dados do evento
   */
  emit(eventType: string, data: any): void {
    this.eventEmitter.emit(eventType, data);
  }
  
  /**
   * Libera recursos do coordenador de eventos
   */
  dispose(): void {
    if (!this.initialized) return;
    
    // Remover todos os event listeners
    this.eventEmitter.removeAllListeners();
    
    // Limpar mapa de handlers
    this.eventHandlers.clear();
    
    this.initialized = false;
  }
} 