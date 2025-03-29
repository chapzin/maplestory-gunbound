import * as PIXI from 'pixi.js';
import { EventEmitter } from 'eventemitter3';
import { Physics } from '../systems/physics';
import { VehicleType } from '../entities/vehicle';
import { Terrain } from '../systems/terrain';
import { 
  Entity, 
  EntityType, 
  EntityEventData,
  PhysicsEntity,
  DamageableEntity,
  OffensiveEntity,
  PlayerOwnedEntity,
  IVehicle,
  IProjectile
} from './entity-interfaces';
import { EntityFactory } from './entity-adapters';

/**
 * Tipos de eventos emitidos pelo EntityManager
 */
export enum EntityEventType {
  ENTITY_ADDED = 'entityAdded',
  ENTITY_REMOVED = 'entityRemoved',
  ENTITY_UPDATED = 'entityUpdated',
  VEHICLE_DAMAGED = 'vehicleDamaged',
  VEHICLE_DESTROYED = 'vehicleDestroyed',
  PROJECTILE_IMPACT = 'projectileImpact'
}

/**
 * Classe responsável por gerenciar todas as entidades do jogo
 */
export class EntityManager extends EventEmitter {
  private entities: Map<string, Entity> = new Map();
  private vehicles: Map<string, IVehicle> = new Map();
  private projectiles: Map<string, IProjectile> = new Map();
  
  private physics: Physics;
  private terrain: Terrain;
  private vehicleContainer: PIXI.Container;
  private projectileContainer: PIXI.Container;
  
  private nextEntityId: number = 0;
  
  /**
   * Inicializa o gerenciador de entidades
   * @param physics Sistema de física
   * @param terrain Sistema de terreno
   * @param vehicleContainer Container para veículos
   * @param projectileContainer Container para projéteis
   */
  constructor(
    physics: Physics,
    terrain: Terrain,
    vehicleContainer: PIXI.Container,
    projectileContainer: PIXI.Container
  ) {
    super();
    this.physics = physics;
    this.terrain = terrain;
    this.vehicleContainer = vehicleContainer;
    this.projectileContainer = projectileContainer;
  }
  
  /**
   * Gera um ID único para entidades
   * @returns ID único para uma entidade
   */
  private generateId(): string {
    return `entity_${this.nextEntityId++}`;
  }
  
  /**
   * Adiciona uma entidade ao gerenciador
   * @param entity Entidade a ser adicionada
   * @returns A entidade adicionada
   */
  addEntity(entity: Entity): Entity {
    this.entities.set(entity.id, entity);
    
    // Adiciona à coleção específica baseada no tipo
    if (entity.type === EntityType.VEHICLE && this.isDamageableEntity(entity) && this.isPlayerOwnedEntity(entity)) {
      this.vehicles.set(entity.id, entity as IVehicle);
    } else if (entity.type === EntityType.PROJECTILE && this.isPhysicsEntity(entity) && this.isOffensiveEntity(entity)) {
      this.projectiles.set(entity.id, entity as IProjectile);
    }
    
    // Emite evento de entidade adicionada
    this.emit(EntityEventType.ENTITY_ADDED, {
      entity,
      type: entity.type
    });
    
    return entity;
  }
  
  /**
   * Verifica se uma entidade implementa a interface DamageableEntity
   */
  private isDamageableEntity(entity: Entity): entity is DamageableEntity {
    return 'health' in entity && 'takeDamage' in entity;
  }
  
  /**
   * Verifica se uma entidade implementa a interface PlayerOwnedEntity
   */
  private isPlayerOwnedEntity(entity: Entity): entity is PlayerOwnedEntity {
    return 'playerIndex' in entity;
  }
  
  /**
   * Verifica se uma entidade implementa a interface PhysicsEntity
   */
  private isPhysicsEntity(entity: Entity): entity is PhysicsEntity {
    return 'velocity' in entity && 'applyForce' in entity;
  }
  
  /**
   * Verifica se uma entidade implementa a interface OffensiveEntity
   */
  private isOffensiveEntity(entity: Entity): entity is OffensiveEntity {
    return 'damage' in entity && 'ownerIndex' in entity;
  }
  
  /**
   * Remove uma entidade do gerenciador
   * @param entityId ID da entidade a ser removida
   */
  removeEntity(entityId: string): void {
    const entity = this.entities.get(entityId);
    
    if (!entity) {
      return;
    }
    
    // Remove das coleções específicas
    if (entity.type === EntityType.VEHICLE) {
      this.vehicles.delete(entityId);
    } else if (entity.type === EntityType.PROJECTILE) {
      this.projectiles.delete(entityId);
    }
    
    // Libera recursos da entidade
    entity.dispose();
    
    // Remove da coleção principal
    this.entities.delete(entityId);
    
    // Emite evento de entidade removida
    this.emit(EntityEventType.ENTITY_REMOVED, {
      entity,
      type: entity.type
    });
  }
  
