import * as PIXI from 'pixi.js';
import { Projectile } from './projectile';
import { Physics } from './physics';
import { Terrain } from './terrain';
import { EventEmitter } from 'eventemitter3';

export enum ProjectileEventType {
  PROJECTILE_CREATED = 'projectileCreated',
  PROJECTILE_DESTROYED = 'projectileDestroyed',
  PROJECTILE_IMPACT = 'projectileImpact'
}

/**
 * Classe responsável por gerenciar os projéteis do jogo
 */
export class ProjectileManager extends EventEmitter {
  private projectiles: Projectile[] = [];
  private projectileContainer: PIXI.Container;
  private physics: Physics;
  private terrain: Terrain;
  private screenWidth: number;
  private screenHeight: number;

  /**
   * Cria uma nova instância do gerenciador de projéteis
   * @param projectileContainer Container para renderizar os projéteis
   * @param physics Sistema de física
   * @param terrain Sistema de terreno
   * @param screenWidth Largura da tela
   * @param screenHeight Altura da tela
   */
  constructor(
    projectileContainer: PIXI.Container,
    physics: Physics,
    terrain: Terrain,
    screenWidth: number,
    screenHeight: number
  ) {
    super();
    this.projectileContainer = projectileContainer;
    this.physics = physics;
    this.terrain = terrain;
    this.screenWidth = screenWidth;
    this.screenHeight = screenHeight;
  }

  /**
   * Adiciona um novo projétil ao gerenciador
   * @param projectile Projétil a ser adicionado
   */
  addProjectile(projectile: Projectile): void {
    this.projectiles.push(projectile);
    this.projectileContainer.addChild(projectile.graphics);
    this.physics.addObject(projectile);
    
    this.emit(ProjectileEventType.PROJECTILE_CREATED, projectile);
  }

  /**
   * Remove um projétil do gerenciador
   * @param projectile Projétil a ser removido
   */
  removeProjectile(projectile: Projectile): void {
    const index = this.projectiles.indexOf(projectile);
    if (index !== -1) {
      this.projectiles.splice(index, 1);
      this.projectileContainer.removeChild(projectile.graphics);
      projectile.destroy();
      
      this.emit(ProjectileEventType.PROJECTILE_DESTROYED, projectile);
    }
  }

  /**
   * Atualiza todos os projéteis
   * @param delta Delta time
   */
  update(delta: number): void {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const projectile = this.projectiles[i];
      projectile.update(delta);
      
      // Verifica colisão com o terreno
      if (this.terrain.checkCollision(projectile.x, projectile.y, projectile.radius)) {
        // Destrói parte do terreno
        this.terrain.destroyAt(projectile.x, projectile.y, 30);
        
        // Emite evento de impacto
        this.emit(ProjectileEventType.PROJECTILE_IMPACT, {
          projectile,
          x: projectile.x,
          y: projectile.y,
          type: 'terrain'
        });
        
        // Remove o projétil
        this.removeProjectile(projectile);
      }
      // Verifica se o projétil saiu da tela
      else if (
        projectile.x < 0 ||
        projectile.x > this.screenWidth ||
        projectile.y < 0 ||
        projectile.y > this.screenHeight
      ) {
        // Remove o projétil
        this.removeProjectile(projectile);
      }
    }
  }

  /**
   * Cria uma trajetória de projétil para visualização
   * @param startX Posição inicial X
   * @param startY Posição inicial Y
   * @param velocityX Velocidade inicial X
   * @param velocityY Velocidade inicial Y
   * @param radius Raio do projétil
   * @param wind Força do vento
   * @param steps Número de passos na trajetória
   * @returns Array com pontos da trajetória
   */
  calculateTrajectory(
    startX: number,
    startY: number,
    velocityX: number,
    velocityY: number,
    radius: number,
    wind: number,
    steps: number = 60
  ): { x: number, y: number }[] {
    // Cria um projétil temporário para simular a trajetória
    const tempProjectile = new Projectile(
      startX,
      startY,
      velocityX,
      velocityY,
      radius,
      0xFFFF00 // Cor amarela
    );
    
    // Calcula a trajetória
    return tempProjectile.calculateTrajectory(steps, wind);
  }

  /**
   * Obtém a lista de projéteis
   * @returns Lista de projéteis
   */
  getProjectiles(): Projectile[] {
    return this.projectiles;
  }

  /**
   * Limpa todos os projéteis
   */
  clearAll(): void {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      this.removeProjectile(this.projectiles[i]);
    }
  }
} 