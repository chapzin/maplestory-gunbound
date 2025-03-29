import * as PIXI from 'pixi.js';
import { UISystem } from '../ui';
import { GameUI } from '../../ui/game-ui';
import { BenchmarkUI } from '../../ui/benchmark';
import { EventEmitter, EventCallback } from '../../utils/event-emitter';

/**
 * Tipos de eventos de UI
 */
export enum UIEventType {
  UI_ELEMENT_CREATED = 'ui_element_created',
  UI_ELEMENT_UPDATED = 'ui_element_updated',
  UI_ELEMENT_REMOVED = 'ui_element_removed',
  BUTTON_CLICKED = 'button_clicked',
  BENCHMARK_OPENED = 'benchmark_opened',
  BENCHMARK_CLOSED = 'benchmark_closed'
}

/**
 * Interface para o coordenador de UI
 */
export interface IUICoordinator {
  /**
   * Inicializa o coordenador de UI
   * @param width Largura da tela
   * @param height Altura da tela
   * @param container Container de UI
   */
  initialize(width: number, height: number, container: PIXI.Container): void;
  
  /**
   * Atualiza o indicador de turno do jogador
   * @param playerIndex Índice do jogador atual
   */
  updatePlayerTurn(playerIndex: number): void;
  
  /**
   * Atualiza o indicador de vento
   * @param wind Valor do vento
   */
  updateWindIndicator(wind: number): void;
  
  /**
   * Define a visibilidade do botão de fim de turno
   * @param visible Estado de visibilidade
   */
  setEndTurnButtonVisible(visible: boolean): void;
  
  /**
   * Define o callback do botão de fim de turno
   * @param callback Função a ser chamada quando o botão for clicado
   */
  setEndTurnCallback(callback: () => void): void;
  
  /**
   * Mostra a tela de game over
   * @param winnerIndex Índice do jogador vencedor
   * @param onRestart Callback para reiniciar o jogo
   */
  showGameOver(winnerIndex: number, onRestart: () => void): void;
  
  /**
   * Esconde a tela de game over
   */
  hideGameOver(): void;
  
  /**
   * Mostra um texto flutuante na tela
   * @param text Texto a ser mostrado
   * @param x Posição X
   * @param y Posição Y
   * @param color Cor do texto
   */
  showFloatingText(text: string, x: number, y: number, color: number): void;
  
  /**
   * Registra um callback para um tipo de evento de UI
   * @param eventType Tipo do evento
   * @param callback Função de callback
   */
  on(eventType: UIEventType, callback: EventCallback): void;
  
  /**
   * Remove um callback registrado para um tipo de evento de UI
   * @param eventType Tipo do evento
   * @param callback Função de callback a ser removida
   */
  off(eventType: UIEventType, callback: EventCallback): void;
  
  /**
   * Atualiza o coordenador de UI
   * @param delta Delta time
   */
  update(delta: number): void;
  
  /**
   * Mostra a interface de benchmark
   */
  showBenchmarkUI(): void;
  
  /**
   * Esconde a interface de benchmark
   */
  hideBenchmarkUI(): void;
  
  /**
   * Alterna a visibilidade da interface de benchmark
   */
  toggleBenchmarkUI(): void;
  
  /**
   * Define o callback do botão de benchmark
   * @param callback Função a ser chamada quando o botão for clicado
   */
  setBenchmarkButtonCallback(callback: () => void): void;
  
  /**
   * Libera recursos do coordenador de UI
   */
  dispose(): void;
}

/**
 * Implementação do coordenador de UI
 */
export class UICoordinator implements IUICoordinator {
  private uiSystem: UISystem;
  private gameUI: GameUI;
  private benchmarkUI?: BenchmarkUI;
  private eventEmitter: EventEmitter = new EventEmitter();
  private initialized: boolean = false;
  
  /**
   * Inicializa o coordenador de UI
   * @param width Largura da tela
   * @param height Altura da tela
   * @param container Container de UI
   */
  initialize(width: number, height: number, container: PIXI.Container): void {
    if (this.initialized) return;
    
    this.uiSystem = new UISystem(container);
    this.gameUI = new GameUI(this.uiSystem, width, height);
    
    // Inicializa a interface de benchmark
    this.benchmarkUI = new BenchmarkUI(this.uiSystem, width, height);
    
    this.initialized = true;
  }
  
  /**
   * Atualiza o indicador de turno do jogador
   * @param playerIndex Índice do jogador atual
   */
  updatePlayerTurn(playerIndex: number): void {
    if (!this.initialized) {
      console.warn('UICoordinator não foi inicializado');
      return;
    }
    
    this.gameUI.updatePlayerTurn(playerIndex);
    
    this.eventEmitter.emit(UIEventType.UI_ELEMENT_UPDATED, {
      element: 'player_turn',
      playerIndex
    });
  }
  
  /**
   * Atualiza o indicador de vento
   * @param wind Valor do vento
   */
  updateWindIndicator(wind: number): void {
    if (!this.initialized) return;
    
    this.gameUI.updateWindIndicator(wind);
    
    this.eventEmitter.emit(UIEventType.UI_ELEMENT_UPDATED, {
      element: 'wind_indicator',
      wind
    });
  }
  
