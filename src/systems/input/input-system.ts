import * as PIXI from 'pixi.js';
import { EventSystem } from '../event-system';
import { CONFIG } from '../../core/config';

/**
 * Sistema responsável por gerenciar entradas de teclado e mouse
 */
export class InputSystem {
  private app: PIXI.Application;
  private eventSystem: EventSystem;
  private isAiming: boolean = false;
  private startX: number = 100;
  private startY: number = 300;
  private currentAngle: number = 45;
  private currentPower: number = 50;
  
  // Armazenar referências para os handlers
  private boundOnKeyDown: (event: KeyboardEvent) => void;
  private boundOnPointerDown: (event: PIXI.FederatedPointerEvent) => void;
  private boundOnPointerMove: (event: PIXI.FederatedPointerEvent) => void;
  private boundOnPointerUp: (event: PIXI.FederatedPointerEvent) => void;

  // Eventos específicos do sistema
  private static readonly EVENTS = {
    ANGLE_CHANGE: 'input:angle_change',
    POWER_CHANGE: 'input:power_change',
    AIM_START: 'input:aim_start',
    AIM_MOVE: 'input:aim_move',
    AIM_END: 'input:aim_end',
    FIRE: 'input:fire',
  };

  /**
   * Inicializa o sistema de input
   * @param app Aplicação Pixi.js
   */
  constructor(app: PIXI.Application) {
    this.app = app;
    this.eventSystem = EventSystem.getInstance();
    
    // Inicializa os handlers vinculados
    this.boundOnKeyDown = this.onKeyDown.bind(this);
    this.boundOnPointerDown = this.onPointerDown.bind(this);
    this.boundOnPointerMove = this.onPointerMove.bind(this);
    this.boundOnPointerUp = this.onPointerUp.bind(this);
    
    this.setupInputs();
  }

  /**
   * Configura os inputs de jogo
   */
  private setupInputs(): void {
    // Adiciona listeners para eventos de teclado
    window.addEventListener('keydown', this.boundOnKeyDown);
    
    // Configura o modo de eventos para o stage
    this.app.stage.eventMode = 'static';
    
    // Adiciona listeners para eventos de mouse usando o sistema de eventos do Pixi
    this.app.stage.on('pointerdown', this.boundOnPointerDown);
    this.app.stage.on('pointermove', this.boundOnPointerMove);
    this.app.stage.on('pointerup', this.boundOnPointerUp);
  }

