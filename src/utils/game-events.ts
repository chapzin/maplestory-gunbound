/**
 * Enumeração de todos os tipos de eventos do jogo
 * Centraliza todos os nomes de eventos para evitar strings duplicadas
 * e facilitar o autocompletar no IDE
 */
export enum GameEventType {
  // Eventos relacionados ao ciclo do jogo
  GAME_STARTED = 'gameStarted',
  GAME_PAUSED = 'gamePaused',
  GAME_RESUMED = 'gameResumed',
  GAME_ENDED = 'gameEnded',
  
  // Eventos relacionados aos turnos
  TURN_STARTED = 'turnStarted',
  TURN_ENDED = 'turnEnded',
  TURN_TIMEOUT = 'turnTimeout',
  
  // Eventos relacionados aos veículos
  VEHICLE_SPAWNED = 'vehicleSpawned',
  VEHICLE_MOVED = 'vehicleMoved',
  VEHICLE_DAMAGED = 'vehicleDamaged',
  VEHICLE_DESTROYED = 'vehicleDestroyed',
  VEHICLE_SELECTED = 'vehicleSelected',
  
  // Eventos relacionados aos projéteis
  PROJECTILE_FIRED = 'projectileFired',
  PROJECTILE_MOVED = 'projectileMoved',
  PROJECTILE_IMPACT = 'projectileImpact',
  
  // Eventos relacionados ao terreno
  TERRAIN_DEFORMED = 'terrainDeformed',
  
  // Eventos relacionados aos itens
  ITEM_SPAWNED = 'itemSpawned',
  ITEM_COLLECTED = 'itemCollected',
  
  // Eventos relacionados ao clima
  WEATHER_CHANGED = 'weatherChanged',
  WIND_CHANGED = 'windChanged',
  
  // Eventos relacionados ao multiplayer
  PLAYER_JOINED = 'playerJoined',
  PLAYER_LEFT = 'playerLeft',
  PLAYER_READY = 'playerReady',
  
  // Eventos relacionados à UI
  UI_ELEMENT_CLICKED = 'uiElementClicked',
  UI_VALUE_CHANGED = 'uiValueChanged',
  
  // Eventos relacionados ao benchmark
  BENCHMARK_STARTED = 'benchmarkStarted',
  BENCHMARK_ENDED = 'benchmarkEnded',
  PERFORMANCE_REPORT = 'performanceReport'
}

/**
 * Interface base para todos os payloads de eventos
 */
export interface GameEventPayload {
  timestamp: number;
}

/**
 * Payload para eventos relacionados ao ciclo do jogo
 */
export interface GameStatePayload extends GameEventPayload {
  gameId: string;
  players: number[];
}

/**
 * Payload para eventos relacionados aos turnos
 */
export interface TurnPayload extends GameEventPayload {
  turnNumber: number;
  playerId: number;
  timeRemaining: number;
}

/**
 * Payload para eventos relacionados aos veículos
 */
export interface VehiclePayload extends GameEventPayload {
  vehicleId: number;
  type: string;
  playerId: number;
  position: { x: number, y: number };
  health?: number;
  maxHealth?: number;
}

/**
 * Payload para eventos relacionados aos danos
 */
export interface DamagePayload extends GameEventPayload {
  targetId: number;
  sourceId?: number;
  damageAmount: number;
  damageType: string;
  newHealth: number;
}

/**
 * Payload para eventos relacionados aos projéteis
 */
export interface ProjectilePayload extends GameEventPayload {
  projectileId: string;
  sourceVehicleId: number;
  type: string;
  position: { x: number, y: number };
  velocity: { x: number, y: number };
  angle?: number;
  power?: number;
  damage?: number;
}

/**
 * Payload para eventos relacionados ao impacto de projéteis
 */
export interface ProjectileImpactPayload extends GameEventPayload {
  projectileId: string;
  position: { x: number, y: number };
  radius: number;
  damage: number;
  affectedEntities: Array<{
    entityId: number,
    entityType: string,
    damageAmount: number
  }>;
}

/**
 * Payload para eventos relacionados à deformação do terreno
 */
export interface TerrainDeformationPayload extends GameEventPayload {
  position: { x: number, y: number };
  radius: number;
  depth: number;
  isFill: boolean;
}

/**
 * Payload para eventos relacionados ao clima
 */
export interface WeatherPayload extends GameEventPayload {
  type: string;
  intensity: number;
  duration: number;
}

/**
 * Payload para eventos relacionados ao vento
 */
export interface WindPayload extends GameEventPayload {
  direction: number; // ângulo em graus
  force: number; // 0-10
}

/**
 * Payload para eventos relacionados aos jogadores
 */
export interface PlayerPayload extends GameEventPayload {
  playerId: number;
  name: string;
  team?: number;
}

/**
 * Payload para eventos relacionados à UI
 */
export interface UIEventPayload extends GameEventPayload {
  elementId: string;
  elementType: string;
  value?: any;
}

/**
 * Payload para eventos relacionados ao benchmark
 */
export interface BenchmarkPayload extends GameEventPayload {
  scenarioName: string;
  duration?: number;
  averageFps?: number;
  minFps?: number;
  maxFps?: number;
  targetFps?: number;
  averageRenderTime?: number;
  averageMemoryUsage?: number;
  comparisonPercent?: number;
}

/**
 * Classe auxiliar para criar payloads de eventos com facilidade
 */
export class EventPayloadFactory {
  /**
   * Cria um payload base com timestamp
   */
  static createBasePayload(): GameEventPayload {
    return {
      timestamp: Date.now()
    };
  }
  
  /**
   * Cria um payload para evento de veículo
   */
  static createVehiclePayload(
    vehicleId: number,
    type: string,
    playerId: number,
    position: { x: number, y: number },
    health?: number,
    maxHealth?: number
  ): VehiclePayload {
    return {
      ...this.createBasePayload(),
      vehicleId,
      type,
      playerId,
      position,
      health,
      maxHealth
    };
  }
  
  /**
   * Cria um payload para evento de projétil
   */
  static createProjectilePayload(
    projectileId: string,
    sourceVehicleId: number,
    type: string,
    position: { x: number, y: number },
    velocity: { x: number, y: number },
    angle?: number,
    power?: number,
    damage?: number
  ): ProjectilePayload {
    return {
      ...this.createBasePayload(),
      projectileId,
      sourceVehicleId,
      type,
      position,
      velocity,
      angle,
      power,
      damage
    };
  }
  
  /**
   * Cria um payload para evento de dano
   */
  static createDamagePayload(
    targetId: number,
    damageAmount: number,
    damageType: string,
    newHealth: number,
    sourceId?: number
  ): DamagePayload {
    return {
      ...this.createBasePayload(),
      targetId,
      sourceId,
      damageAmount,
      damageType,
      newHealth
    };
  }
} 