  /**
   * Define a visibilidade do botão de fim de turno
   * @param visible Estado de visibilidade
   */
  setEndTurnButtonVisible(visible: boolean): void {
    if (!this.initialized) return;
    
    this.gameUI.setEndTurnButtonVisible(visible);
    
    this.eventEmitter.emit(UIEventType.UI_ELEMENT_UPDATED, {
      element: 'end_turn_button',
      visible
    });
  }
  
  /**
   * Define o callback do botão de fim de turno
   * @param callback Função a ser chamada quando o botão for clicado
   */
  setEndTurnCallback(callback: () => void): void {
    if (!this.initialized) return;
    
    this.gameUI.setEndTurnCallback(() => {
      callback();
      
      this.eventEmitter.emit(UIEventType.BUTTON_CLICKED, {
        button: 'end_turn_button'
      });
    });
  }
  
  /**
   * Mostra a tela de game over
   * @param winnerIndex Índice do jogador vencedor
   * @param onRestart Callback para reiniciar o jogo
   */
  showGameOver(winnerIndex: number, onRestart: () => void): void {
    if (!this.initialized) return;
    
    this.gameUI.showGameOver(winnerIndex, () => {
      onRestart();
      
      this.eventEmitter.emit(UIEventType.BUTTON_CLICKED, {
        button: 'restart_button'
      });
    });
    
    this.eventEmitter.emit(UIEventType.UI_ELEMENT_CREATED, {
      element: 'game_over_screen',
      winnerIndex
    });
  }
  
  /**
   * Esconde a tela de game over
   */
  hideGameOver(): void {
    if (!this.initialized) return;
    
    this.gameUI.hideGameOver();
    
    this.eventEmitter.emit(UIEventType.UI_ELEMENT_REMOVED, {
      element: 'game_over_screen'
    });
  }
  
  /**
   * Mostra um texto flutuante na tela
   * @param text Texto a ser mostrado
   * @param x Posição X
   * @param y Posição Y
   * @param color Cor do texto
   */
  showFloatingText(text: string, x: number, y: number, color: number): void {
    if (!this.initialized) return;
    
    this.gameUI.showFloatingText(text, x, y, color);
    
    this.eventEmitter.emit(UIEventType.UI_ELEMENT_CREATED, {
      element: 'floating_text',
      text,
      position: { x, y },
      color
    });
  }
  
  /**
   * Registra um callback para um tipo de evento de UI
   * @param eventType Tipo do evento
   * @param callback Função de callback
   */
  on(eventType: UIEventType, callback: EventCallback): void {
    this.eventEmitter.on(eventType, callback);
  }
  
  /**
   * Remove um callback registrado para um tipo de evento de UI
   * @param eventType Tipo do evento
   * @param callback Função de callback a ser removida
   */
  off(eventType: UIEventType, callback: EventCallback): void {
    this.eventEmitter.off(eventType, callback);
  }
  
  /**
   * Atualiza o coordenador de UI
   * @param delta Delta time
   */
  update(delta: number): void {
    if (!this.initialized) return;
    
    this.uiSystem.update(delta);
  }
  
  /**
   * Mostra a interface de benchmark
   */
  showBenchmarkUI(): void {
    if (!this.initialized || !this.benchmarkUI) return;
    
    this.benchmarkUI.show();
    
    this.eventEmitter.emit(UIEventType.BENCHMARK_OPENED, {
      timestamp: Date.now()
    });
  }
  
  /**
   * Esconde a interface de benchmark
   */
  hideBenchmarkUI(): void {
    if (!this.initialized || !this.benchmarkUI) return;
    
    this.benchmarkUI.hide();
    
    this.eventEmitter.emit(UIEventType.BENCHMARK_CLOSED, {
      timestamp: Date.now()
    });
  }
  
  /**
   * Alterna a visibilidade da interface de benchmark
   */
  toggleBenchmarkUI(): void {
    if (!this.initialized || !this.benchmarkUI) return;
    
    this.benchmarkUI.toggle();
  }
  
  /**
   * Define o callback do botão de benchmark
   * @param callback Função a ser chamada quando o botão for clicado
   */
  setBenchmarkButtonCallback(callback: () => void): void {
    if (!this.initialized) return;
    
    this.gameUI.setBenchmarkCallback(() => {
      callback();
      
      this.eventEmitter.emit(UIEventType.BUTTON_CLICKED, {
        button: 'benchmark_button'
      });
    });
  }
  
  /**
   * Libera recursos do coordenador de UI
   */
  dispose(): void {
    if (!this.initialized) return;
    
    if (this.uiSystem) {
      // Remove listeners e limpa eventos
      this.eventEmitter.removeAllListeners();
      
      // Libera recursos das interfaces
      if (this.benchmarkUI) {
        this.benchmarkUI.destroy();
      }
      
      // Libera recursos existentes
      this.gameUI.clear();
      this.initialized = false;
    }
  }
} 