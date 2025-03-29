import { PhysicsObject, Vector2D } from './physics-object';
import { CollisionDetector } from './collision-detector';
import { CollisionResolver } from './collision-resolver';
import { ForceCalculator } from './force-calculator';

/**
 * Motor de física do jogo
 * Coordena todos os aspectos da simulação física
 */
export class PhysicsEngine {
  private objects: PhysicsObject[] = [];
  private collisionDetector: CollisionDetector;
  private collisionResolver: CollisionResolver;
  private forceCalculator: ForceCalculator;
  
  /**
   * Cria um novo motor de física
   */
  constructor() {
    this.collisionDetector = new CollisionDetector();
    this.collisionResolver = new CollisionResolver();
    this.forceCalculator = new ForceCalculator();
  }
  
  /**
   * Adiciona um objeto ao sistema de física
   * @param object Objeto a ser adicionado
   */
  addObject(object: PhysicsObject): void {
    this.objects.push(object);
  }
  
  /**
   * Remove um objeto do sistema de física
   * @param object Objeto a ser removido
   */
  removeObject(object: PhysicsObject): void {
    const index = this.objects.indexOf(object);
    if (index !== -1) {
      this.objects.splice(index, 1);
    }
  }
  
  /**
   * Limpa todos os objetos do sistema de física
   */
  clear(): void {
    this.objects = [];
  }
  
  /**
   * Atualiza todos os objetos físicos
   * @param deltaTime Tempo desde o último frame em segundos
   */
  update(deltaTime: number): void {
    // Atualiza a física de cada objeto
    this.updatePhysics(deltaTime);
    
    // Detecta e resolve colisões
    this.handleCollisions();
  }
  
  /**
   * Atualiza a física de cada objeto (gravidade, movimento)
   * @param deltaTime Tempo desde o último frame em segundos
   */
  private updatePhysics(deltaTime: number): void {
    for (const object of this.objects) {
      if (object.isStatic) continue;
      
      // Aplica a gravidade
      const newVelocity = this.forceCalculator.applyGravity(object, deltaTime);
      
      // Atualiza a velocidade
      object.velocityX = newVelocity.x;
      object.velocityY = newVelocity.y;
      
      // Calcula a nova posição
      const newPosition = this.forceCalculator.calculateNewPosition(object, deltaTime);
      
      // Atualiza a posição
      object.x = newPosition.x;
      object.y = newPosition.y;
    }
  }
  
  /**
   * Detecta e resolve colisões entre objetos
   */
  private handleCollisions(): void {
    // Detecta colisões entre todos os objetos
    const collisions = this.collisionDetector.detectCollisionsInGroup(this.objects);
    
    // Resolve cada colisão
    for (const collision of collisions) {
      const { objectA, objectB, collisionInfo } = collision;
      
      // Resolve a colisão e obtém novas posições e velocidades
      const resolution = this.collisionResolver.resolveCollision(objectA, objectB, collisionInfo);
      
      // Aplica as novas posições e velocidades
      objectA.x = resolution.objectA.position.x;
      objectA.y = resolution.objectA.position.y;
      objectA.velocityX = resolution.objectA.velocity.x;
      objectA.velocityY = resolution.objectA.velocity.y;
      
      objectB.x = resolution.objectB.position.x;
      objectB.y = resolution.objectB.position.y;
      objectB.velocityX = resolution.objectB.velocity.x;
      objectB.velocityY = resolution.objectB.velocity.y;
    }
  }
  
  /**
   * Verifica se dois objetos estão colidindo
   * @param objectA Primeiro objeto
   * @param objectB Segundo objeto
   * @returns Verdadeiro se há colisão
   */
  checkCollision(objectA: PhysicsObject, objectB: PhysicsObject): boolean {
    const collisionInfo = this.collisionDetector.detectCollision(objectA, objectB);
    return collisionInfo.hasCollision;
  }
  
  /**
   * Aplica uma força a um objeto
   * @param object Objeto a receber a força
   * @param forceX Componente X da força
   * @param forceY Componente Y da força
   */
  applyForce(object: PhysicsObject, forceX: number, forceY: number): void {
    if (object.isStatic) return;
    
    const newVelocity = this.forceCalculator.applyForce(object, forceX, forceY);
    object.velocityX = newVelocity.x;
    object.velocityY = newVelocity.y;
  }
  
  /**
   * Aplica um impulso (força instantânea) a um objeto
   * @param object Objeto a receber o impulso
   * @param impulseX Componente X do impulso
   * @param impulseY Componente Y do impulso
   */
  applyImpulse(object: PhysicsObject, impulseX: number, impulseY: number): void {
    if (object.isStatic) return;
    
    const newVelocity = this.forceCalculator.applyImpulse(object, impulseX, impulseY);
    object.velocityX = newVelocity.x;
    object.velocityY = newVelocity.y;
  }
  
  /**
   * Verifica se um ponto está dentro de um objeto
   * @param x Coordenada X do ponto
   * @param y Coordenada Y do ponto
   * @param object Objeto a verificar
   * @returns Verdadeiro se o ponto está dentro do objeto
   */
  isPointInObject(x: number, y: number, object: PhysicsObject): boolean {
    return this.collisionDetector.isPointInObject(x, y, object);
  }
  
  /**
   * Obtém a lista de objetos físicos
   * @returns Lista de objetos físicos
   */
  getObjects(): PhysicsObject[] {
    return [...this.objects];
  }
} 