import * as PIXI from 'pixi.js';

/**
 * Interface de vetor para posição e velocidade
 */
export interface Vector2D {
  x: number;
  y: number;
}

/**
 * Tipos de veículos disponíveis
 */
export enum VehicleType {
  DEFAULT = 'default',
  DRAGON = 'dragon',
  ROBOT = 'robot',
  TURTLE = 'turtle',
  BOAR = 'boar',
  KNIGHT = 'knight',
  INTERCEPTOR = 'interceptor',
  DEVASTATOR = 'devastator',
  DEFENDER = 'defender',
}

/**
 * Tipos de armas disponíveis
 */
export enum WeaponType {
  CANNON = 'cannon',
  LASER = 'laser',
  MISSILE = 'missile',
  BOMB = 'bomb',
  FIRE = 'fire',
  GUIDED_MISSILE = 'guided_missile',
  FRAG_BOMB = 'frag_bomb',
  FORCE_FIELD = 'force_field',
}

/**
 * Interface base para veículos (mobiles)
 */
export interface Vehicle {
  // Propriedades base
  id: number;
  name: string;
  type: VehicleType;
  health: number;
  maxHealth: number;
  playerId: number;
  
  // Propriedades físicas
  position: Vector2D;
  velocity: Vector2D;
  mass: number;
  isStatic: boolean;
  width: number;
  height: number;
  
  // Armas e estatísticas
  primaryWeapon: WeaponType;
  secondaryWeapon: WeaponType;
  specialAbilityCharge: number;
  maxSpecialAbilityCharge: number;
  
  // Propriedades visuais
  graphics: PIXI.DisplayObject;
  
  // Propriedades de jogabilidade
  movementPoints: number;
  maxMovementPoints: number;
  
  // Métodos
  update(deltaTime: number): void;
  render(): void;
  takeDamage(amount: number): void;
  heal(amount: number): void;
  moveLeft(): void;
  moveRight(): void;
  firePrimaryWeapon(velocityX: number, velocityY: number): any;
  fireSecondaryWeapon(velocityX: number, velocityY: number): any;
  useSpecialAbility(): boolean;
  chargeSpecialAbility(amount: number): void;
  resetMovementPoints(): void;
  isDestroyed(): boolean;
  destroy(): void;
} 