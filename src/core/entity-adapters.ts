import * as PIXI from 'pixi.js';
import { 
  Entity, 
  EntityType, 
  PhysicsEntity, 
  DamageableEntity, 
  OffensiveEntity, 
  PlayerOwnedEntity,
  IVehicle, 
  IProjectile 
} from './entity-interfaces';
import { Vehicle as OriginalVehicle, VehicleType } from '../entities/vehicle';
import { Projectile as OriginalProjectile } from '../systems/projectile';

/**
 * Fábrica para criar instâncias de entidades
 */
export class EntityFactory {
  /**
   * Cria um veículo adaptado que implementa IVehicle
   * @param type Tipo do veículo
   * @param x Posição X inicial
   * @param y Posição Y inicial
   * @param playerIndex Índice do jogador
   * @returns Veículo adaptado
   */
  static createVehicle(type: VehicleType, x: number, y: number, playerIndex: number): IVehicle {
    // Aqui precisaríamos da implementação original do Vehicle
    // Vamos assumir que ela está disponível e adaptá-la
    const originalVehicle = new OriginalVehicleAdapter(type, x, y, playerIndex);
    return originalVehicle;
  }

  /**
   * Cria um projétil adaptado que implementa IProjectile
   * @param x Posição X inicial
   * @param y Posição Y inicial
   * @param velocityX Velocidade X inicial
   * @param velocityY Velocidade Y inicial
   * @param ownerIndex Índice do jogador que atirou
   * @returns Projétil adaptado
   */
  static createProjectile(
    x: number, 
    y: number, 
    velocityX: number, 
    velocityY: number, 
    ownerIndex: number
  ): IProjectile {
    // Aqui precisaríamos da implementação original do Projectile
    // Vamos assumir que ela está disponível e adaptá-la
    const originalProjectile = new OriginalProjectileAdapter(x, y, velocityX, velocityY, ownerIndex);
    return originalProjectile;
  }
}

/**
 * Adaptador para a classe Vehicle original
 */
export class OriginalVehicleAdapter implements IVehicle {
  private originalVehicle: any; // Usando any como tipo temporário
  id: string = '';
  type: EntityType = EntityType.VEHICLE;
  container: PIXI.Container;
  position: { x: number, y: number };
  velocity: { x: number, y: number };
  acceleration: { x: number, y: number };
  mass: number;
  health: number;
  maxHealth: number;
  isDestroyed: boolean;
  playerIndex: number;
  teamIndex: number;
  isSelectable: boolean;
  isSelected: boolean;
  angle: number;
  power: number;
  isMoving: boolean;
  canShoot: boolean;
  name: string;

  constructor(type: VehicleType, x: number, y: number, playerIndex: number) {
    // Criamos a instância original
    this.originalVehicle = {}; // Na implementação real, aqui seria: new OriginalVehicle(type, x, y, playerIndex);
    
    // Inicializamos os campos adaptados
    this.container = new PIXI.Container();
    this.position = { x, y };
    this.velocity = { x: 0, y: 0 };
    this.acceleration = { x: 0, y: 0 };
    this.mass = 1;
    this.health = 100;
    this.maxHealth = 100;
    this.isDestroyed = false;
    this.playerIndex = playerIndex;
    this.teamIndex = playerIndex % 2;
    this.isSelectable = true;
    this.isSelected = false;
    this.angle = 45;
    this.power = 50;
    this.isMoving = false;
    this.canShoot = true;
    this.name = `Vehicle-${playerIndex}`;
  }

  update(delta: number): void {
    // Delega para o veículo original
    if (this.originalVehicle.update) {
      this.originalVehicle.update(delta);
    }
    
    // Sincroniza propriedades após a atualização
    this.syncFromOriginal();
  }

  dispose(): void {
    // Delega para o veículo original
    if (this.originalVehicle.dispose) {
      this.originalVehicle.dispose();
    }
    
    // Limpa recursos locais
    this.container.destroy({ children: true });
  }

  applyForce(forceX: number, forceY: number): void {
    // Implementação padrão se não disponível no original
    this.acceleration.x += forceX / this.mass;
    this.acceleration.y += forceY / this.mass;
  }

  setVelocity(velocityX: number, velocityY: number): void {
    this.velocity.x = velocityX;
    this.velocity.y = velocityY;
  }

  isStatic(): boolean {
    return !this.isMoving;
  }

  takeDamage(amount: number): void {
    // Delega para o veículo original se disponível
    if (this.originalVehicle.takeDamage) {
      this.originalVehicle.takeDamage(amount);
    } else {
      this.health = Math.max(0, this.health - amount);
      this.isDestroyed = this.health <= 0;
    }
    
    // Sincroniza propriedades após o dano
    this.syncFromOriginal();
  }

  heal(amount: number): void {
    this.health = Math.min(this.maxHealth, this.health + amount);
  }

  getHealthPercentage(): number {
    return (this.health / this.maxHealth) * 100;
  }

