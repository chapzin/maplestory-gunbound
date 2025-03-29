import { EventEmitter } from 'eventemitter3';
import { EntityType } from './entity-interfaces';
import { Terrain } from '../systems/terrain';
import { 
  PhysicsEntity, 
  OffensiveEntity, 
  DamageableEntity, 
  PlayerOwnedEntity,
  IVehicle, 
  IProjectile 
} from './entity-interfaces';

/**
 * Tipos de eventos de colisão
 */
export enum CollisionEventType {
  PROJECTILE_TERRAIN = 'projectileTerrain',
  PROJECTILE_VEHICLE = 'projectileVehicle',
  PROJECTILE_BOUNDARY = 'projectileBoundary',
  VEHICLE_TERRAIN = 'vehicleTerrain',
  VEHICLE_VEHICLE = 'vehicleVehicle',
  VEHICLE_BOUNDARY = 'vehicleBoundary'
}

/**
 * Dados de eventos de colisão
 */
export interface CollisionEventData {
  type: CollisionEventType;
  entities: Array<PhysicsEntity | DamageableEntity | OffensiveEntity | PlayerOwnedEntity>;
  point?: { x: number, y: number };
  velocity?: { x: number, y: number };
  damage?: number;
}

/**
 * Limites do mundo do jogo
 */
export interface WorldBounds {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

/**
 * Classe responsável por gerenciar colisões no jogo
 */
export class CollisionManager extends EventEmitter {
  private terrain: Terrain;
  private worldBounds: WorldBounds;
  
  /**
   * Inicializa o gerenciador de colisões
   * @param terrain Sistema de terreno
   * @param worldBounds Limites do mundo do jogo
   */
  constructor(terrain: Terrain, worldBounds: WorldBounds) {
    super();
    this.terrain = terrain;
    this.worldBounds = worldBounds;
  }
  
  /**
   * Verifica colisões entre projéteis e veículos
   * @param projectiles Lista de projéteis
   * @param vehicles Lista de veículos
   */
  checkProjectileCollisions(projectiles: IProjectile[], vehicles: IVehicle[]): void {
    // Para cada projétil
    for (const projectile of projectiles) {
      // Verifica se está fora dos limites
      if (this.isOutOfBounds(projectile.position.x, projectile.position.y)) {
        this.emit(CollisionEventType.PROJECTILE_BOUNDARY, {
          type: CollisionEventType.PROJECTILE_BOUNDARY,
          entities: [projectile],
          point: { ...projectile.position }
        });
        continue;
      }
      
      // Verifica colisão com o terreno
      if (this.hasHitTerrain(projectile.position.x, projectile.position.y)) {
        this.emit(CollisionEventType.PROJECTILE_TERRAIN, {
          type: CollisionEventType.PROJECTILE_TERRAIN,
          entities: [projectile],
          point: { ...projectile.position }
        });
        continue;
      }
      
      // Verifica colisão com veículos
      for (const vehicle of vehicles) {
        // Ignora veículos do mesmo jogador
        if (vehicle.playerIndex === projectile.ownerIndex) {
          continue;
        }
        
        // Verifica colisão com o veículo
        if (this.checkCircleCollision(
          projectile.position.x, projectile.position.y, 5,
          vehicle.position.x, vehicle.position.y, 20
        )) {
          // Calcula o dano baseado na velocidade do projétil
          const velocity = Math.sqrt(
            projectile.velocity.x * projectile.velocity.x +
            projectile.velocity.y * projectile.velocity.y
          );
          const damage = Math.floor(velocity * 10); // Fórmula simples para dano
          
          // Emite evento de colisão
          this.emit(CollisionEventType.PROJECTILE_VEHICLE, {
            type: CollisionEventType.PROJECTILE_VEHICLE,
            entities: [projectile, vehicle],
            point: { ...projectile.position },
            velocity: { ...projectile.velocity },
            damage
          });
          break;
        }
      }
    }
  }
  
