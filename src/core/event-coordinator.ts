import { EventEmitter } from '../utils/event-emitter';
import { GameEventType, GameEventPayload } from '../utils/game-events';

/**
 * Classe que coordena todos os eventos do jogo
 * Implementa o padrão Singleton para garantir uma única instância global
 */
export class EventCoordinator {
  private static instance: EventCoordinator;
  private emitter: EventEmitter;
  private eventsLog: Array<{type: string, payload: any, timestamp: number}> = [];
  private maxLogSize: number = 1000;
  private debugMode: boolean = false;
  
  /**
   * Construtor privado para garantir implementação Singleton
   */
  private constructor() {
    this.emitter = new EventEmitter();
  }
  
  /**
   * Retorna a instância única do EventCoordinator
   */
  public static getInstance(): EventCoordinator {
    if (!EventCoordinator.instance) {
      EventCoordinator.instance = new EventCoordinator();
    }
    return EventCoordinator.instance;
  }
  
  /**
   * Registra um callback para um tipo de evento específico
   * @param eventType Tipo do evento a ser observado
   * @param callback Função a ser executada quando o evento ocorrer
   */
  public on<T extends GameEventPayload>(eventType: GameEventType, callback: (data: T) => void): void {
    this.emitter.on(eventType, callback as any);
  }
  
  /**
   * Remove um callback registrado para um tipo de evento
   * @param eventType Tipo do evento
   * @param callback Função a ser removida
   */
  public off<T extends GameEventPayload>(eventType: GameEventType, callback: (data: T) => void): void {
    this.emitter.off(eventType, callback as any);
  }
  
  /**
   * Emite um evento para todos os listeners registrados
   * @param eventType Tipo do evento a ser emitido
   * @param payload Dados associados ao evento
   */
  public emit<T extends GameEventPayload>(eventType: GameEventType, payload: T): void {
    // Garante que o payload tenha um timestamp
    if (!payload.timestamp) {
      (payload as any).timestamp = Date.now();
    }
    
    // Registra o evento no log se o debug estiver ativado
    if (this.debugMode) {
      this.logEvent(eventType, payload);
    }
    
    // Emite o evento
    this.emitter.emit(eventType, payload);
  }
  
  /**
   * Remove todos os listeners de um tipo de evento específico
   * @param eventType Tipo do evento (opcional, se não fornecido, remove todos os listeners)
   */
  public removeAllListeners(eventType?: GameEventType): void {
    if (eventType) {
      this.emitter.removeAllListeners(eventType);
    } else {
      this.emitter.removeAllListeners();
    }
  }
  
  /**
   * Verifica se existe pelo menos um listener para um determinado evento
   * @param eventType Tipo do evento
   */
  public hasListeners(eventType: GameEventType): boolean {
    return this.emitter.hasListeners(eventType);
  }
  
  /**
   * Ativa ou desativa o modo de depuração
   * @param enabled Estado do modo de depuração
   */
  public setDebugMode(enabled: boolean): void {
    this.debugMode = enabled;
    console.log(`Modo de depuração ${enabled ? 'ativado' : 'desativado'}`);
  }
  
  /**
   * Define o tamanho máximo do log de eventos
   * @param size Número máximo de eventos armazenados
   */
  public setMaxLogSize(size: number): void {
    this.maxLogSize = size;
    
    // Limita o log ao novo tamanho se necessário
    if (this.eventsLog.length > this.maxLogSize) {
      this.eventsLog = this.eventsLog.slice(this.eventsLog.length - this.maxLogSize);
    }
  }
  
  /**
   * Retorna o log completo de eventos
   */
  public getEventsLog(): Array<{type: string, payload: any, timestamp: number}> {
    return [...this.eventsLog];
  }
  
  /**
   * Limpa o log de eventos
   */
  public clearEventsLog(): void {
    this.eventsLog = [];
    console.log('Log de eventos foi limpo');
  }
  
  /**
   * Registra um evento no log interno
   * @param eventType Tipo do evento
   * @param payload Dados do evento
   */
  private logEvent(eventType: string, payload: any): void {
    // Adiciona o evento ao log
    this.eventsLog.push({
      type: eventType,
      payload: { ...payload }, // Cria uma cópia para evitar modificações externas
      timestamp: Date.now()
    });
    
    // Limita o tamanho do log
    if (this.eventsLog.length > this.maxLogSize) {
      this.eventsLog.shift(); // Remove o evento mais antigo
    }
  }
} 