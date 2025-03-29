import { GameStateManager, GameState } from '../game-state-manager';
import { VehicleManager } from '../../entities/vehicle-manager';
import { ProjectileManager } from '../../systems/projectile-manager';
import { TurnSystem } from '../../systems/turn-system';
import { AimingSystem } from '../../systems/aiming-system';
import { Physics } from '../../systems/physics';
import { Terrain } from '../../systems/terrain';
import { Vehicle, VehicleType } from '../../entities/vehicle';
import { CONFIG } from '../config';
import { IGameEventCoordinator } from '../events/game-event-coordinator';
import { GameSystems } from '../interfaces/game-systems';
import { EventEmitter, EventCallback } from '../../utils/event-emitter';

/**
 * Ações que o jogador pode realizar
 */
export enum PlayerAction {
  MOVE_LEFT = 'move_left',
  MOVE_RIGHT = 'move_right',
  INCREASE_ANGLE = 'increase_angle',
  DECREASE_ANGLE = 'decrease_angle',
  INCREASE_POWER = 'increase_power',
  DECREASE_POWER = 'decrease_power',
  FIRE = 'fire',
  END_TURN = 'end_turn'
}

/**
 * Tipos de eventos do controlador de lógica
 */
export enum LogicEventType {
  PLAYER_ACTION = 'player_action',
  VEHICLE_SELECTED = 'vehicle_selected',
  WIND_CHANGED = 'wind_changed',
  GAME_STARTED = 'game_started',
  GAME_RESTARTED = 'game_restarted'
}

/**
 * Interface para o controlador de lógica do jogo
 */
export interface IGameLogicController {
  /**
   * Inicializa o controlador de lógica
   * @param systems Sistemas do jogo
   */
  initialize(systems: GameSystems): void;
  
  /**
   * Inicia o jogo
   */
  startGame(): void;
  
  /**
   * Atualiza o controlador de lógica
   * @param delta Delta time
   */
  update(delta: number): void;
  
  /**
   * Trata uma ação do jogador
   * @param action Ação a ser executada
   */
  handlePlayerAction(action: PlayerAction): void;
  
  /**
   * Cria os veículos iniciais
   */
  createInitialVehicles(): void;
  
  /**
   * Atualiza o guia de mira
   */
  updateAimingGuide(): void;
  
  /**
   * Dispara um projétil
   */
  fire(): void;
  
  /**
   * Finaliza o turno atual
   */
  endTurn(): void;
  
  /**
   * Reinicia o jogo
   */
  restartGame(): void;
  
  /**
   * Registra um callback para um tipo de evento de lógica
   * @param eventType Tipo do evento
   * @param callback Função de callback
   */
  on(eventType: LogicEventType, callback: EventCallback): void;
  
  /**
   * Remove um callback registrado para um tipo de evento de lógica
   * @param eventType Tipo do evento
   * @param callback Função de callback a ser removida
   */
  off(eventType: LogicEventType, callback: EventCallback): void;
  
  /**
   * Libera recursos do controlador de lógica
   */
  dispose(): void;
}

/**
 * Implementação do controlador de lógica do jogo
 */
export class GameLogicController implements IGameLogicController {
  private eventEmitter: EventEmitter = new EventEmitter();
  private systems: GameSystems;
  private activeVehicleIndex: number = 0;
  private wind: number = 0;
  private initialized: boolean = false;
  
  /**
   * Cria uma nova instância do controlador de lógica
   * @param gameStateManager Gerenciador de estado do jogo
   * @param vehicleManager Gerenciador de veículos
   * @param projectileManager Gerenciador de projéteis
   * @param turnSystem Sistema de turnos
   * @param aimingSystem Sistema de mira
   * @param physics Sistema de física
   * @param terrain Sistema de terreno
   * @param eventCoordinator Coordenador de eventos
   */
  constructor(
    private gameStateManager: GameStateManager,
    private vehicleManager: VehicleManager,
    private projectileManager: ProjectileManager,
    private turnSystem: TurnSystem,
    private aimingSystem: AimingSystem,
    private physics: Physics,
    private terrain: Terrain,
    private eventCoordinator: IGameEventCoordinator
  ) {}
  
  /**
   * Inicializa o controlador de lógica
   * @param systems Sistemas do jogo
   */
  initialize(systems: GameSystems): void {
    if (this.initialized) return;
    
    this.systems = systems;
    this.initialized = true;
  }
  
  /**
   * Inicia o jogo
   */
  startGame(): void {
    this.gameStateManager.startGame();
    this.turnSystem.startNewTurn();
    this.eventEmitter.emit(LogicEventType.GAME_STARTED, {});
  }
  
  /**
   * Atualiza o controlador de lógica
   * @param delta Delta time
   */
  update(delta: number): void {
    // Atualização de lógica específica, se necessário
  }
  
  /**
   * Cria os veículos iniciais para cada jogador
   */
  createInitialVehicles(): void {
    // Encontra posições adequadas no terreno
    const positions = this.terrain.findSuitablePositions(2, 300);
    
    // Cria um veículo para o jogador 1
    if (positions.length > 0) {
      const vehicle1 = this.vehicleManager.createVehicle(
        VehicleType.DRAGON,
        positions[0].x,
        positions[0].y - 20, // Posiciona um pouco acima da superfície
        0 // Pertence ao jogador 0
      );
    }
    
    // Cria um veículo para o jogador 2
    if (positions.length > 1) {
      const vehicle2 = this.vehicleManager.createVehicle(
        VehicleType.ROBOT,
        positions[1].x,
        positions[1].y - 20,
        1 // Pertence ao jogador 1
      );
    }
  }
  