  /**
   * Manipula evento de tecla pressionada
   * @param event Evento de tecla
   */
  private onKeyDown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'ArrowUp':
        // Aumenta o ângulo
        this.currentAngle = Math.min(90, this.currentAngle + 5);
        this.eventSystem.emit(InputSystem.EVENTS.ANGLE_CHANGE, this.currentAngle);
        break;
      case 'ArrowDown':
        // Diminui o ângulo
        this.currentAngle = Math.max(0, this.currentAngle - 5);
        this.eventSystem.emit(InputSystem.EVENTS.ANGLE_CHANGE, this.currentAngle);
        break;
      case 'ArrowLeft':
        // Diminui a potência
        this.currentPower = Math.max(CONFIG.GAME.MIN_POWER, this.currentPower - 5);
        this.eventSystem.emit(InputSystem.EVENTS.POWER_CHANGE, this.currentPower);
        break;
      case 'ArrowRight':
        // Aumenta a potência
        this.currentPower = Math.min(CONFIG.GAME.MAX_POWER, this.currentPower + 5);
        this.eventSystem.emit(InputSystem.EVENTS.POWER_CHANGE, this.currentPower);
        break;
      case ' ':
        // Dispara o projétil
        this.eventSystem.emit(InputSystem.EVENTS.FIRE);
        break;
    }
  }

  /**
   * Manipula evento de clique do mouse
   */
  private onPointerDown(event: PIXI.FederatedPointerEvent): void {
    this.isAiming = true;
    this.eventSystem.emit(InputSystem.EVENTS.AIM_START);
    this.updateAim(event.global.x, event.global.y);
  }

  /**
   * Manipula evento de movimento do mouse
   */
  private onPointerMove(event: PIXI.FederatedPointerEvent): void {
    if (this.isAiming) {
      this.updateAim(event.global.x, event.global.y);
    }
  }

  /**
   * Manipula evento de liberação do mouse
   */
  private onPointerUp(_event: PIXI.FederatedPointerEvent): void {
    if (this.isAiming) {
      this.isAiming = false;
      this.eventSystem.emit(InputSystem.EVENTS.AIM_END);
      this.eventSystem.emit(InputSystem.EVENTS.FIRE);
    }
  }

  /**
   * Atualiza mira com base na posição do mouse
   */
  private updateAim(mouseX: number, mouseY: number): void {
    // Converte coordenadas globais para posição relativa ao ponto de disparo
    // Não precisamos mais da conversão getBoundingClientRect
    const canvasX = mouseX;
    const canvasY = mouseY;
    
    // Calcula ângulo baseado na posição do mouse em relação ao ponto de disparo
    const dx = canvasX - this.startX;
    const dy = this.startY - canvasY; // Invertido porque Y cresce para baixo
    
    // Calcula ângulo em radianos e converte para graus
    let angle = Math.atan2(dy, dx) * (180 / Math.PI);
    
    // Limita o ângulo entre 0 e 90 graus
    angle = Math.max(0, Math.min(90, angle));
    
    // Calcula potência baseada na distância
    const distance = Math.sqrt(dx * dx + dy * dy);
    let power = distance / 5; // Ajuste o divisor para controlar a sensibilidade
    
    // Limita a potência
    power = Math.max(CONFIG.GAME.MIN_POWER, Math.min(CONFIG.GAME.MAX_POWER, power));
    
    // Atualiza os valores atuais
    this.currentAngle = angle;
    this.currentPower = power;
    
    // Emite eventos de alteração
    this.eventSystem.emit(InputSystem.EVENTS.ANGLE_CHANGE, this.currentAngle);
    this.eventSystem.emit(InputSystem.EVENTS.POWER_CHANGE, this.currentPower);
    this.eventSystem.emit(InputSystem.EVENTS.AIM_MOVE, { angle, power });
  }

  /**
   * Atualiza o sistema (chamado a cada frame)
   * @param _deltaTime Tempo desde o último frame
   */
  public update(_deltaTime: number): void {
    // Atualização específica do sistema de input, se necessário
  }

  /**
   * Registra callback para mudança de ângulo
   * @param callback Função a ser chamada
   */
  public onAngleChange(callback: (angle: number) => void): void {
    this.eventSystem.on(InputSystem.EVENTS.ANGLE_CHANGE, callback);
  }

  /**
   * Registra callback para mudança de potência
   * @param callback Função a ser chamada
   */
  public onPowerChange(callback: (power: number) => void): void {
    this.eventSystem.on(InputSystem.EVENTS.POWER_CHANGE, callback);
  }

  /**
   * Registra callback para disparo
   * @param callback Função a ser chamada
   */
  public onFire(callback: () => void): void {
    this.eventSystem.on(InputSystem.EVENTS.FIRE, callback);
  }

  /**
   * Obtém o ângulo atual
   */
  public getAngle(): number {
    return this.currentAngle;
  }

  /**
   * Obtém a potência atual
   */
  public getPower(): number {
    return this.currentPower;
  }

  /**
   * Define o ponto de início para cálculos de ângulo e potência
   * @param x Coordenada X
   * @param y Coordenada Y
   */
  public setStartPoint(x: number, y: number): void {
    this.startX = x;
    this.startY = y;
  }

  /**
   * Limpa recursos ao destruir o sistema
   */
  public destroy(): void {
    window.removeEventListener('keydown', this.boundOnKeyDown);
    
    // Remove os event listeners do Pixi usando as mesmas referências
    this.app.stage.off('pointerdown', this.boundOnPointerDown);
    this.app.stage.off('pointermove', this.boundOnPointerMove);
    this.app.stage.off('pointerup', this.boundOnPointerUp);
  }
} 