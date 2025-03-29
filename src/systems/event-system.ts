/**
 * Sistema de eventos para comunicação entre componentes
 * Implementa o padrão Observer/PubSub
 */
export class EventSystem {
  private static instance: EventSystem;
  private listeners: Map<string, Function[]> = new Map();

  /**
   * Construtor privado para implementar Singleton
   */
  private constructor() {}

  /**
   * Obtém a instância única do sistema de eventos
   */
  public static getInstance(): EventSystem {
    if (!EventSystem.instance) {
      EventSystem.instance = new EventSystem();
    }
    return EventSystem.instance;
  }

  /**
   * Registra um listener para um evento específico
   * @param eventName Nome do evento
   * @param callback Função a ser chamada quando o evento ocorrer
   */
  public on(eventName: string, callback: Function): void {
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, []);
    }
    this.listeners.get(eventName)?.push(callback);
  }

  /**
   * Remove um listener de um evento específico
   * @param eventName Nome do evento
   * @param callback Função a ser removida
   */
  public off(eventName: string, callback: Function): void {
    if (!this.listeners.has(eventName)) return;
    
    const eventListeners = this.listeners.get(eventName);
    if (eventListeners) {
      const index = eventListeners.indexOf(callback);
      if (index !== -1) {
        eventListeners.splice(index, 1);
      }
    }
  }

  /**
   * Emite um evento com dados opcionais
   * @param eventName Nome do evento
   * @param data Dados a serem passados aos listeners
   */
  public emit(eventName: string, data?: any): void {
    if (!this.listeners.has(eventName)) return;
    
    const eventListeners = this.listeners.get(eventName);
    if (eventListeners) {
      eventListeners.forEach(callback => {
        callback(data);
      });
    }
  }

  /**
   * Remove todos os listeners de um evento específico
   * @param eventName Nome do evento
   */
  public clearEvent(eventName: string): void {
    this.listeners.delete(eventName);
  }

  /**
   * Remove todos os listeners de todos os eventos
   */
  public clearAll(): void {
    this.listeners.clear();
  }
} 