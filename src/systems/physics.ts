import { CONFIG } from '../core/config';
import * as MathUtils from '../utils/math';

/**
 * Interface para objetos que interagem com o sistema de física
 */
export interface PhysicsObject {
  // Posição e velocidade
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  
  // Propriedades físicas
  mass: number;
  isStatic: boolean;
  width: number;
  height: number;
}

/**
 * Sistema de física do jogo
 * Responsável por simular a física básica para os objetos do jogo
 */
export class Physics {
  private objects: PhysicsObject[] = [];
  
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
    // Aplica a gravidade e atualiza posições
    for (const object of this.objects) {
      if (object.isStatic) continue;
      
      // Aplica a gravidade
      object.velocityY += CONFIG.PHYSICS.GRAVITY * deltaTime;
      
      // Atualiza a posição
      object.x += object.velocityX * deltaTime;
      object.y += object.velocityY * deltaTime;
    }
    
    // Verifica colisões entre objetos
    this.checkCollisions();
  }
  
  /**
   * Verifica e resolve colisões entre objetos
   */
  private checkCollisions(): void {
    const length = this.objects.length;
    
    // Verifica cada par de objetos
    for (let i = 0; i < length; i++) {
      const objectA = this.objects[i];
      
      // Pula objetos estáticos para verificações entre objetos
      if (objectA.isStatic) continue;
      
      // Verifica colisão com outros objetos
      for (let j = i + 1; j < length; j++) {
        const objectB = this.objects[j];
        
        // Verifica se há colisão entre objectA e objectB
        if (this.checkCollision(objectA, objectB)) {
          // Resolve a colisão
          this.resolveCollision(objectA, objectB);
        }
      }
    }
  }
  
  /**
   * Verifica se há colisão entre dois objetos
   * @param objectA Primeiro objeto
   * @param objectB Segundo objeto
   * @returns Verdadeiro se há colisão
   */
  checkCollision(objectA: PhysicsObject, objectB: PhysicsObject): boolean {
    // Colisão AABB (Axis-Aligned Bounding Box)
    return (
      objectA.x < objectB.x + objectB.width &&
      objectA.x + objectA.width > objectB.x &&
      objectA.y < objectB.y + objectB.height &&
      objectA.y + objectA.height > objectB.y
    );
  }
  
  /**
   * Resolve uma colisão entre dois objetos
   * @param objectA Primeiro objeto
   * @param objectB Segundo objeto
   */
  private resolveCollision(objectA: PhysicsObject, objectB: PhysicsObject): void {
    // Se objectB é estático, apenas ajusta objectA
    if (objectB.isStatic) {
      this.adjustPositionAgainstStatic(objectA, objectB);
      this.bounceAgainstStatic(objectA, objectB);
      return;
    }
    
    // Se objectA é estático, apenas ajusta objectB
    if (objectA.isStatic) {
      this.adjustPositionAgainstStatic(objectB, objectA);
      this.bounceAgainstStatic(objectB, objectA);
      return;
    }
    
    // Se ambos são dinâmicos, implementa uma colisão elástica
    this.elasticCollision(objectA, objectB);
  }
  
  /**
   * Ajusta a posição de um objeto para evitar sobreposição com um objeto estático
   * @param movable Objeto móvel
   * @param staticObj Objeto estático
   */
  private adjustPositionAgainstStatic(movable: PhysicsObject, staticObj: PhysicsObject): void {
    // Calcula a sobreposição em cada eixo
    const overlapX = Math.min(
      movable.x + movable.width - staticObj.x,
      staticObj.x + staticObj.width - movable.x
    );
    
    const overlapY = Math.min(
      movable.y + movable.height - staticObj.y,
      staticObj.y + staticObj.height - movable.y
    );
    
    // Move na direção de menor sobreposição
    if (overlapX < overlapY) {
      // Move horizontalmente
      if (movable.x < staticObj.x) {
        movable.x -= overlapX;
      } else {
        movable.x += overlapX;
      }
    } else {
      // Move verticalmente
      if (movable.y < staticObj.y) {
        movable.y -= overlapY;
      } else {
        movable.y += overlapY;
      }
    }
  }
  
  /**
   * Faz um objeto quicar contra um objeto estático
   * @param movable Objeto móvel
   * @param staticObj Objeto estático
   */
  private bounceAgainstStatic(movable: PhysicsObject, staticObj: PhysicsObject): void {
    // Determina em qual eixo ocorreu a colisão
    const centerDiffX = (movable.x + movable.width / 2) - (staticObj.x + staticObj.width / 2);
    const centerDiffY = (movable.y + movable.height / 2) - (staticObj.y + staticObj.height / 2);
    
    const minHalfWidth = Math.min(movable.width / 2, staticObj.width / 2);
    const minHalfHeight = Math.min(movable.height / 2, staticObj.height / 2);
    
    // Fator de redução da velocidade (coeficiente de restituição)
    const elasticity = 0.7;
    
    // Colisão horizontal
    if (Math.abs(centerDiffX) > minHalfWidth && Math.abs(centerDiffY) <= minHalfHeight) {
      movable.velocityX = -movable.velocityX * elasticity;
    } 
    // Colisão vertical
    else if (Math.abs(centerDiffY) > minHalfHeight && Math.abs(centerDiffX) <= minHalfWidth) {
      movable.velocityY = -movable.velocityY * elasticity;
    } 
    // Colisão de canto
    else {
      movable.velocityX = -movable.velocityX * elasticity;
      movable.velocityY = -movable.velocityY * elasticity;
    }
  }
  
  /**
   * Implementa uma colisão elástica entre dois objetos
   * @param objectA Primeiro objeto
   * @param objectB Segundo objeto
   */
  private elasticCollision(objectA: PhysicsObject, objectB: PhysicsObject): void {
    // Calcula as velocidades após a colisão
    const massSum = objectA.mass + objectB.mass;
    
    // Massa relativa do objeto A
    const massRatioA = (objectA.mass - objectB.mass) / massSum;
    
    // Massa relativa do objeto B
    const massRatioB = (2 * objectB.mass) / massSum;
    
    // Massa relativa do objeto A em relação ao objeto B
    const massRatioC = (2 * objectA.mass) / massSum;
    
    // Calcula as novas velocidades
    const newVelocityAX = massRatioA * objectA.velocityX + massRatioB * objectB.velocityX;
    const newVelocityAY = massRatioA * objectA.velocityY + massRatioB * objectB.velocityY;
    
    const newVelocityBX = (objectB.velocityX * -massRatioA) + (objectA.velocityX * massRatioC);
    const newVelocityBY = (objectB.velocityY * -massRatioA) + (objectA.velocityY * massRatioC);
    
    // Aplica as novas velocidades
    objectA.velocityX = newVelocityAX;
    objectA.velocityY = newVelocityAY;
    
    objectB.velocityX = newVelocityBX;
    objectB.velocityY = newVelocityBY;
    
    // Ajusta as posições para evitar que os objetos fiquem presos um no outro
    this.adjustPositionAfterCollision(objectA, objectB);
  }
  
  /**
   * Ajusta as posições de dois objetos após uma colisão
   * @param objectA Primeiro objeto
   * @param objectB Segundo objeto
   */
  private adjustPositionAfterCollision(objectA: PhysicsObject, objectB: PhysicsObject): void {
    // Calcula o vetor entre os centros dos objetos
    const centerAX = objectA.x + objectA.width / 2;
    const centerAY = objectA.y + objectA.height / 2;
    
    const centerBX = objectB.x + objectB.width / 2;
    const centerBY = objectB.y + objectB.height / 2;
    
    const directionX = centerBX - centerAX;
    const directionY = centerBY - centerAY;
    
    // Normaliza o vetor direção
    const length = Math.sqrt(directionX * directionX + directionY * directionY);
    
    if (length > 0) {
      const normalizedX = directionX / length;
      const normalizedY = directionY / length;
      
      // Calcula a sobreposição
      const overlap = (objectA.width / 2 + objectB.width / 2) - length;
      
      if (overlap > 0) {
        // Move os objetos na direção oposta à sobreposição
        const moveRatioA = objectB.mass / (objectA.mass + objectB.mass);
        const moveRatioB = objectA.mass / (objectA.mass + objectB.mass);
        
        objectA.x -= normalizedX * overlap * moveRatioA;
        objectA.y -= normalizedY * overlap * moveRatioA;
        
        objectB.x += normalizedX * overlap * moveRatioB;
        objectB.y += normalizedY * overlap * moveRatioB;
      }
    }
  }
  
  /**
   * Aplica uma força a um objeto
   * @param object Objeto a receber a força
   * @param forceX Componente X da força
   * @param forceY Componente Y da força
   */
  applyForce(object: PhysicsObject, forceX: number, forceY: number): void {
    if (object.isStatic) return;
    
    // F = m * a => a = F / m
    object.velocityX += forceX / object.mass;
    object.velocityY += forceY / object.mass;
  }
  
  /**
   * Verifica se um ponto está dentro de um objeto
   * @param x Coordenada X do ponto
   * @param y Coordenada Y do ponto
   * @param object Objeto a verificar
   * @returns Verdadeiro se o ponto está dentro do objeto
   */
  isPointInObject(x: number, y: number, object: PhysicsObject): boolean {
    return (
      x >= object.x &&
      x <= object.x + object.width &&
      y >= object.y &&
      y <= object.y + object.height
    );
  }
} 