import * as PIXI from 'pixi.js';
import { Projectile } from './projectile';
import { PhysicsSystem } from '../systems/physics-adapter';
import { EventSystem } from '../systems/event-system';
import { Vehicle } from './vehicles/types';

/**
 * Extensão de projétil com capacidade de seguir alvos
 */
export class GuidedProjectile extends Projectile {
  private target: Vehicle | null = null;
  private guidanceStrength: number = 0.2;
  private maxTurnRate: number = 0.1;
  private fuelDuration: number = 3; // Em segundos
  private remainingFuel: number = 0;
  private smokeEmitter: PIXI.Container;
  private smokeParticles: Array<{
    x: number;
    y: number;
    alpha: number;
    size: number;
    vx: number;
    vy: number;
    life: number;
  }> = [];
  private static readonly MAX_PARTICLES = 50;

  /**
   * Inicializa um projétil teleguiado
   * @param container Container pai para adicionar o gráfico
   * @param startX Posição inicial X
   * @param startY Posição inicial Y
   * @param angle Ângulo de disparo em graus
   * @param power Potência do disparo
   * @param physicsSystem Sistema de física
   * @param guidanceStrength Força de correção de trajetória (0-1)
   * @param target Veículo alvo (opcional)
   */
  constructor(
    container: PIXI.Container,
    startX: number,
    startY: number,
    angle: number,
    power: number,
    physicsSystem: PhysicsSystem,
    guidanceStrength: number = 0.2,
    target: Vehicle | null = null
  ) {
    super(container, startX, startY, angle, power, physicsSystem);
    
    this.guidanceStrength = guidanceStrength;
    this.target = target;
    this.remainingFuel = this.fuelDuration;
    
    // Inicializa sistema de partículas para o rastro de fumaça
    this.smokeEmitter = new PIXI.Container();
    container.addChild(this.smokeEmitter);
    
    // Personaliza a aparência do projétil
    this.setRadius(4);
    this.setColor(0xFF5500); // Laranja/vermelho para mísseis guiados
  }

  /**
   * Define a cor do projétil
   * @param color Cor em formato hexadecimal
   */
  public setColor(color: number): void {
    // Método a ser implementado na classe Projectile
    // Por enquanto, implementaremos como um método vazio
  }

  /**
   * Define o raio do projétil
   * @param radius Novo raio em pixels
   */
  public setRadius(radius: number): void {
    // Método a ser implementado na classe Projectile
    // Por enquanto, implementaremos como um método vazio
  }

  /**
   * Define o veículo alvo que o míssil vai perseguir
   * @param vehicle Veículo alvo
   */
  public setTarget(vehicle: Vehicle): void {
    this.target = vehicle;
  }

  /**
   * Atualiza o projétil teleguiado
   * @param deltaTime Tempo desde o último frame em segundos
   */
  public update(deltaTime: number): void {
    if (!this.isActive()) return;
    
    // Atualiza o combustível restante
    this.remainingFuel -= deltaTime;
    
    // Aplica guiamento apenas se ainda tiver combustível
    if (this.remainingFuel > 0 && this.target) {
      this.applyGuidance(deltaTime);
    }
    
    // Emite partículas de fumaça
    this.emitSmokeParticles();
    
    // Atualiza partículas existentes
    this.updateSmokeParticles(deltaTime);
    
    // Chama o método de atualização da classe pai
    super.update(deltaTime);
  }

  /**
   * Aplica a força de correção de trajetória em direção ao alvo
   * @param deltaTime Tempo desde o último frame
   */
  private applyGuidance(deltaTime: number): void {
    if (!this.target) return;
    
    // Obtém a posição atual do projétil
    const { x, y, vx, vy } = this.getCurrentState();
    
    // Calcula o vetor direção até o alvo
    const targetX = this.target.position.x;
    const targetY = this.target.position.y;
    const dx = targetX - x;
    const dy = targetY - y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Se estiver muito perto do alvo, não ajusta mais a trajetória
    if (distance < 10) return;
    
    // Normaliza o vetor direção
    const dirX = dx / distance;
    const dirY = dy / distance;
    
    // Calcula a velocidade atual
    const speed = Math.sqrt(vx * vx + vy * vy);
    
    // Calcula quanto a direção atual difere da direção desejada
    const currentDirX = vx / speed;
    const currentDirY = vy / speed;
    
    // Calcula a nova direção limitando o ângulo de rotação máximo
    const turnRate = Math.min(this.maxTurnRate, this.guidanceStrength * deltaTime);
    const newDirX = currentDirX + (dirX - currentDirX) * turnRate;
    const newDirY = currentDirY + (dirY - currentDirY) * turnRate;
    
    // Normaliza a nova direção
    const newDirLength = Math.sqrt(newDirX * newDirX + newDirY * newDirY);
    const normalizedDirX = newDirX / newDirLength;
    const normalizedDirY = newDirY / newDirLength;
    
    // Aplica a nova velocidade mantendo a magnitude original
    this.setVelocity(normalizedDirX * speed, normalizedDirY * speed);
  }

