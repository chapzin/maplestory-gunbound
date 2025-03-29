import {
  InputManager,
  InputEventType,
  GameAction,
  KeyEventData,
  MouseEventData,
  TouchEventData,
  PointerPosition,
  InputOptions
} from './input/index';

/**
 * Adaptador para o sistema de input
 * Fornece uma interface compatível com o código existente
 */
export class InputSystem {
  private manager: InputManager;
  
  /**
   * Inicializa o sistema de input
   * @param element Elemento HTML para capturar eventos
   * @param options Opções de configuração
   */
  constructor(element: HTMLElement, options?: InputOptions) {
    this.manager = new InputManager(element, options);
  }
  
  /**
   * Define um novo mapeamento de teclas
   * @param mapping Novo mapeamento de teclas
   */
  setKeyMapping(mapping: Record<string, GameAction>): void {
    this.manager.setKeyMapping(mapping);
  }
  
  /**
   * Atualiza o mapeamento para uma tecla específica
   * @param key Tecla a ser mapeada
   * @param action Ação associada à tecla
   */
  mapKey(key: string, action: GameAction): void {
    this.manager.mapKey(key, action);
  }
  
  /**
   * Remove o mapeamento de uma tecla
   * @param key Tecla a ser desmapeada
   */
  unmapKey(key: string): void {
    this.manager.unmapKey(key);
  }
  
  /**
   * Verifica se uma tecla está pressionada
   * @param key Tecla a verificar
   * @returns Verdadeiro se a tecla estiver pressionada
   */
  isKeyPressed(key: string): boolean {
    return this.manager.isKeyPressed(key);
  }
  
  /**
   * Verifica se um botão do mouse está pressionado
   * @param button Botão a verificar (0: esquerdo, 1: meio, 2: direito)
   * @returns Verdadeiro se o botão estiver pressionado
   */
  isMouseButtonPressed(button: number): boolean {
    return this.manager.isMouseButtonPressed(button);
  }
  
  /**
   * Obtém a posição atual do mouse
   * @returns Posição do mouse
   */
  getMousePosition(): PointerPosition {
    return this.manager.getMousePosition();
  }
  
  /**
   * Obtém as posições atuais de toque
   * @returns Array de posições de toque
   */
  getTouchPositions(): PointerPosition[] {
    return this.manager.getTouchPositions();
  }
  
  /**
   * Habilita ou desabilita a entrada
   * @param enabled Estado de habilitação
   */
  setEnabled(enabled: boolean): void {
    this.manager.setEnabled(enabled);
  }
  
  /**
   * Verifica se a entrada está habilitada
   * @returns Estado de habilitação
   */
  isEnabled(): boolean {
    return this.manager.isEnabled();
  }
  
  /**
   * Registra um callback para um evento de input
   * @param event Tipo de evento
   * @param callback Função de callback
   */
  on(event: string, callback: (...args: any[]) => void): void {
    this.manager.on(event, callback);
  }
  
  /**
   * Remove um callback para um evento de input
   * @param event Tipo de evento
   * @param callback Função de callback
   */
  off(event: string, callback: (...args: any[]) => void): void {
    this.manager.off(event, callback);
  }
  
  /**
   * Atualiza o sistema de input
   * @param _deltaTime Tempo desde o último frame
   */
  update(_deltaTime: number): void {
    // Não é necessário fazer nada aqui, pois os controladores já usam event listeners
  }
  
  /**
   * Limpa os recursos e remove os listeners de eventos
   */
  dispose(): void {
    this.manager.dispose();
  }
  
  /**
   * Obtém o gerenciador de input interno
   * @returns Gerenciador de input
   */
  getInputManager(): InputManager {
    return this.manager;
  }
} 