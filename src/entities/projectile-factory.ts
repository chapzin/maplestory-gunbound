import * as PIXI from 'pixi.js';
import { Projectile } from './projectile';
import { FragProjectile } from './frag-projectile';
import { GuidedProjectile } from './guided-projectile';
import { PhysicsSystem } from '../systems/physics-adapter';
import { WeaponType } from './vehicles/types';

/**
 * Tipos de projéteis suportados pelo sistema
 */
export enum ProjectileType {
  STANDARD = 'standard',
  FRAGMENTATION = 'fragmentation',
  GUIDED = 'guided'
}

/**
 * Opções para criação de projéteis
 */
export interface ProjectileOptions {
  container: PIXI.Container;
  x: number;
  y: number;
  velocityX?: number;       // Opção de entrada compatível com veículos existentes
  velocityY?: number;       // Opção de entrada compatível com veículos existentes
  angle?: number;           // Alternativa: ângulo em radianos
  power?: number;           // Alternativa: potência do disparo
  weaponType: WeaponType;   // Tipo de arma que disparou o projétil
  physicsSystem: PhysicsSystem;
  
  // Identificação do projétil
  sourceId?: number;        // ID da entidade que disparou o projétil
  playerId?: number;        // ID do jogador que controla a entidade
  
  // Opções específicas para projéteis de fragmentação
  fragmentCount?: number;
  fragmentDamage?: number;
  fragmentSpread?: number;  // Dispersão dos fragmentos
  explosionRadius?: number; // Raio da explosão
  
  // Opções específicas para projéteis guiados
  guidanceStrength?: number;
  target?: any;
  targetX?: number;         // Coordenada X do alvo
  targetY?: number;         // Coordenada Y do alvo
}

/**
 * Fábrica de projéteis - Converte opções em instâncias concretas de projéteis
 * 
 * Suporta dois métodos de entrada:
 * 1. velocityX/velocityY para compatibilidade com a interface de Veículos
 * 2. angle/power para usos mais diretos
 */
export class ProjectileFactory {
  private static instance: ProjectileFactory;
  
  /**
   * Obtém a instância singleton da fábrica
   */
  public static getInstance(): ProjectileFactory {
    if (!ProjectileFactory.instance) {
      ProjectileFactory.instance = new ProjectileFactory();
    }
    return ProjectileFactory.instance;
  }
  
  /**
   * Construtor privado (padrão singleton)
   */
  private constructor() {}
  
  /**
   * Cria um projétil com base nas opções fornecidas
   * Converte automaticamente entre velocidade e ângulo/potência conforme necessário
   * @param options Opções de criação do projétil
   */
  public createProjectile(options: ProjectileOptions): Projectile {
    let angle: number;
    let power: number;
    
    // Determina o ângulo e a potência, seja a partir de velocidade ou diretamente
    if (options.velocityX !== undefined && options.velocityY !== undefined) {
      // Converte velocidade XY para ângulo e potência
      angle = Math.atan2(options.velocityY, options.velocityX);
      power = Math.sqrt(options.velocityX * options.velocityX + options.velocityY * options.velocityY) * 100;
    } else if (options.angle !== undefined && options.power !== undefined) {
      // Usa valores fornecidos diretamente
      angle = options.angle;
      power = options.power;
    } else {
      // Caso não tenham sido fornecidos nem velocidade nem ângulo/potência
      throw new Error('Deve fornecer velocityX/velocityY ou angle/power para criar um projétil');
    }
    
    // Cria o tipo apropriado de projétil com base no tipo de arma
    switch (options.weaponType) {
      case WeaponType.BOMB:
      case WeaponType.FRAG_BOMB:
        return this.createFragmentationProjectile(
          options.container,
          options.x,
          options.y,
          angle,
          power,
          options.physicsSystem,
          options.fragmentCount,
          options.fragmentDamage
        );
      
      case WeaponType.GUIDED_MISSILE:
        return this.createGuidedProjectile(
          options.container,
          options.x,
          options.y,
          angle,
          power,
          options.physicsSystem,
          options.guidanceStrength
        );
      
      case WeaponType.CANNON:
      case WeaponType.LASER:
      case WeaponType.MISSILE:
      case WeaponType.FIRE:
      default:
        return this.createStandardProjectile(
          options.container,
          options.x,
          options.y,
          angle,
          power,
          options.physicsSystem
        );
    }
  }
  
  /**
   * Cria um projétil padrão
   */
  private createStandardProjectile(
    container: PIXI.Container,
    startX: number,
    startY: number,
    angle: number,
    power: number,
    physicsSystem: PhysicsSystem
  ): Projectile {
    // Cria e retorna o projétil padrão
    return new Projectile(
      container,
      startX,
      startY,
      angle,
      power,
      physicsSystem
    );
  }
  
  /**
   * Cria um projétil de fragmentação
   */
  private createFragmentationProjectile(
    container: PIXI.Container,
    startX: number,
    startY: number,
    angle: number,
    power: number,
    physicsSystem: PhysicsSystem,
    fragmentCount: number = 8,
    fragmentDamage: number = 15
  ): FragProjectile {
    return new FragProjectile(
      container,
      startX,
      startY,
      angle,
      power,
      physicsSystem,
      fragmentCount,
      fragmentDamage
    );
  }
  
  /**
   * Cria um projétil teleguiado
   */
  private createGuidedProjectile(
    container: PIXI.Container,
    startX: number,
    startY: number,
    angle: number,
    power: number,
    physicsSystem: PhysicsSystem,
    guidanceStrength: number = 0.1
  ): GuidedProjectile {
    return new GuidedProjectile(
      container,
      startX,
      startY,
      angle,
      power,
      physicsSystem,
      guidanceStrength,
      null  // Target será definido depois
    );
  }
} 