  /**
   * Obtém uma entidade pelo ID
   * @param entityId ID da entidade
   * @returns A entidade ou undefined se não encontrada
   */
  getEntity(entityId: string): Entity | undefined {
    return this.entities.get(entityId);
  }
  
  /**
   * Cria um novo veículo
   * @param type Tipo do veículo
   * @param x Posição X inicial
   * @param y Posição Y inicial
   * @param playerIndex Índice do jogador proprietário
   * @returns O veículo criado
   */
  createVehicle(type: VehicleType, x: number, y: number, playerIndex: number): IVehicle {
    // Cria um novo veículo usando a fábrica
    const vehicle = EntityFactory.createVehicle(type, x, y, playerIndex);
    
    // Configura propriedades da entidade
    vehicle.id = this.generateId();
    vehicle.type = EntityType.VEHICLE;
    
    // Adiciona ao container gráfico
    this.vehicleContainer.addChild(vehicle.container);
    
    // Adiciona ao gerenciador
    this.addEntity(vehicle);
    
    return vehicle;
  }
  
  /**
   * Cria um novo projétil
   * @param x Posição X inicial
   * @param y Posição Y inicial
   * @param velocityX Velocidade X inicial
   * @param velocityY Velocidade Y inicial
   * @param ownerIndex Índice do jogador que atirou
   * @returns O projétil criado
   */
  createProjectile(
    x: number,
    y: number,
    velocityX: number,
    velocityY: number,
    ownerIndex: number
  ): IProjectile {
    // Cria um novo projétil usando a fábrica
    const projectile = EntityFactory.createProjectile(
      x, y, velocityX, velocityY, ownerIndex
    );
    
    // Configura propriedades da entidade
    projectile.id = this.generateId();
    projectile.type = EntityType.PROJECTILE;
    
    // Adiciona ao container gráfico
    this.projectileContainer.addChild(projectile.container);
    
    // Adiciona ao gerenciador
    this.addEntity(projectile);
    
    return projectile;
  }
  
  /**
   * Aplica dano a um veículo
   * @param vehicleId ID do veículo
   * @param damage Quantidade de dano
   * @returns Verdadeiro se o veículo foi destruído
   */
  damageVehicle(vehicleId: string, damage: number): boolean {
    const vehicle = this.vehicles.get(vehicleId);
    
    if (!vehicle) {
      return false;
    }
    
    // Aplica o dano ao veículo
    vehicle.takeDamage(damage);
    
    // Emite evento de dano
    this.emit(EntityEventType.VEHICLE_DAMAGED, {
      entity: vehicle,
      type: EntityType.VEHICLE,
      damage,
      remainingHealth: vehicle.health
    });
    
    // Verifica se o veículo foi destruído
    if (vehicle.health <= 0) {
      // Emite evento de destruição
      this.emit(EntityEventType.VEHICLE_DESTROYED, {
        entity: vehicle,
        type: EntityType.VEHICLE,
        playerIndex: vehicle.playerIndex
      });
      
      // Remove o veículo
      this.removeEntity(vehicleId);
      return true;
    }
    
    return false;
  }
  
  /**
   * Verifica colisões entre projéteis e veículos
   */
  checkCollisions(): void {
    // Para cada projétil
    for (const [projectileId, projectile] of this.projectiles.entries()) {
      // Verifica se o projétil está em uma posição válida
      if (this.isOutOfBounds(projectile) || this.hasHitTerrain(projectile)) {
        // Emite evento de impacto
        this.emit(EntityEventType.PROJECTILE_IMPACT, {
          entity: projectile,
          type: EntityType.PROJECTILE,
          hitTerrainOrBounds: true
        });
        
        // Remove o projétil
        this.removeEntity(projectileId);
        continue;
      }
      
      // Verifica colisão com cada veículo
      for (const [vehicleId, vehicle] of this.vehicles.entries()) {
        // Ignora veículos do mesmo jogador
        if (vehicle.playerIndex === projectile.ownerIndex) {
          continue;
        }
        
        // Verifica colisão com o veículo
        if (this.checkEntityCollision(projectile, vehicle)) {
          // Calcula o dano baseado na velocidade
          const velocity = Math.sqrt(
            projectile.velocity.x * projectile.velocity.x +
            projectile.velocity.y * projectile.velocity.y
          );
          const damage = Math.floor(velocity * 10); // Fórmula simples para dano
          
          // Aplica dano ao veículo
          this.damageVehicle(vehicleId, damage);
          
          // Emite evento de impacto
          this.emit(EntityEventType.PROJECTILE_IMPACT, {
            entity: projectile,
            type: EntityType.PROJECTILE,
            hitEntity: vehicle,
            damage
          });
          
          // Remove o projétil
          this.removeEntity(projectileId);
          break;
        }
      }
    }
  }
  
