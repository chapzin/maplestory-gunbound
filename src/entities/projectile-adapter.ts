import * as PIXI from 'pixi.js';
import { Projectile } from './projectile';
import { ProjectileFactory } from './projectile-factory';
import { WeaponType } from './vehicles/types';
import { PhysicsSystem } from '../systems/physics-adapter';

/**
 * Adaptador para criar projéteis a partir do sistema de veículos
 * 
 * Este adaptador serve como uma ponte entre o sistema legado de veículos
 * e o novo sistema de criação de projéteis usando a fábrica de projéteis.
 */
export class ProjectileAdapter {
  private static instance: ProjectileAdapter;
  private projectileFactory: ProjectileFactory;
  
  /**
   * Obtém a instância singleton do adaptador
   */
  public static getInstance(): ProjectileAdapter {
    if (!ProjectileAdapter.instance) {
      ProjectileAdapter.instance = new ProjectileAdapter();
    }
    return ProjectileAdapter.instance;
  }
  
  /**
   * Construtor privado (padrão singleton)
   */
  private constructor() {
    this.projectileFactory = ProjectileFactory.getInstance();
  }
  
  /**
   * Cria um projétil a partir dos parâmetros do método fireWeapon do veículo
   * 
   * @param container Container gráfico para adicionar o projétil
   * @param x Posição inicial X
   * @param y Posição inicial Y
   * @param velocityX Velocidade X do projétil
   * @param velocityY Velocidade Y do projétil
   * @param weaponType Tipo de arma que disparou o projétil
   * @param physicsSystem Sistema de física
   * @param options Opções adicionais para configuração do projétil
   * @returns O projétil criado
   */
  public createProjectile(
    container: PIXI.Container,
    x: number,
    y: number,
    velocityX: number,
    velocityY: number,
    weaponType: WeaponType,
    physicsSystem: PhysicsSystem,
    options: any = {}
  ): Projectile {
    // Usa a fábrica de projéteis para criar o projétil
    return this.projectileFactory.createProjectile({
      container,
      x,
      y,
      velocityX,
      velocityY,
      weaponType,
      physicsSystem,
      // Adiciona opções específicas para projéteis especiais
      ...this.mapOptionsForWeaponType(weaponType, options)
    });
  }
  
  /**
   * Mapeia opções adicionais com base no tipo de arma
   * 
   * @param weaponType Tipo de arma
   * @param options Opções originais
   * @returns Opções mapeadas para o sistema de fábrica de projéteis
   */
  private mapOptionsForWeaponType(weaponType: WeaponType, options: any): any {
    switch (weaponType) {
      case WeaponType.FRAG_BOMB:
        return {
          fragmentCount: options.fragmentCount || 8,
          fragmentDamage: options.fragmentDamage || 15
        };
        
      case WeaponType.GUIDED_MISSILE:
        return {
          guidanceStrength: options.guidanceStrength || 0.1,
          target: options.target || null
        };
        
      default:
        return {};
    }
  }
  
  /**
   * Cria um projétil para uma bomba de fragmentação específica para o Devastator
   * 
   * @param container Container gráfico para adicionar o projétil
   * @param x Posição inicial X
   * @param y Posição inicial Y
   * @param velocityX Velocidade X do projétil
   * @param velocityY Velocidade Y do projétil
   * @param physicsSystem Sistema de física
   * @param bombChargeLevel Nível de carga da bomba (0-100)
   * @returns O projétil criado
   */
  public createFragBombProjectile(
    container: PIXI.Container,
    x: number,
    y: number,
    velocityX: number,
    velocityY: number,
    physicsSystem: PhysicsSystem,
    bombChargeLevel: number = 50
  ): Projectile {
    // Normaliza o nível de carga (0-100)
    const normalizedCharge = Math.max(0, Math.min(100, bombChargeLevel));
    const chargePercent = normalizedCharge / 100;
    
    // Calcula os parâmetros do projétil com base no nível de carga
    const fragmentCount = Math.floor(5 + chargePercent * 10); // 5-15 fragmentos
    const fragmentDamage = Math.floor(10 + chargePercent * 20); // 10-30 dano
    
    // Usa o createProjectile para criar o projétil
    return this.createProjectile(
      container,
      x,
      y,
      velocityX,
      velocityY,
      WeaponType.FRAG_BOMB,
      physicsSystem,
      { fragmentCount, fragmentDamage }
    );
  }
} 