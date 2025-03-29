import * as PIXI from 'pixi.js';
import { PhysicsEngine, PhysicsObject } from './physics/index';
import { CONFIG } from '../core/config';
import { Physics } from './physics'; // Importar a classe Physics para compatibilidade

/**
 * Sistema de física para trajetórias e colisões
 * Adapta o sistema de física genérico para as necessidades específicas do jogo
 * Estende a classe Physics para compatibilidade com código existente
 */
export class PhysicsSystem extends Physics {
  private engine: PhysicsEngine;
  private wind: number = 0;
  private gravity: number = CONFIG.PHYSICS.GRAVITY;
  private windUpdateInterval: number = 5000; // 5 segundos
  private windTimer: number = 0;
  
  constructor() {
    super(); // Chama o construtor da classe pai
    this.engine = new PhysicsEngine();
    this.updateWind();
  }

  /**
   * Atualiza o sistema de física
   * @param deltaTime Tempo desde o último frame
   */
  public update(deltaTime: number): void {
    // Chama o método update da classe pai para manter compatibilidade
    super.update(deltaTime);
    
    // Atualiza o sistema de física avançado
    this.engine.update(deltaTime);
    
    // Atualiza o vento periodicamente
    this.windTimer += deltaTime;
    if (this.windTimer >= this.windUpdateInterval) {
      this.updateWind();
      this.windTimer = 0;
    }
  }

  // Implementações necessárias para compatibilidade com Physics
  checkCollisions(): void {
    // Já implementado internamente pelo engine
  }

  resolveCollision(objectA: PhysicsObject, objectB: PhysicsObject): void {
    // Delegado para o engine, que já implementa resolução de colisões
  }

  adjustPositionAgainstStatic(movable: PhysicsObject, staticObj: PhysicsObject): void {
    // Implementado internamente pelo engine
  }

  bounceAgainstStatic(movable: PhysicsObject, staticObj: PhysicsObject): void {
    // Implementado internamente pelo engine
  }

  elasticCollision(objectA: PhysicsObject, objectB: PhysicsObject): void {
    // Implementado internamente pelo engine
  }

  adjustPositionAfterCollision(objectA: PhysicsObject, objectB: PhysicsObject): void {
    // Implementado internamente pelo engine
  }

  /**
   * Atualiza aleatoriamente a força do vento
   */
  private updateWind(): void {
    // Define um valor aleatório entre -5 e 5
    this.wind = (Math.random() * 10 - 5) * CONFIG.PHYSICS.WIND_STRENGTH;
  }

  /**
   * Obtém a força atual do vento
   */
  public getWind(): number {
    return this.wind;
  }

  /**
   * Obtém a força da gravidade
   */
  public getGravity(): number {
    return this.gravity;
  }

  /**
   * Calcula a trajetória de um projétil
   * @param startX Posição inicial X
   * @param startY Posição inicial Y
   * @param angle Ângulo em graus
   * @param power Potência inicial
   * @returns Array de pontos da trajetória
   */
  public calculateProjectileTrajectory(
    startX: number,
    startY: number,
    angle: number,
    power: number
  ): Array<{ x: number, y: number }> {
    const trajectory: Array<{ x: number, y: number }> = [];
    const points = 100; // Número de pontos a calcular
    const timeStep = 0.1; // Incremento de tempo
    
    // Converte o ângulo para radianos
    const angleRad = angle * (Math.PI / 180);
    
    // Calcula velocidades iniciais
    const velocityX = Math.cos(angleRad) * power * 0.1;
    const velocityY = -Math.sin(angleRad) * power * 0.1;
    
    // Adiciona o ponto inicial
    trajectory.push({ x: startX, y: startY });
    
    // Simula a trajetória
    let x = startX;
    let y = startY;
    let vx = velocityX;
    let vy = velocityY;
    
    for (let i = 0; i < points; i++) {
      // Aplica a gravidade
      vy += this.gravity * timeStep;
      
      // Aplica o vento
      vx += this.wind * 0.005 * timeStep;
      
      // Atualiza a posição
      x += vx;
      y += vy;
      
      // Adiciona o ponto à trajetória
      trajectory.push({ x, y });
      
      // Verifica se saiu da tela
      if (y > CONFIG.SCREEN.HEIGHT || x < 0 || x > CONFIG.SCREEN.WIDTH) {
        break;
      }
    }
    
    return trajectory;
  }
  
  /**
   * Adiciona um objeto ao sistema de física
   * @param object Objeto a ser adicionado
   */
  public addObject(object: PhysicsObject): void {
    // Adiciona ao sistema de física pai para compatibilidade
    super.addObject(object);
    
    // Adiciona ao engine avançado
    this.engine.addObject(object);
  }
  
  /**
   * Remove um objeto do sistema de física
   * @param object Objeto a ser removido
   */
  public removeObject(object: PhysicsObject): void {
    // Remove do sistema de física pai para compatibilidade
    super.removeObject(object);
    
    // Remove do engine avançado
    this.engine.removeObject(object);
  }
  
  /**
   * Limpa todos os objetos do sistema de física
   */
  public clear(): void {
    // Limpa o sistema de física pai para compatibilidade
    super.clear();
    
    // Limpa o engine avançado
    this.engine.clear();
  }
  
  /**
   * Verifica colisão entre dois objetos
   * @param objectA Primeiro objeto
   * @param objectB Segundo objeto
   * @returns Verdadeiro se há colisão
   */
  public checkCollision(objectA: PhysicsObject, objectB: PhysicsObject): boolean {
    // Prioriza o engine avançado para verificação de colisão
    return this.engine.checkCollision(objectA, objectB);
  }

  /**
   * Aplica uma força a um objeto
   * @param object Objeto a receber a força
   * @param forceX Componente X da força
   * @param forceY Componente Y da força
   */
  public applyForce(object: PhysicsObject, forceX: number, forceY: number): void {
    // Aplica força no sistema de física pai para compatibilidade
    super.applyForce(object, forceX, forceY);
    
    // Aplica força no engine avançado
    this.engine.applyForce(object, forceX, forceY);
  }
  
  /**
   * Verifica se um ponto está dentro de um objeto
   * @param x Coordenada X do ponto
   * @param y Coordenada Y do ponto
   * @param object Objeto a verificar
   * @returns Verdadeiro se o ponto está dentro do objeto
   */
  public isPointInObject(x: number, y: number, object: PhysicsObject): boolean {
    // Prioriza o engine avançado para verificação de ponto
    return this.engine.isPointInObject(x, y, object);
  }
  
  /**
   * Obtém a lista de objetos físicos
   * @returns Lista de objetos físicos
   */
  public getObjects(): PhysicsObject[] {
    return this.engine.getObjects();
  }
  
  /**
   * Aplica um impulso (força instantânea) a um objeto
   * @param object Objeto a receber o impulso
   * @param impulseX Componente X do impulso
   * @param impulseY Componente Y do impulso
   */
  public applyImpulse(object: PhysicsObject, impulseX: number, impulseY: number): void {
    this.engine.applyImpulse(object, impulseX, impulseY);
    
    // Atualiza a velocidade no objeto para compatibilidade com o sistema de física pai
    object.velocityX += impulseX / object.mass;
    object.velocityY += impulseY / object.mass;
  }
} 