  select(): void {
    this.isSelected = true;
  }

  deselect(): void {
    this.isSelected = false;
  }

  setAngle(angle: number): void {
    this.angle = angle;
  }

  setPower(power: number): void {
    this.power = power;
  }

  shoot(): { x: number, y: number, velocityX: number, velocityY: number } {
    // Calcula as propriedades do projétil
    const radians = this.angle * (Math.PI / 180);
    const velocityX = Math.cos(radians) * this.power;
    const velocityY = -Math.sin(radians) * this.power;
    
    return {
      x: this.position.x,
      y: this.position.y - 10, // Ajuste para que o projétil saia do cano
      velocityX,
      velocityY
    };
  }

  endTurn(): void {
    this.canShoot = false;
  }

  private syncFromOriginal(): void {
    // Sincroniza propriedades do adaptador com o objeto original
    if (this.originalVehicle) {
      // Atualiza posição
      if (this.originalVehicle.x !== undefined && this.originalVehicle.y !== undefined) {
        this.position.x = this.originalVehicle.x;
        this.position.y = this.originalVehicle.y;
      }
      
      // Atualiza saúde
      if (this.originalVehicle.health !== undefined) {
        this.health = this.originalVehicle.health;
        this.isDestroyed = this.health <= 0;
      }
      
      // Outras propriedades relevantes...
    }
  }
}

/**
 * Adaptador para a classe Projectile original
 */
export class OriginalProjectileAdapter implements IProjectile {
  private originalProjectile: any; // Usando any como tipo temporário
  id: string = '';
  type: EntityType = EntityType.PROJECTILE;
  container: PIXI.Container;
  position: { x: number, y: number };
  velocity: { x: number, y: number };
  acceleration: { x: number, y: number };
  mass: number;
  damage: number;
  ownerIndex: number;
  damageRadius: number;
  timeToLive: number;
  hasExploded: boolean;

  constructor(x: number, y: number, velocityX: number, velocityY: number, ownerIndex: number) {
    // Criamos a instância original
    this.originalProjectile = {}; // Na implementação real, aqui seria: new OriginalProjectile(x, y, velocityX, velocityY, ownerIndex);
    
    // Inicializamos os campos adaptados
    this.container = new PIXI.Container();
    this.position = { x, y };
    this.velocity = { x: velocityX, y: velocityY };
    this.acceleration = { x: 0, y: 0.1 }; // Gravidade
    this.mass = 1;
    this.damage = 30;
    this.ownerIndex = ownerIndex;
    this.damageRadius = 30;
    this.timeToLive = 10000; // 10 segundos
    this.hasExploded = false;
  }

  update(delta: number): void {
    // Delega para o projétil original
    if (this.originalProjectile.update) {
      this.originalProjectile.update(delta);
    } else {
      // Implementação padrão se não disponível no original
      this.velocity.x += this.acceleration.x * delta;
      this.velocity.y += this.acceleration.y * delta;
      this.position.x += this.velocity.x * delta;
      this.position.y += this.velocity.y * delta;
      this.timeToLive -= delta;
    }
    
    // Sincroniza propriedades após a atualização
    this.syncFromOriginal();
  }

  dispose(): void {
    // Delega para o projétil original
    if (this.originalProjectile.dispose) {
      this.originalProjectile.dispose();
    }
    
    // Limpa recursos locais
    this.container.destroy({ children: true });
  }

  applyForce(forceX: number, forceY: number): void {
    // Implementação padrão
    this.acceleration.x += forceX / this.mass;
    this.acceleration.y += forceY / this.mass;
  }

  setVelocity(velocityX: number, velocityY: number): void {
    this.velocity.x = velocityX;
    this.velocity.y = velocityY;
  }

  isStatic(): boolean {
    return false;
  }

  getDamageAt(distance: number): number {
    // Cálculo simplificado de dano baseado na distância
    if (distance > this.damageRadius) {
      return 0;
    }
    
    // Dano é inversamente proporcional à distância
    return this.damage * (1 - distance / this.damageRadius);
  }

  explode(): void {
    this.hasExploded = true;
  }

  isExpired(): boolean {
    return this.timeToLive <= 0 || this.hasExploded;
  }

  private syncFromOriginal(): void {
    // Sincroniza propriedades do adaptador com o objeto original
    if (this.originalProjectile) {
      // Atualiza posição
      if (this.originalProjectile.x !== undefined && this.originalProjectile.y !== undefined) {
        this.position.x = this.originalProjectile.x;
        this.position.y = this.originalProjectile.y;
      }
      
      // Atualiza velocidade
      if (this.originalProjectile.velocityX !== undefined && this.originalProjectile.velocityY !== undefined) {
        this.velocity.x = this.originalProjectile.velocityX;
        this.velocity.y = this.originalProjectile.velocityY;
      }
      
      // Outras propriedades relevantes...
    }
  }
} 