import { CONFIG } from '../../core/config';
import * as MathUtils from '../../utils/math';
import { ModernPhysicsObject, PhysicsObject, PhysicsUtils, Vector2D } from './types';

/**
 * Sistema de física moderno
 * Implementa simulação física usando Vector2D para posição e velocidade
 */
export class PhysicsSystem {
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
      object.velocity.y += CONFIG.PHYSICS.GRAVITY * deltaTime;
      
      // Atualiza a posição
      object.position.x += object.velocity.x * deltaTime;
      object.position.y += object.velocity.y * deltaTime;
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
      objectA.position.x < objectB.position.x + objectB.width &&
      objectA.position.x + objectA.width > objectB.position.x &&
      objectA.position.y < objectB.position.y + objectB.height &&
      objectA.position.y + objectA.height > objectB.position.y
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
      movable.position.x + movable.width - staticObj.position.x,
      staticObj.position.x + staticObj.width - movable.position.x
    );
    
    const overlapY = Math.min(
      movable.position.y + movable.height - staticObj.position.y,
      staticObj.position.y + staticObj.height - movable.position.y
    );
    
    // Move na direção de menor sobreposição
    if (overlapX < overlapY) {
      // Move horizontalmente
      if (movable.position.x < staticObj.position.x) {
        movable.position.x -= overlapX;
      } else {
        movable.position.x += overlapX;
      }
    } else {
      // Move verticalmente
      if (movable.position.y < staticObj.position.y) {
        movable.position.y -= overlapY;
      } else {
        movable.position.y += overlapY;
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
    const centerDiffX = (movable.position.x + movable.width / 2) - (staticObj.position.x + staticObj.width / 2);
    const centerDiffY = (movable.position.y + movable.height / 2) - (staticObj.position.y + staticObj.height / 2);
    
    const minHalfWidth = Math.min(movable.width / 2, staticObj.width / 2);
    const minHalfHeight = Math.min(movable.height / 2, staticObj.height / 2);
    
    // Fator de redução da velocidade (coeficiente de restituição)
    const elasticity = 0.7;
    
    // Colisão horizontal
    if (Math.abs(centerDiffX) > minHalfWidth && Math.abs(centerDiffY) <= minHalfHeight) {
      movable.velocity.x = -movable.velocity.x * elasticity;
    } 
    // Colisão vertical
    else if (Math.abs(centerDiffY) > minHalfHeight && Math.abs(centerDiffX) <= minHalfWidth) {
      movable.velocity.y = -movable.velocity.y * elasticity;
    } 
    // Colisão de canto
    else {
      movable.velocity.x = -movable.velocity.x * elasticity;
      movable.velocity.y = -movable.velocity.y * elasticity;
    }
  }
  
  /**
   * Implementa uma colisão elástica entre dois objetos móveis
   * @param objectA Primeiro objeto
   * @param objectB Segundo objeto
   */
  private elasticCollision(objectA: PhysicsObject, objectB: PhysicsObject): void {
    // Calcula as novas velocidades após a colisão elástica
    
    // Vetor normal entre os centros dos objetos
    const normalX = objectB.position.x - objectA.position.x;
    const normalY = objectB.position.y - objectA.position.y;
    
    // Normaliza o vetor
    const magnitude = Math.sqrt(normalX * normalX + normalY * normalY);
    const unitNormalX = normalX / magnitude;
    const unitNormalY = normalY / magnitude;
    
    // Vetor tangente (perpendicular ao normal)
    const unitTangentX = -unitNormalY;
    const unitTangentY = unitNormalX;
    
    // Projeta velocidades no vetor normal
    const v1n = unitNormalX * objectA.velocity.x + unitNormalY * objectA.velocity.y;
    const v1t = unitTangentX * objectA.velocity.x + unitTangentY * objectA.velocity.y;
    const v2n = unitNormalX * objectB.velocity.x + unitNormalY * objectB.velocity.y;
    const v2t = unitTangentX * objectB.velocity.x + unitTangentY * objectB.velocity.y;
    
    // Calcula as novas velocidades normais após a colisão
    // Usando a fórmula de colisão elástica unidimensional
    const v1nAfter = (v1n * (objectA.mass - objectB.mass) + 2 * objectB.mass * v2n) / 
                   (objectA.mass + objectB.mass);
    const v2nAfter = (v2n * (objectB.mass - objectA.mass) + 2 * objectA.mass * v1n) / 
                   (objectA.mass + objectB.mass);
    
    // Converte de volta para vetores x e y
    // As componentes tangenciais não mudam
    objectA.velocity.x = (unitNormalX * v1nAfter + unitTangentX * v1t) * 0.9; // * 0.9 para simular alguma perda de energia
    objectA.velocity.y = (unitNormalY * v1nAfter + unitTangentY * v1t) * 0.9;
    objectB.velocity.x = (unitNormalX * v2nAfter + unitTangentX * v2t) * 0.9;
    objectB.velocity.y = (unitNormalY * v2nAfter + unitTangentY * v2t) * 0.9;
    
    // Ajusta as posições para evitar interpenetração
    // Movemos os objetos na direção do vetor normal
    const penetrationDepth = 
      (objectA.width + objectB.width) / 2 - magnitude;
    
    if (penetrationDepth > 0) {
      const offsetX = penetrationDepth * unitNormalX * 0.5; // dividimos o movimento entre os dois objetos
      const offsetY = penetrationDepth * unitNormalY * 0.5;
      
      objectA.position.x -= offsetX;
      objectA.position.y -= offsetY;
      objectB.position.x += offsetX;
      objectB.position.y += offsetY;
    }
  }
} 