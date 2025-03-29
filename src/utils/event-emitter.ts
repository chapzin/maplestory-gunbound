/**
 * Tipo que define uma função de callback para eventos
 */
export type EventCallback = (data: any) => void;

/**
 * Classe utilitária que implementa o padrão Observer para permitir
 * comunicação baseada em eventos entre diferentes componentes
 */
export class EventEmitter {
  private listeners: Map<string, EventCallback[]> = new Map();

  /**
   * Registra um callback para ser executado quando um evento específico for emitido
   * @param event Nome do evento
   * @param callback Função a ser executada quando o evento ocorrer
   */
  public on(event: string, callback: EventCallback): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)?.push(callback);
  }

  /**
   * Remove um callback anteriormente registrado para um evento específico
   * @param event Nome do evento
   * @param callback Função a ser removida
   */
  public off(event: string, callback: EventCallback): void {
    if (!this.listeners.has(event)) {
      return;
    }
    
    const callbacks = this.listeners.get(event);
    if (!callbacks) {
      return;
    }
    
    const index = callbacks.indexOf(callback);
    if (index !== -1) {
      callbacks.splice(index, 1);
    }
    
    // Se não houver mais callbacks para este evento, remove a entrada
    if (callbacks.length === 0) {
      this.listeners.delete(event);
    }
  }

  /**
   * Emite um evento, executando todos os callbacks registrados para ele
   * @param event Nome do evento
   * @param data Dados a serem passados para os callbacks
   */
  public emit(event: string, data?: any): void {
    if (!this.listeners.has(event)) {
      return;
    }
    
    const callbacks = this.listeners.get(event);
    if (!callbacks) {
      return;
    }
    
    // Cria uma cópia do array para evitar problemas se callbacks
    // modificarem a lista de listeners durante a iteração
    [...callbacks].forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Erro ao executar callback para o evento "${event}":`, error);
      }
    });
  }

  /**
   * Remove todos os listeners de um evento específico ou todos os eventos
   * @param event Nome do evento, se não for fornecido, todos os eventos serão limpos
   */
  public removeAllListeners(event?: string): void {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }

  /**
   * Remove todos os listeners de um evento específico ou todos os eventos
   * Método alias para removeAllListeners para manter a consistência de nomenclatura
   * @param event Nome do evento, se não for fornecido, todos os eventos serão limpos
   */
  public clear(event?: string): void {
    this.removeAllListeners(event);
  }

  /**
   * Retorna se existe pelo menos um listener para um determinado evento
   * @param event Nome do evento
   */
  public hasListeners(event: string): boolean {
    return this.listeners.has(event) && (this.listeners.get(event)?.length || 0) > 0;
  }
} 