  /**
   * Trata uma ação do jogador
   * @param action Ação a ser executada
   */
  handlePlayerAction(action: PlayerAction): void {
    if (!this.gameStateManager.isPlaying() || !this.turnSystem.getIsPlayerTurn()) {
      return;
    }
    
    const activeVehicle = this.vehicleManager.getVehicleByIndex(this.activeVehicleIndex);
    if (!activeVehicle) return;
    
    // Emitir evento da ação do jogador
    this.eventEmitter.emit(LogicEventType.PLAYER_ACTION, {
      action,
      vehicle: activeVehicle
    });
    
    // Executar a ação
    switch (action) {
      case PlayerAction.MOVE_LEFT:
        activeVehicle.moveLeft();
        break;
      case PlayerAction.MOVE_RIGHT:
        activeVehicle.moveRight();
        break;
      case PlayerAction.INCREASE_ANGLE:
        this.aimingSystem.adjustAngle(5);
        break;
      case PlayerAction.DECREASE_ANGLE:
        this.aimingSystem.adjustAngle(-5);
        break;
      case PlayerAction.INCREASE_POWER:
        this.aimingSystem.adjustPower(5);
        break;
      case PlayerAction.DECREASE_POWER:
        this.aimingSystem.adjustPower(-5);
        break;
      case PlayerAction.FIRE:
        this.fire();
        break;
      case PlayerAction.END_TURN:
        this.endTurn();
        break;
    }
  }
  
  /**
   * Atualiza o guia de mira
   */
  updateAimingGuide(): void {
    const activeVehicle = this.vehicleManager.getVehicleByIndex(this.activeVehicleIndex);
    if (activeVehicle) {
      this.aimingSystem.updateAimingGuide(activeVehicle.position.x, activeVehicle.position.y);
    }
  }
  
  /**
   * Gera um novo valor de vento
   */
  generateWind(): void {
    this.wind = Math.random() * (CONFIG.PHYSICS.WIND_MAX - CONFIG.PHYSICS.WIND_MIN) + CONFIG.PHYSICS.WIND_MIN;
    
    // Emitir evento de mudança de vento
    this.eventEmitter.emit(LogicEventType.WIND_CHANGED, { wind: this.wind });
    
    // Atualizar o vento no sistema de mira
    this.aimingSystem.setWind(this.wind);
  }
  
  /**
   * Obtém o valor atual do vento
   * @returns Valor do vento
   */
  getWind(): number {
    return this.wind;
  }
  
  /**
   * Dispara um projétil
   */
  fire(): void {
    if (!this.gameStateManager.isPlaying()) return;
    
    const activeVehicle = this.vehicleManager.getVehicleByIndex(this.activeVehicleIndex);
    if (!activeVehicle) return;
    
    // Calcula o ângulo em radianos
    const angle = this.aimingSystem.getAngle() * Math.PI / 180;
    
    // Calcula o vetor de velocidade inicial
    const velocity = {
      x: Math.cos(angle) * this.aimingSystem.getPower() * 0.5,
      y: -Math.sin(angle) * this.aimingSystem.getPower() * 0.5
    };
    
    // Cria um novo projétil
    const projectile = activeVehicle.firePrimaryWeapon(velocity.x, velocity.y);
    if (!projectile) return;
    
    // Notifica outros sistemas (através de eventos)
    this.eventCoordinator.emit('projectile_fired', {
      projectile,
      vehicle: activeVehicle
    });
    
    // Adiciona o projétil ao gerenciador
    this.projectileManager.addProjectile(projectile);
    
    // Finaliza o turno após atirar
    this.endTurn();
  }
  
  /**
   * Finaliza o turno atual
   */
  endTurn(): void {
    this.turnSystem.forceEndTurn();
  }
  
  /**
   * Seleciona um veículo ativo baseado no índice do jogador
   * @param playerIndex Índice do jogador
   */
  selectVehicleByPlayerIndex(playerIndex: number): void {
    this.activeVehicleIndex = this.vehicleManager.getVehicleIndexByPlayer(playerIndex);
    
    // Emitir evento de seleção de veículo
    const activeVehicle = this.vehicleManager.getVehicleByIndex(this.activeVehicleIndex);
    if (activeVehicle) {
      this.eventEmitter.emit(LogicEventType.VEHICLE_SELECTED, {
        vehicle: activeVehicle,
        index: this.activeVehicleIndex,
        playerIndex
      });
    }
  }
  
  /**
   * Reinicia o jogo
   */
  restartGame(): void {
    // Limpa projéteis existentes
    this.projectileManager.clearAll();
    
    // Remove veículos existentes
    this.vehicleManager.clearAll();
    
    // Regenera o terreno
    this.terrain.generate();
    
    // Cria novos veículos
    this.createInitialVehicles();
    
    // Usa o gerenciador de estado para reiniciar o jogo
    this.gameStateManager.restartGame();
    
    // Inicia o primeiro turno
    this.turnSystem.startNewTurn();
    
    // Emitir evento de reinício de jogo
    this.eventEmitter.emit(LogicEventType.GAME_RESTARTED, {});
  }
  
  /**
   * Registra um callback para um tipo de evento de lógica
   * @param eventType Tipo do evento
   * @param callback Função de callback
   */
  on(eventType: LogicEventType, callback: EventCallback): void {
    this.eventEmitter.on(eventType, callback);
  }
  
  /**
   * Remove um callback registrado para um tipo de evento de lógica
   * @param eventType Tipo do evento
   * @param callback Função de callback a ser removida
   */
  off(eventType: LogicEventType, callback: EventCallback): void {
    this.eventEmitter.off(eventType, callback);
  }
  
  /**
   * Libera recursos do controlador de lógica
   */
  dispose(): void {
    this.eventEmitter.removeAllListeners();
  }
} 