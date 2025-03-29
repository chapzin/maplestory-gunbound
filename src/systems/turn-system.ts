import * as PIXI from 'pixi.js';
import { EventEmitter } from 'eventemitter3';

export enum TurnEventType {
  TURN_STARTED = 'turnStarted',
  TURN_ENDED = 'turnEnded',
  TIMER_UPDATED = 'timerUpdated'
}

export class TurnSystem extends EventEmitter {
  private currentPlayerIndex: number;
  private playersCount: number;
  private isPlayerTurn: boolean;
  private turnTime: number;
  private maxTurnTime: number;
  private timerText: PIXI.Text;
  private uiContainer: PIXI.Container;
  
  constructor(uiContainer: PIXI.Container, playersCount: number = 2) {
    super();
    this.uiContainer = uiContainer;
    this.currentPlayerIndex = 0;
    this.playersCount = playersCount;
    this.isPlayerTurn = true;
    this.turnTime = 0;
    this.maxTurnTime = 30;
    
    this.timerText = new PIXI.Text('', {
      fontFamily: 'Arial',
      fontSize: 16,
      fill: 0xFFFFFF
    });
    this.timerText.position.set(this.uiContainer.width - 100, 10);
    this.uiContainer.addChild(this.timerText);
  }
  
  update(delta: number): void {
    if (this.isPlayerTurn) {
      this.turnTime += delta;
      const timeLeft = Math.max(0, this.maxTurnTime - this.turnTime);
      this.timerText.text = `Tempo: ${Math.ceil(timeLeft)}`;
      this.emit(TurnEventType.TIMER_UPDATED, timeLeft);
      
      if (this.turnTime >= this.maxTurnTime) {
        this.endTurn();
      }
    }
  }
  
  startNewTurn(): void {
    this.turnTime = 0;
    this.isPlayerTurn = true;
    this.emit(TurnEventType.TURN_STARTED, {
      playerIndex: this.currentPlayerIndex,
      isPlayerTurn: this.isPlayerTurn
    });
  }
  
  endTurn(): void {
    this.emit(TurnEventType.TURN_ENDED, {
      playerIndex: this.currentPlayerIndex
    });
    this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.playersCount;
    this.startNewTurn();
  }
  
  getCurrentPlayerIndex(): number {
    return this.currentPlayerIndex;
  }
  
  getIsPlayerTurn(): boolean {
    return this.isPlayerTurn;
  }
  
  getRemainingTime(): number {
    return Math.max(0, this.maxTurnTime - this.turnTime);
  }
  
  forceEndTurn(): void {
    this.endTurn();
  }
} 