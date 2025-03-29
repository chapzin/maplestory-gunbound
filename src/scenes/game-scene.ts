import * as PIXI from 'pixi.js';
import { BaseScene } from './base-scene';
import { PhysicsSystem } from '../systems/physics-adapter';
import { TerrainSystem } from '../systems/terrain-adapter';
import { InputSystem } from '../systems/input/input-system';
import { EventSystem } from '../systems/event-system';
import { Projectile } from '../entities/projectile';
import { ExplosionEffect } from '../systems/effects/explosion';
import { AngleIndicator, PowerIndicator, WindDisplay } from '../ui';
import { CONFIG } from '../core/config';

/**
 * Cena principal de jogo
 */
export class GameScene extends BaseScene {
  private physicsSystem: PhysicsSystem;
  private terrainSystem: TerrainSystem;
  private inputSystem: InputSystem;
  private explosionEffect: ExplosionEffect;
  private eventSystem: EventSystem;
  
  private projectile: Projectile | null = null;
  private angleIndicator: AngleIndicator;
  private powerIndicator: PowerIndicator;
  private windDisplay: WindDisplay;
  
  private startX: number = 100;
  private startY: number = 300;

  /**
   * Inicializa a cena de jogo
   * @param app Aplicação Pixi.js
   */
  constructor(app: PIXI.Application) {
    super(app);
    
    // Inicializa sistemas
    this.physicsSystem = new PhysicsSystem();
    this.terrainSystem = new TerrainSystem(app);
    this.inputSystem = new InputSystem(app);
    this.explosionEffect = new ExplosionEffect(this.container);
    this.eventSystem = EventSystem.getInstance();
    
    // Configura o ponto de partida para o sistema de input
    this.inputSystem.setStartPoint(this.startX, this.startY);
    
    // Inicializa componentes de UI
    this.angleIndicator = new AngleIndicator(this.container);
    this.angleIndicator.setPosition(this.startX, this.startY);
    
    this.powerIndicator = new PowerIndicator(this.container);
    this.powerIndicator.setPosition(this.startX - 50, this.startY + 20);
    
    this.windDisplay = new WindDisplay(this.container);
    this.windDisplay.setPosition(10, 10);
    
    // Configura eventos
    this.setupEvents();
    
    // Renderizar cena inicial
    this.render();
  }

  /**
   * Configura os eventos do jogo
   */
  private setupEvents(): void {
    // Registra callbacks para eventos de input
    this.inputSystem.onAngleChange(this.updateAngle.bind(this));
    this.inputSystem.onPowerChange(this.updatePower.bind(this));
    this.inputSystem.onFire(this.fireProjectile.bind(this));
    
    // Registra callbacks para eventos de projétil
    Projectile.onImpact(this.handleProjectileImpact.bind(this));
  }

  /**
   * Atualiza o ângulo de disparo
   * @param angle Novo ângulo
   */
  private updateAngle(angle: number): void {
    this.angleIndicator.setAngle(angle);
  }

  /**
   * Atualiza a potência de disparo
   * @param power Nova potência
   */
  private updatePower(power: number): void {
    this.powerIndicator.setPower(power);
  }

  /**
   * Dispara um projétil
   */
  private fireProjectile(): void {
    // Evita disparos múltiplos
    if (this.projectile && this.projectile.isActive()) return;
    
    // Cria um novo projétil
    this.projectile = new Projectile(
      this.container,
      this.startX,
      this.startY,
      this.inputSystem.getAngle(),
      this.inputSystem.getPower(),
      this.physicsSystem
    );
    
    // Dispara o projétil
    this.projectile.fire();
  }

  /**
   * Manipula o evento de impacto de um projétil
   * @param data Dados do impacto
   */
  private handleProjectileImpact(data: any): void {
    // Cria uma explosão no ponto de impacto
    this.explosionEffect.create(data.x, data.y, data.power);
    
    // Aqui adicionaríamos lógica para danificar o terreno ou veículos
    // Exemplo: this.terrainSystem.damageAt(data.x, data.y, data.power);
  }

  /**
   * Atualiza a lógica da cena
   * @param deltaTime Tempo desde o último frame
   */
  public update(deltaTime: number): void {
    // Atualiza sistemas
    this.physicsSystem.update(deltaTime);
    this.terrainSystem.update(deltaTime);
    this.inputSystem.update(deltaTime);
    
    // Atualiza projétil se estiver ativo
    if (this.projectile && this.projectile.isActive()) {
      this.projectile.update(deltaTime);
    }
    
    // Atualiza efeitos visuais
    if (this.explosionEffect.isActive()) {
      this.explosionEffect.update(deltaTime);
    }
    
    // Atualiza elementos de UI
    this.windDisplay.update(this.physicsSystem.getWind());
  }

  /**
   * Renderiza a cena
   */
  protected render(): void {
    // Renderização principal já é feita pelo Pixi automaticamente
    // Este método pode ser usado para atualizações visuais adicionais
  }

  /**
   * Limpa recursos ao destruir a cena
   */
  public destroy(): void {
    // Destrói componentes de UI
    this.angleIndicator.destroy();
    this.powerIndicator.destroy();
    this.windDisplay.destroy();
    
    // Destrói projétil se existir
    if (this.projectile) {
      this.projectile.destroy();
      this.projectile = null;
    }
    
    // Destrói efeitos
    this.explosionEffect.destroy();
    
    // Destroi o container principal (incluindo todos os filhos)
    super.destroy();
  }
} 