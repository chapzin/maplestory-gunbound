import { PhysicsObject, CollisionInfo, Vector2D } from './physics-object';

/**
 * Classe responsável por detectar colisões entre objetos físicos
 */
export class CollisionDetector {
  /**
   * Verifica se há colisão entre dois objetos
   * @param objectA Primeiro objeto
   * @param objectB Segundo objeto
   * @returns Informações sobre a colisão
   */
  detectCollision(objectA: PhysicsObject, objectB: PhysicsObject): CollisionInfo {
    // Colisão AABB (Axis-Aligned Bounding Box)
    const hasCollision = (
      objectA.x < objectB.x + objectB.width &&
      objectA.x + objectA.width > objectB.x &&
      objectA.y < objectB.y + objectB.height &&
      objectA.y + objectA.height > objectB.y
    );
    
    // Se não houver colisão, retorna imediatamente
    if (!hasCollision) {
      return { hasCollision: false };
    }
    
    // Calcula a sobreposição em cada eixo
    const overlapX = Math.min(
      objectA.x + objectA.width - objectB.x,
      objectB.x + objectB.width - objectA.x
    );
    
    const overlapY = Math.min(
      objectA.y + objectA.height - objectB.y,
      objectB.y + objectB.height - objectA.y
    );
    
    // Calcular o vetor normal da colisão
    const centerAX = objectA.x + objectA.width / 2;
    const centerAY = objectA.y + objectA.height / 2;
    
    const centerBX = objectB.x + objectB.width / 2;
    const centerBY = objectB.y + objectB.height / 2;
    
    const directionX = centerBX - centerAX;
    const directionY = centerBY - centerAY;
    
    // Normaliza o vetor direção (se possível)
    const length = Math.sqrt(directionX * directionX + directionY * directionY);
    let normalX = 0;
    let normalY = 0;
    
    if (length > 0) {
      normalX = directionX / length;
      normalY = directionY / length;
    } else {
      // Se os centros estiverem no mesmo ponto, use uma direção padrão
      normalX = 0;
      normalY = -1;
    }
    
    return {
      hasCollision: true,
      overlapX,
      overlapY,
      normal: { x: normalX, y: normalY }
    };
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
  
  /**
   * Detecta colisões entre múltiplos objetos
   * @param objects Lista de objetos físicos
   * @returns Array de pares de objetos que colidiram e suas informações de colisão
   */
  detectCollisionsInGroup(objects: PhysicsObject[]): Array<{
    objectA: PhysicsObject,
    objectB: PhysicsObject,
    collisionInfo: CollisionInfo
  }> {
    const collisions = [];
    const length = objects.length;
    
    // Verifica cada par de objetos
    for (let i = 0; i < length; i++) {
      const objectA = objects[i];
      
      for (let j = i + 1; j < length; j++) {
        const objectB = objects[j];
        
        // Pula verificação se ambos forem estáticos
        if (objectA.isStatic && objectB.isStatic) continue;
        
        // Verifica colisão
        const collisionInfo = this.detectCollision(objectA, objectB);
        
        if (collisionInfo.hasCollision) {
          collisions.push({ objectA, objectB, collisionInfo });
        }
      }
    }
    
    return collisions;
  }
} 