  /**
   * Verifica colisões entre veículos e o terreno
   * @param vehicles Lista de veículos
   */
  checkVehicleTerrainCollisions(vehicles: IVehicle[]): void {
    for (const vehicle of vehicles) {
      // Verifica se está fora dos limites
      if (this.isOutOfBounds(vehicle.position.x, vehicle.position.y)) {
        this.emit(CollisionEventType.VEHICLE_BOUNDARY, {
          type: CollisionEventType.VEHICLE_BOUNDARY,
          entities: [vehicle],
          point: { ...vehicle.position }
        });
        continue;
      }
      
      // Verifica colisão com o terreno
      if (this.hasHitTerrain(vehicle.position.x, vehicle.position.y + 20)) {
        this.emit(CollisionEventType.VEHICLE_TERRAIN, {
          type: CollisionEventType.VEHICLE_TERRAIN,
          entities: [vehicle],
          point: { 
            x: vehicle.position.x, 
            y: this.terrain.getHeightAt(vehicle.position.x)
          }
        });
      }
    }
  }
  
  /**
   * Verifica colisões entre veículos
   * @param vehicles Lista de veículos
   */
  checkVehicleVehicleCollisions(vehicles: IVehicle[]): void {
    // Verifica para cada par de veículos
    for (let i = 0; i < vehicles.length; i++) {
      const vehicleA = vehicles[i];
      
      for (let j = i + 1; j < vehicles.length; j++) {
        const vehicleB = vehicles[j];
        
        // Verifica colisão entre os veículos
        if (this.checkCircleCollision(
          vehicleA.position.x, vehicleA.position.y, 20,
          vehicleB.position.x, vehicleB.position.y, 20
        )) {
          this.emit(CollisionEventType.VEHICLE_VEHICLE, {
            type: CollisionEventType.VEHICLE_VEHICLE,
            entities: [vehicleA, vehicleB],
            point: {
              x: (vehicleA.position.x + vehicleB.position.x) / 2,
              y: (vehicleA.position.y + vehicleB.position.y) / 2
            }
          });
        }
      }
    }
  }
  
  /**
   * Executa todas as verificações de colisão
   * @param projectiles Lista de projéteis
   * @param vehicles Lista de veículos
   */
  checkAllCollisions(projectiles: IProjectile[], vehicles: IVehicle[]): void {
    this.checkProjectileCollisions(projectiles, vehicles);
    this.checkVehicleTerrainCollisions(vehicles);
    this.checkVehicleVehicleCollisions(vehicles);
  }
  
  /**
   * Verifica se uma posição está fora dos limites do mundo
   * @param x Coordenada X
   * @param y Coordenada Y
   * @returns Verdadeiro se estiver fora dos limites
   */
  isOutOfBounds(x: number, y: number): boolean {
    return (
      x < this.worldBounds.left ||
      x > this.worldBounds.right ||
      y < this.worldBounds.top ||
      y > this.worldBounds.bottom
    );
  }
  
  /**
   * Verifica se uma posição colidiu com o terreno
   * @param x Coordenada X
   * @param y Coordenada Y
   * @returns Verdadeiro se colidiu com o terreno
   */
  hasHitTerrain(x: number, y: number): boolean {
    const terrainHeight = this.terrain.getHeightAt(x);
    return y >= terrainHeight;
  }
  
  /**
   * Verifica colisão entre dois círculos
   * @param x1 Coordenada X do primeiro círculo
   * @param y1 Coordenada Y do primeiro círculo
   * @param r1 Raio do primeiro círculo
   * @param x2 Coordenada X do segundo círculo
   * @param y2 Coordenada Y do segundo círculo
   * @param r2 Raio do segundo círculo
   * @returns Verdadeiro se houver colisão
   */
  checkCircleCollision(
    x1: number, y1: number, r1: number,
    x2: number, y2: number, r2: number
  ): boolean {
    const dx = x1 - x2;
    const dy = y1 - y2;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    return distance < (r1 + r2);
  }
  
  /**
   * Define novos limites para o mundo
   * @param bounds Novos limites
   */
  setWorldBounds(bounds: WorldBounds): void {
    this.worldBounds = { ...bounds };
  }
  
  /**
   * Obtém os limites atuais do mundo
   * @returns Limites do mundo
   */
  getWorldBounds(): WorldBounds {
    return { ...this.worldBounds };
  }
  
  /**
   * Libera recursos do gerenciador
   */
  dispose(): void {
    this.removeAllListeners();
  }
} 