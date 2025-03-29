import { EventEmitter } from 'eventemitter3';

/**
 * Estados possíveis do jogo
 */
export enum GameState {
  INIT = 'init',         // Estado inicial, configuração do jogo
  PLAYING = 'playing',   // Jogo em andamento
  PAUSED = 'paused',     // Jogo pausado
  GAME_OVER = 'gameOver' // Fim de jogo
}

/**
 * Tipos de eventos emitidos pelo gerenciador de estado
 */
export enum GameStateEventType {
  STATE_CHANGED = 'stateChanged',
  GAME_STARTED = 'gameStarted',
  GAME_PAUSED = 'gamePaused',
  GAME_RESUMED = 'gameResumed',
  GAME_RESTARTED = 'gameRestarted',
  GAME_OVER = 'gameOver'
}

/**
 * Interface para dados associados aos eventos de estado
 */
export interface GameStateEventData {
  prevState?: GameState;
  newState: GameState;
  winnerIndex?: number;
}

/**
 * Classe responsável por gerenciar o estado do jogo
 */
export class GameStateManager extends EventEmitter {
  private currentState: GameState = GameState.INIT;
  private winnerIndex: number = -1;
  
  /**
   * Inicializa o gerenciador de estado
   */
  constructor() {
    super();
  }
  
  /**
   * Obtém o estado atual do jogo
   * @returns Estado atual
   */
  getCurrentState(): GameState {
    return this.currentState;
  }
  
  /**
   * Verifica se o jogo está em um determinado estado
   * @param state Estado a verificar
   * @returns Verdadeiro se o estado atual for o informado
   */
  isInState(state: GameState): boolean {
    return this.currentState === state;
  }
  
  /**
   * Verifica se o jogo está em andamento
   * @returns Verdadeiro se o jogo estiver no estado PLAYING
   */
  isPlaying(): boolean {
    return this.isInState(GameState.PLAYING);
  }
  
  /**
   * Muda o estado do jogo
   * @param newState Novo estado
   * @param data Dados adicionais (opcional)
   */
  private changeState(newState: GameState, data: Partial<GameStateEventData> = {}): void {
    // Se o estado não mudar, não fazemos nada
    if (newState === this.currentState) {
      return;
    }
    
    const prevState = this.currentState;
    this.currentState = newState;
    
    // Prepara dados do evento
    const eventData: GameStateEventData = {
      prevState,
      newState,
      ...data
    };
    
    // Emite evento geral de mudança de estado
    this.emit(GameStateEventType.STATE_CHANGED, eventData);
    
    // Emite eventos específicos baseados na transição
    switch (newState) {
      case GameState.PLAYING:
        if (prevState === GameState.INIT || prevState === GameState.GAME_OVER) {
          this.emit(GameStateEventType.GAME_STARTED, eventData);
        } else if (prevState === GameState.PAUSED) {
          this.emit(GameStateEventType.GAME_RESUMED, eventData);
        }
        break;
      case GameState.PAUSED:
        this.emit(GameStateEventType.GAME_PAUSED, eventData);
        break;
      case GameState.GAME_OVER:
        this.emit(GameStateEventType.GAME_OVER, eventData);
        break;
    }
  }
  
  /**
   * Inicia o jogo
   */
  startGame(): void {
    this.changeState(GameState.PLAYING);
  }
  
  /**
   * Pausa o jogo
   */
  pauseGame(): void {
    if (this.isInState(GameState.PLAYING)) {
      this.changeState(GameState.PAUSED);
    }
  }
  
  /**
   * Continua o jogo depois de pausado
   */
  resumeGame(): void {
    if (this.isInState(GameState.PAUSED)) {
      this.changeState(GameState.PLAYING);
    }
  }
  
  /**
   * Finaliza o jogo
   * @param winnerIndex Índice do jogador vencedor
   */
  endGame(winnerIndex: number): void {
    this.winnerIndex = winnerIndex;
    this.changeState(GameState.GAME_OVER, { winnerIndex });
  }
  
  /**
   * Reinicia o jogo
   */
  restartGame(): void {
    const wasGameOver = this.isInState(GameState.GAME_OVER);
    
    // Volta para o estado inicial e depois para o de jogo
    this.changeState(GameState.INIT);
    this.changeState(GameState.PLAYING);
    
    // Emite evento específico de reinício
    this.emit(GameStateEventType.GAME_RESTARTED, {
      prevState: wasGameOver ? GameState.GAME_OVER : GameState.PLAYING,
      newState: GameState.PLAYING
    });
    
    // Reseta variáveis internas
    this.winnerIndex = -1;
  }
  
  /**
   * Obtém o índice do jogador vencedor
   * @returns Índice do jogador vencedor ou -1 se o jogo não terminou
   */
  getWinnerIndex(): number {
    if (this.isInState(GameState.GAME_OVER)) {
      return this.winnerIndex;
    }
    return -1;
  }
} 