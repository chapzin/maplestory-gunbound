import * as PIXI from 'pixi.js';
import { Projectile } from '../entities/projectile';
import { Physics } from './physics';
import { PhysicsSystem } from './physics-adapter';
import { Terrain } from './terrain';
import { EventEmitter } from 'eventemitter3';
import { ProjectileFactory, ProjectileOptions, ProjectileType } from '../entities/projectile-factory';
import { WeaponType } from '../entities/vehicles/types';
import { FragProjectile } from '../entities/frag-projectile';
import { GuidedProjectile } from '../entities/guided-projectile';

export enum ProjectileEventType {
  PROJECTILE_CREATED = 'projectileCreated',
  PROJECTILE_DESTROYED = 'projectileDestroyed',
  PROJECTILE_IMPACT = 'projectileImpact',
  FRAGMENT_CREATED = 'fragmentCreated'
}

/**
 * Interface para dados do projétil
 */
export interface ProjectileData {
  type: WeaponType;
  x: number;
  y: number;
  angle: number;
  power: number;
  damage: number;
  sourceId?: number;
  playerId?: number;
  explosionRadius?: number;
  fragmentCount?: number;
  fragmentDamage?: number;
  fragmentSpread?: number;
  targetId?: number;
  targetX?: number;
  targetY?: number;
  guidanceStrength?: number;
}

/**
 * Classe responsável por gerenciar os projéteis do jogo
 */
export class ProjectileManager extends EventEmitter {
  private projectiles: Projectile[] = [];
  private projectileContainer: PIXI.Container;
  private physicsSystem: PhysicsSystem;
  private terrain: Terrain;
  private screenWidth: number;
  private screenHeight: number;
  private projectileFactory: ProjectileFactory;

  /**
   * Cria uma nova instância do gerenciador de projéteis
   * @param projectileContainer Container para renderizar os projéteis
   * @param physicsSystem Sistema de física
   * @param terrain Sistema de terreno
   * @param screenWidth Largura da tela
   * @param screenHeight Altura da tela
   */
  constructor(
    projectileContainer: PIXI.Container,
    physicsSystem: PhysicsSystem,
    terrain: Terrain,
    screenWidth: number,
    screenHeight: number
  ) {
    super();
    this.projectileContainer = projectileContainer;
    this.physicsSystem = physicsSystem;
    this.terrain = terrain;
    this.screenWidth = screenWidth;
    this.screenHeight = screenHeight;
    this.projectileFactory = ProjectileFactory.getInstance();
    
    // Configura os ouvintes de eventos para projéteis especiais
    this.setupEventListeners();
  }
  
  /**
   * Configura os ouvintes de eventos
   */
  private setupEventListeners(): void {
    // Ouvinte para eventos de fragmentos criados
    this.on(ProjectileEventType.FRAGMENT_CREATED, (data) => {
      if (data && data.fragments) {
        // Aqui poderíamos processar os fragmentos criados
        console.log(`${data.fragments.length} fragmentos criados na posição (${data.x}, ${data.y})`);
      }
    });
  }

  /**
   * Cria um novo projétil com base nos dados fornecidos
   * @param data Dados do projétil
   * @returns O projétil criado
   */
  createProjectile(data: ProjectileData): Projectile | null {
    try {
      const options: ProjectileOptions = {
        container: this.projectileContainer,
        x: data.x,
        y: data.y,
        angle: data.angle,
        power: data.power,
        weaponType: data.type,
        physicsSystem: this.physicsSystem,
        sourceId: data.sourceId,
        playerId: data.playerId,
        fragmentCount: data.fragmentCount,
        fragmentDamage: data.fragmentDamage,
        explosionRadius: data.explosionRadius,
        fragmentSpread: data.fragmentSpread,
        targetX: data.targetX,
        targetY: data.targetY,
        guidanceStrength: data.guidanceStrength
      };
      
      const projectile = this.projectileFactory.createProjectile(options);
      
      // Adiciona o projétil à lista
      this.addProjectile(projectile);
      
      return projectile;
    } catch (error) {
      console.error('Erro ao criar projétil:', error);
      return null;
    }
  }

