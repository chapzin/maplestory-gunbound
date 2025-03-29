import * as PIXI from 'pixi.js';
import { PhysicsObject } from './physics';
import { CONFIG } from '../core/config';

/**
 * Classe que representa um projétil no jogo
 */
export class Projectile implements PhysicsObject {
  // Propriedades físicas
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  mass: number = 1;
  isStatic: boolean = false;
  width: number;
  height: number;
  
  // Propriedades visuais
  radius: number;
  graphics: PIXI.Graphics;
  color: number;
  
  // Outras propriedades
  private isDead: boolean = false;
  private lifetime: number = 0;
  private maxLifetime: number = 10; // Segundos máximos na tela
  
  /**
   * Cria um novo projétil
   * @param x Posição inicial X
   * @param y Posição inicial Y
   * @param velocityX Velocidade inicial X
   * @param velocityY Velocidade inicial Y
   * @param radius Raio do projétil
   * @param color Cor do projétil em formato hexadecimal
   */
  constructor(
    x: number,
    y: number,
    velocityX: number,
    velocityY: number,
    radius: number = 5,
    color: number = 0xFF0000
  ) {
    this.x = x;
    this.y = y;
    this.velocityX = velocityX;
    this.velocityY = velocityY;
    this.radius = radius;
    this.color = color;
    
    // Define as dimensões baseadas no raio
    this.width = radius * 2;
    this.height = radius * 2;
    
    // Cria a representação gráfica
    this.graphics = new PIXI.Graphics();
    this.updateGraphics();
  }
  
  /**
   * Atualiza o estado do projétil
   * @param deltaTime Tempo desde o último frame em segundos
   */
  update(deltaTime: number): void {
    // Atualiza o tempo de vida
    this.lifetime += deltaTime;
    if (this.lifetime >= this.maxLifetime) {
      this.isDead = true;
      return;
    }
    
    // Aplica a gravidade
    this.velocityY += CONFIG.PHYSICS.GRAVITY * deltaTime;
    
    // Atualiza a posição
    this.x += this.velocityX * deltaTime;
    this.y += this.velocityY * deltaTime;
    
    // Limita a velocidade máxima (valor padrão se não estiver definido no CONFIG)
    const maxSpeed = 500; // Valor padrão
    const speed = Math.sqrt(this.velocityX * this.velocityX + this.velocityY * this.velocityY);
    if (speed > maxSpeed) {
      const factor = maxSpeed / speed;
      this.velocityX *= factor;
      this.velocityY *= factor;
    }
    
    // Atualiza a representação gráfica
    this.graphics.x = this.x;
    this.graphics.y = this.y;
  }
  
  /**
   * Atualiza a representação gráfica do projétil
   * @private
   */
  private updateGraphics(): void {
    this.graphics.clear();
    
    // Desenha o círculo principal
    this.graphics.beginFill(this.color);
    this.graphics.drawCircle(0, 0, this.radius);
    this.graphics.endFill();
    
    // Adiciona um brilho
    this.graphics.beginFill(0xFFFFFF, 0.5);
    this.graphics.drawCircle(-this.radius * 0.3, -this.radius * 0.3, this.radius * 0.3);
    this.graphics.endFill();
    
    // Posiciona o gráfico
    this.graphics.x = this.x;
    this.graphics.y = this.y;
  }
  
  /**
   * Aplica um impulso ao projétil
   * @param impulseX Componente X do impulso
   * @param impulseY Componente Y do impulso
   */
  applyImpulse(impulseX: number, impulseY: number): void {
    this.velocityX += impulseX / this.mass;
    this.velocityY += impulseY / this.mass;
  }
  
  /**
   * Verifica se o projétil está morto
   * @returns Verdadeiro se o projétil está morto
   */
  isDestroyed(): boolean {
    return this.isDead;
  }
  
  /**
   * Marca o projétil como destruído
   */
  destroy(): void {
    this.isDead = true;
  }
  
  /**
   * Verifica se o projétil está colidindo com um ponto
   * @param x Coordenada X do ponto
   * @param y Coordenada Y do ponto
   * @returns Verdadeiro se há colisão
   */
  isCollidingWithPoint(x: number, y: number): boolean {
    const distance = Math.sqrt(
      Math.pow(this.x - x, 2) + Math.pow(this.y - y, 2)
    );
    return distance <= this.radius;
  }
  
  /**
   * Calcula a trajetória do projétil
   * @param steps Número de passos para prever
   * @param deltaTime Tempo de cada passo
   * @returns Array de pontos {x, y} na trajetória
   */
  calculateTrajectory(steps: number, deltaTime: number): {x: number, y: number}[] {
    const trajectory: {x: number, y: number}[] = [];
    
    // Cria uma cópia dos valores atuais
    let x = this.x;
    let y = this.y;
    let vx = this.velocityX;
    let vy = this.velocityY;
    
    // Calcula cada ponto na trajetória
    for (let i = 0; i < steps; i++) {
      // Aplica a gravidade
      vy += CONFIG.PHYSICS.GRAVITY * deltaTime;
      
      // Atualiza a posição
      x += vx * deltaTime;
      y += vy * deltaTime;
      
      // Adiciona o ponto à trajetória
      trajectory.push({ x, y });
    }
    
    return trajectory;
  }
} 