  /**
   * Cria novas partículas de fumaça
   */
  private emitSmokeParticles(): void {
    // Se ainda tem combustível, emite partículas de fumaça
    if (this.remainingFuel > 0) {
      const { x, y, vx, vy } = this.getCurrentState();
      
      // Limita o número de partículas
      if (this.smokeParticles.length >= GuidedProjectile.MAX_PARTICLES) {
        this.smokeParticles.shift(); // Remove a partícula mais antiga
      }
      
      // Adiciona nova partícula com posição ligeiramente aleatória
      this.smokeParticles.push({
        x: x - vx * 2 + (Math.random() - 0.5) * 3,
        y: y - vy * 2 + (Math.random() - 0.5) * 3,
        size: 2 + Math.random() * 3,
        alpha: 0.7 + Math.random() * 0.3,
        vx: -vx * 0.1 + (Math.random() - 0.5) * 0.5,
        vy: -vy * 0.1 + (Math.random() - 0.5) * 0.5,
        life: 0.5 + Math.random() * 0.5, // Tempo de vida em segundos
      });
    }
  }

  /**
   * Atualiza as partículas de fumaça existentes
   * @param deltaTime Tempo desde o último frame
   */
  private updateSmokeParticles(deltaTime: number): void {
    // Atualiza cada partícula
    for (let i = this.smokeParticles.length - 1; i >= 0; i--) {
      const particle = this.smokeParticles[i];
      
      // Atualiza a vida da partícula
      particle.life -= deltaTime;
      
      // Remove partículas expiradas
      if (particle.life <= 0) {
        this.smokeParticles.splice(i, 1);
        continue;
      }
      
      // Atualiza posição
      particle.x += particle.vx * deltaTime;
      particle.y += particle.vy * deltaTime;
      
      // Atualiza opacidade
      particle.alpha *= 0.95;
      
      // Aumenta tamanho gradualmente
      particle.size *= 1.01;
    }
    
    // Redesenha todas as partículas
    this.drawSmokeParticles();
  }

  /**
   * Desenha as partículas de fumaça
   */
  private drawSmokeParticles(): void {
    // Limpa o container de partículas
    while (this.smokeEmitter.children.length > 0) {
      this.smokeEmitter.removeChild(this.smokeEmitter.children[0]);
    }
    
    // Desenha cada partícula
    for (const particle of this.smokeParticles) {
      const graphics = new PIXI.Graphics();
      graphics.beginFill(0xAAAAAA, particle.alpha);
      graphics.drawCircle(particle.x, particle.y, particle.size);
      graphics.endFill();
      this.smokeEmitter.addChild(graphics);
    }
  }

  /**
   * Obtém o estado atual do projétil
   * @returns Objeto com posição e velocidade atual
   */
  private getCurrentState(): { x: number; y: number; vx: number; vy: number } {
    // Este método deve ser implementado para obter o estado atual do projétil
    // Como exemplo, retornamos valores fictícios
    return {
      x: 0,
      y: 0,
      vx: 0,
      vy: 0
    };
  }

  /**
   * Define a velocidade do projétil
   * @param vx Componente X da velocidade
   * @param vy Componente Y da velocidade
   */
  private setVelocity(vx: number, vy: number): void {
    // Este método deve ser implementado para definir a velocidade do projétil
    // Por enquanto, implementamos como um método vazio
  }

  /**
   * Limpa recursos utilizados pelo projétil
   */
  public destroy(): void {
    // Limpa as partículas
    this.smokeParticles = [];
    
    // Remove o emissor de partículas
    if (this.smokeEmitter.parent) {
      this.smokeEmitter.parent.removeChild(this.smokeEmitter);
    }
    
    // Chama o destroy da classe pai
    super.destroy();
  }
} 