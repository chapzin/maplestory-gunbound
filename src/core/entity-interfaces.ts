import * as PIXI from 'pixi.js';

/**
 * Tipos de entidades do jogo
 */
export enum EntityType {
  VEHICLE = 'vehicle',
  PROJECTILE = 'projectile',
  POWERUP = 'powerup',
  DECORATION = 'decoration'
}

/**
 * Interface base para todas as entidades do jogo
 */
export interface Entity {
  id: string;
  type: EntityType;
  container: PIXI.Container;
  position: { x: number, y: number };
  update(delta: number): void;
  dispose(): void;
}

/**
 * Interface para entidades com propriedades físicas (movimento, colisão)
 */
export interface PhysicsEntity extends Entity {
  velocity: { x: number, y: number };
  acceleration: { x: number, y: number };
  mass: number;
  applyForce(forceX: number, forceY: number): void;
  setVelocity(velocityX: number, velocityY: number): void;
  isStatic(): boolean;
}

/**
 * Interface para entidades que podem receber dano
 */
export interface DamageableEntity extends Entity {
  health: number;
  maxHealth: number;
  isDestroyed: boolean;
  takeDamage(amount: number): void;
  heal(amount: number): void;
  getHealthPercentage(): number;
}

/**
 * Interface para entidades que podem causar dano
 */
export interface OffensiveEntity extends Entity {
  damage: number;
  ownerIndex: number;
  damageRadius: number;
  getDamageAt(distance: number): number;
}

/**
 * Interface para entidades que pertencem a um jogador
 */
export interface PlayerOwnedEntity extends Entity {
  playerIndex: number;
  teamIndex: number;
  isSelectable: boolean;
  isSelected: boolean;
  select(): void;
  deselect(): void;
}

/**
 * Interface combinada para veículos
 */
export interface IVehicle extends PhysicsEntity, DamageableEntity, PlayerOwnedEntity {
  angle: number;
  power: number;
  isMoving: boolean;
  canShoot: boolean;
  name: string;
  setAngle(angle: number): void;
  setPower(power: number): void;
  shoot(): { x: number, y: number, velocityX: number, velocityY: number };
  endTurn(): void;
}

/**
 * Interface para projéteis
 */
export interface IProjectile extends PhysicsEntity, OffensiveEntity {
  timeToLive: number;
  hasExploded: boolean;
  explode(): void;
  isExpired(): boolean;
}

/**
 * Dados de eventos relacionados a entidades
 */
export interface EntityEventData {
  entity: Entity;
  type: EntityType;
  [key: string]: any; // Dados adicionais específicos de cada evento
} 