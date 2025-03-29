import * as PIXI from 'pixi.js';
import { ProjectileManager } from './projectile-manager';
import { EventEmitter } from 'eventemitter3';

export enum AimingEventType {
  AIM_STARTED = 'aimStarted',
  AIM_UPDATED = 'aimUpdated',
  AIM_ENDED = 'aimEnded'
}

/**
 * Classe responsável pelo sistema de mira
 */
export class AimingSystem extends EventEmitter {
  private isAiming: boolean = false;
  private angle: number = 0;
  private power: number = 50;
  private aimingGuide: PIXI.Graphics;
  private uiContainer: PIXI.Container;
  private projectileManager: ProjectileManager;
  private wind: number = 0;
  private terrain: any; // Simplificado por enquanto, deveria ser do tipo Terrain
  
  /**
   * Cria uma nova instância do sistema de mira
   * @param uiContainer Container para renderizar o guia de mira
   * @param projectileManager Gerenciador de projéteis
   * @param terrain Sistema de terreno (para colisão)
   */
  constructor(
    uiContainer: PIXI.Container, 
    projectileManager: ProjectileManager, 
    terrain: any
  ) {
    super();
    this.uiContainer = uiContainer;
    this.projectileManager = projectileManager;
    this.terrain = terrain;
    
    // Cria o guia de mira
    this.aimingGuide = new PIXI.Graphics();
    this.uiContainer.addChild(this.aimingGuide);
  }
  
  /**
   * Inicia o modo de mira
   */
  startAiming(): void {
    this.isAiming = true;
    this.emit(AimingEventType.AIM_STARTED, {
      angle: this.angle,
      power: this.power
    });
  }
  
  /**
   * Finaliza o modo de mira
   */
  endAiming(): void {
    this.isAiming = false;
    this.aimingGuide.clear();
    this.emit(AimingEventType.AIM_ENDED, {
      angle: this.angle,
      power: this.power
    });
  }
  
  /**
   * Verifica se está mirando
   * @returns Verdadeiro se estiver mirando
   */
  getIsAiming(): boolean {
    return this.isAiming;
  }
  
  /**
   * Obtém o ângulo de mira
   * @returns Ângulo de mira em graus
   */
  getAngle(): number {
    return this.angle;
  }
  
  /**
   * Obtém a potência de mira
   * @returns Potência de mira (0-100)
   */
  getPower(): number {
    return this.power;
  }
  
  /**
   * Define o vento atual
   * @param wind Valor do vento
   */
  setWind(wind: number): void {
    this.wind = wind;
  }
  
  /**
   * Obtém o vento atual
   * @returns Valor do vento
   */
  getWind(): number {
    return this.wind;
  }
  
  /**
   * Atualiza o ângulo de mira
   * @param angle Novo ângulo em graus
   */
  setAngle(angle: number): void {
    // Limita o ângulo entre 0 e 90 graus
    this.angle = Math.max(0, Math.min(90, angle));
    this.updateAimingGuide();
    this.emit(AimingEventType.AIM_UPDATED, {
      angle: this.angle,
      power: this.power
    });
  }
  
  /**
   * Ajusta o ângulo de mira
   * @param amount Quantidade a ajustar (positivo ou negativo)
   */
  adjustAngle(amount: number): void {
    this.setAngle(this.angle + amount);
  }
  
  /**
   * Atualiza a potência de mira
   * @param power Nova potência (0-100)
   */
  setPower(power: number): void {
    // Limita a potência entre 10 e 100
    this.power = Math.max(10, Math.min(100, power));
    this.updateAimingGuide();
    this.emit(AimingEventType.AIM_UPDATED, {
      angle: this.angle,
      power: this.power
    });
  }
  
  /**
   * Ajusta a potência de mira
   * @param amount Quantidade a ajustar (positivo ou negativo)
   */
  adjustPower(amount: number): void {
    this.setPower(this.power + amount);
  }
  
  /**
   * Atualiza a mira baseado na posição do mouse
   * @param mouseX Posição X do mouse
   * @param mouseY Posição Y do mouse
   * @param vehicleX Posição X do veículo
   * @param vehicleY Posição Y do veículo
   */
  updateFromMouse(mouseX: number, mouseY: number, vehicleX: number, vehicleY: number): void {
    // Calcula o ângulo
    const dx = mouseX - vehicleX;
    const dy = vehicleY - mouseY;
    const angle = Math.atan2(dy, dx) * 180 / Math.PI;
    
    // Limita o ângulo entre 0 e 90 graus
    this.angle = Math.max(0, Math.min(90, angle));
    
    // Calcula a potência com base na distância
    const distance = Math.sqrt(dx * dx + dy * dy);
    this.power = Math.min(100, distance / 3);
    
    // Atualiza o guia de mira
    this.updateAimingGuide(vehicleX, vehicleY);
    
    // Emite evento de atualização
    this.emit(AimingEventType.AIM_UPDATED, {
      angle: this.angle,
      power: this.power
    });
  }
  
  /**
   * Atualiza o guia visual de mira
   * @param vehicleX Posição X do veículo
   * @param vehicleY Posição Y do veículo
   */
  updateAimingGuide(vehicleX?: number, vehicleY?: number): void {
    // Se não tem posição do veículo, não atualiza
    if (vehicleX === undefined || vehicleY === undefined) {
      return;
    }
    
    // Limpa o guia anterior
    this.aimingGuide.clear();
    
    // Calcula o ângulo em radianos
    const angle = this.angle * Math.PI / 180;
    
    // Calcula o vetor de velocidade inicial
    const velocity = {
      x: Math.cos(angle) * this.power * 0.5,
      y: -Math.sin(angle) * this.power * 0.5
    };
    
    // Calcula a trajetória usando o ProjectileManager
    const trajectory = this.projectileManager.calculateTrajectory(
      vehicleX,
      vehicleY,
      velocity.x,
      velocity.y,
      5, // Raio menor para visualização
      this.wind / 20,
      60 // 60 pontos na trajetória
    );
    
    // Desenha a linha da trajetória
    this.aimingGuide.lineStyle(2, 0xFFFF00, 0.5);
    this.aimingGuide.moveTo(trajectory[0].x, trajectory[0].y);
    
    for (let i = 1; i < trajectory.length; i++) {
      // Verifica se o ponto colide com o terreno
      if (this.terrain.checkCollision(trajectory[i].x, trajectory[i].y)) {
        // Desenha um círculo no ponto de impacto
        this.aimingGuide.drawCircle(trajectory[i].x, trajectory[i].y, 20);
        break;
      }
      
      this.aimingGuide.lineTo(trajectory[i].x, trajectory[i].y);
    }
    
    // Desenha o medidor de potência
    const powerBarWidth = 50;
    const powerBarHeight = 5;
    const powerBarX = vehicleX - powerBarWidth / 2;
    const powerBarY = vehicleY - 30;
    
    // Fundo do medidor
    this.aimingGuide.lineStyle(1, 0xFFFFFF, 1);
    this.aimingGuide.beginFill(0x333333, 0.7);
    this.aimingGuide.drawRect(powerBarX, powerBarY, powerBarWidth, powerBarHeight);
    this.aimingGuide.endFill();
    
    // Nível de potência
    this.aimingGuide.beginFill(0xFFFF00, 1);
    this.aimingGuide.drawRect(
      powerBarX,
      powerBarY,
      powerBarWidth * (this.power / 100),
      powerBarHeight
    );
    this.aimingGuide.endFill();
  }
  
  /**
   * Reseta os parâmetros de mira
   */
  reset(): void {
    this.angle = 0;
    this.power = 50;
    this.aimingGuide.clear();
  }
} 