  /**
   * Verifica se uma entidade está fora dos limites do jogo
   * @param entity Entidade a verificar
   * @returns Verdadeiro se estiver fora dos limites
   */
  private isOutOfBounds(entity: Entity): boolean {
    // Aqui usaríamos os limites da tela ou do mundo do jogo
    // Por simplicidade, definimos limites fixos
    const worldBounds = {
      left: -100,
      right: 1100,
      top: -100,
      bottom: 700
    };
    
    return (
      entity.position.x < worldBounds.left ||
      entity.position.x > worldBounds.right ||
      entity.position.y < worldBounds.top ||
      entity.position.y > worldBounds.bottom
    );
  }
  
  /**
   * Verifica se uma entidade colidiu com o terreno
   * @param entity Entidade a verificar
   * @returns Verdadeiro se colidiu com o terreno
   */
  private hasHitTerrain(entity: Entity): boolean {
    // Verificação aproximada usando a altura do terreno
    const terrainHeight = this.terrain.getHeightAt(entity.position.x);
    return entity.position.y >= terrainHeight;
  }
  
  /**
   * Verifica colisão entre duas entidades
   * @param entityA Primeira entidade
   * @param entityB Segunda entidade
   * @returns Verdadeiro se houve colisão
   */
  private checkEntityCollision(entityA: Entity, entityB: Entity): boolean {
    // Implementação simples usando distância entre centros
    // Em um jogo real, usaríamos caixas de colisão ou outra técnica mais precisa
    const dx = entityA.position.x - entityB.position.x;
    const dy = entityA.position.y - entityB.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Para simplificar, usamos um raio fixo para cada tipo de entidade
    const radiusA = entityA.type === EntityType.PROJECTILE ? 5 : 20;
    const radiusB = entityB.type === EntityType.PROJECTILE ? 5 : 20;
    
    return distance < (radiusA + radiusB);
  }
  
  /**
   * Obtém todos os veículos de um jogador
   * @param playerIndex Índice do jogador
   * @returns Array de veículos
   */
  getVehiclesByPlayer(playerIndex: number): IVehicle[] {
    const playerVehicles: IVehicle[] = [];
    
    for (const vehicle of this.vehicles.values()) {
      if (vehicle.playerIndex === playerIndex) {
        playerVehicles.push(vehicle);
      }
    }
    
    return playerVehicles;
  }
  
  /**
   * Obtém a contagem de veículos por jogador
   * @param playerIndex Índice do jogador
   * @returns Número de veículos
   */
  getVehicleCountByPlayer(playerIndex: number): number {
    return this.getVehiclesByPlayer(playerIndex).length;
  }
  
  /**
   * Obtém o veículo na posição indicada da lista de veículos
   * @param index Índice na lista de veículos
   * @returns Veículo ou undefined se não encontrado
   */
  getVehicleByIndex(index: number): IVehicle | undefined {
    const vehicles = Array.from(this.vehicles.values());
    return index >= 0 && index < vehicles.length ? vehicles[index] : undefined;
  }
  
  /**
   * Obtém o índice do primeiro veículo de um jogador
   * @param playerIndex Índice do jogador
   * @returns Índice do veículo ou -1 se não encontrado
   */
  getVehicleIndexByPlayer(playerIndex: number): number {
    const vehicles = Array.from(this.vehicles.values());
    return vehicles.findIndex(v => v.playerIndex === playerIndex);
  }
  
  /**
   * Atualiza todas as entidades
   * @param delta Delta time
   */
  update(delta: number): void {
    // Atualiza todas as entidades
    for (const entity of this.entities.values()) {
      entity.update(delta);
      
      // Emite evento de atualização
      this.emit(EntityEventType.ENTITY_UPDATED, {
        entity,
        type: entity.type,
        delta
      });
    }
    
    // Verifica colisões
    this.checkCollisions();
  }
  
  /**
   * Remove todas as entidades
   */
  clearAll(): void {
    // Cria uma cópia das chaves para evitar problemas ao modificar durante iteração
    const entityIds = Array.from(this.entities.keys());
    
    // Remove cada entidade
    for (const id of entityIds) {
      this.removeEntity(id);
    }
  }
  
  /**
   * Limpa os recursos do gerenciador
   */
  dispose(): void {
    this.clearAll();
    this.removeAllListeners();
  }
} 