  /**
   * Adiciona um novo projétil ao gerenciador
   * @param projectile Projétil a ser adicionado
   */
  addProjectile(projectile: Projectile): void {
    this.projectiles.push(projectile);
    
    // Configura ouvintes para eventos específicos do projétil
    this.setupProjectileEventListeners(projectile);
    
    this.emit(ProjectileEventType.PROJECTILE_CREATED, projectile);
  }
  
  /**
   * Configura os ouvintes de eventos para um projétil específico
   * @param projectile Projétil a ser configurado
   */
  private setupProjectileEventListeners(projectile: Projectile): void {
    // Para projéteis de fragmentação, adiciona ouvinte para evento de fragmentos
    if (projectile instanceof FragProjectile) {
      // Se pudéssemos acessar eventos diretamente do projétil, faríamos algo como:
      /*
      projectile.on('fragment:created', (data) => {
        this.emit(ProjectileEventType.FRAGMENT_CREATED, {
          x: data.position.x,
          y: data.position.y,
          fragments: data.fragments,
          count: data.count,
          damage: data.damage
        });
      });
      */
    }
    
    // Para projéteis guiados, adiciona lógica de acompanhamento
    if (projectile instanceof GuidedProjectile) {
      // Se tivéssemos acesso para configurar o alvo, faríamos algo como:
      /*
      if (data.targetId) {
        const target = this.findTargetById(data.targetId);
        if (target) {
          projectile.setTarget(target);
        }
      }
      */
    }
  }

  /**
   * Remove um projétil do gerenciador
   * @param projectile Projétil a ser removido
   */
  removeProjectile(projectile: Projectile): void {
    const index = this.projectiles.indexOf(projectile);
    if (index !== -1) {
      this.projectiles.splice(index, 1);
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
      
      // Verifica se o projétil está ativo
      if (!projectile.isActive()) {
        this.removeProjectile(projectile);
        continue;
      }
      
      // Verifica colisão com o terreno
      const state = { 
        x: (projectile as any).x || 0, 
        y: (projectile as any).y || 0 
      };
      
      if (this.terrain.checkCollision(state.x, state.y, 5)) {
        // Destrói parte do terreno
        this.terrain.destroyAt(state.x, state.y, 30);
        
        // Emite evento de impacto
        this.emit(ProjectileEventType.PROJECTILE_IMPACT, {
          projectile,
          x: state.x,
          y: state.y,
          type: 'terrain'
        });
        
        // Remove o projétil (ele se auto-destrói ao colidir)
        this.removeProjectile(projectile);
      }
      // Verifica se o projétil saiu da tela
      else if (
        state.x < 0 ||
        state.x > this.screenWidth ||
        state.y < 0 ||
        state.y > this.screenHeight
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
   * @param radius Raio do projétil para verificação de colisão
   * @param windForce Força do vento que afeta a trajetória
   * @param steps Número de passos na trajetória
   * @returns Array com pontos da trajetória
   */
  calculateTrajectory(
    startX: number,
    startY: number,
    velocityX: number,
    velocityY: number,
    radius: number = 2,
    windForce: number = 0,
    steps: number = 60
  ): { x: number, y: number }[] {
    // Simula uma trajetória simples com base na física
    const trajectory: { x: number, y: number }[] = [];
    let x = startX;
    let y = startY;
    let vx = velocityX;
    let vy = velocityY;
    const gravity = 0.098; // Valor aproximado para simulação
    const deltaTime = 0.16; // 60fps aproximadamente
    
    for (let i = 0; i < steps; i++) {
      // Aplica a gravidade
      vy += gravity;
      
      // Aplica o vento
      vx += windForce * deltaTime;
      
      // Atualiza a posição
      x += vx * deltaTime;
      y += vy * deltaTime;
      
      // Adiciona o ponto à trajetória
      trajectory.push({ x, y });
      
      // Verifica colisão com o terreno
      if (this.terrain.checkCollision(x, y, radius)) {
        break;
      }
    }
    
    return trajectory;
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