import { PhysicsObject, CollisionInfo, CollisionResolutionResult } from './physics-object';

/**
 * Classe responsável por resolver colisões entre objetos físicos
 */
export class CollisionResolver {
  // Fator de redução da velocidade (coeficiente de restituição)
  private elasticity: number = 0.7;
  
  /**
   * Cria um novo resolvedor de colisões
   * @param elasticity Coeficiente de restituição (padrão: 0.7)
   */
  constructor(elasticity: number = 0.7) {
    this.elasticity = elasticity;
  }
  
  /**
   * Resolve uma colisão entre dois objetos
   * @param objectA Primeiro objeto
   * @param objectB Segundo objeto
   * @param collisionInfo Informações sobre a colisão
   * @returns Objeto com as novas posições e velocidades
   */
  resolveCollision(
    objectA: PhysicsObject, 
    objectB: PhysicsObject, 
    collisionInfo: CollisionInfo
  ): {
    objectA: CollisionResolutionResult,
    objectB: CollisionResolutionResult
  } {
    // Se não houver colisão, retorna os objetos inalterados
    if (!collisionInfo.hasCollision) {
      return {
        objectA: {
          position: { x: objectA.x, y: objectA.y },
          velocity: { x: objectA.velocityX, y: objectA.velocityY }
        },
        objectB: {
          position: { x: objectB.x, y: objectB.y },
          velocity: { x: objectB.velocityX, y: objectB.velocityY }
        }
      };
    }
    
    // Se objectB é estático, apenas ajusta objectA
    if (objectB.isStatic) {
      return {
        objectA: this.resolveAgainstStatic(objectA, objectB, collisionInfo),
        objectB: {
          position: { x: objectB.x, y: objectB.y },
          velocity: { x: objectB.velocityX, y: objectB.velocityY }
        }
      };
    }
    
    // Se objectA é estático, apenas ajusta objectB
    if (objectA.isStatic) {
      return {
        objectA: {
          position: { x: objectA.x, y: objectA.y },
          velocity: { x: objectA.velocityX, y: objectA.velocityY }
        },
        objectB: this.resolveAgainstStatic(objectB, objectA, collisionInfo)
      };
    }
    
    // Se ambos são dinâmicos, implementa uma colisão elástica
    return this.resolveElasticCollision(objectA, objectB, collisionInfo);
  }
  
  /**
   * Resolve colisão de um objeto contra um objeto estático
   * @param movable Objeto móvel
   * @param staticObj Objeto estático
   * @param collisionInfo Informações da colisão
   * @returns Novas posições e velocidades para o objeto móvel
   */
  private resolveAgainstStatic(
    movable: PhysicsObject, 
    staticObj: PhysicsObject, 
    collisionInfo: CollisionInfo
  ): CollisionResolutionResult {
    // Cria cópias para não modificar os objetos originais
    let newPosX = movable.x;
    let newPosY = movable.y;
    let newVelX = movable.velocityX;
    let newVelY = movable.velocityY;
    
    if (!collisionInfo.overlapX || !collisionInfo.overlapY) {
      return {
        position: { x: newPosX, y: newPosY },
        velocity: { x: newVelX, y: newVelY }
      };
    }
    
    // Ajusta posição para evitar sobreposição
    if (collisionInfo.overlapX < collisionInfo.overlapY) {
      // Move horizontalmente na direção oposta à sobreposição
      if (movable.x < staticObj.x) {
        newPosX -= collisionInfo.overlapX;
      } else {
        newPosX += collisionInfo.overlapX;
      }
      // Inverte velocidade horizontal
      newVelX = -newVelX * this.elasticity;
    } else {
      // Move verticalmente na direção oposta à sobreposição
      if (movable.y < staticObj.y) {
        newPosY -= collisionInfo.overlapY;
      } else {
        newPosY += collisionInfo.overlapY;
      }
      // Inverte velocidade vertical
      newVelY = -newVelY * this.elasticity;
    }
    
    return {
      position: { x: newPosX, y: newPosY },
      velocity: { x: newVelX, y: newVelY }
    };
  }
  
  /**
   * Implementa uma colisão elástica entre dois objetos dinâmicos
   * @param objectA Primeiro objeto
   * @param objectB Segundo objeto
   * @param collisionInfo Informações da colisão
   * @returns Novas posições e velocidades para ambos os objetos
   */
  private resolveElasticCollision(
    objectA: PhysicsObject, 
    objectB: PhysicsObject, 
    collisionInfo: CollisionInfo
  ): {
    objectA: CollisionResolutionResult,
    objectB: CollisionResolutionResult
  } {
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
    
    // Ajusta as posições para evitar que os objetos fiquem presos um no outro
    const adjustedPositions = this.adjustPositionsAfterCollision(objectA, objectB, collisionInfo);
    
    return {
      objectA: {
        position: adjustedPositions.objectA,
        velocity: { x: newVelocityAX, y: newVelocityAY }
      },
      objectB: {
        position: adjustedPositions.objectB,
        velocity: { x: newVelocityBX, y: newVelocityBY }
      }
    };
  }
  
  /**
   * Ajusta as posições de dois objetos após uma colisão
   * @param objectA Primeiro objeto
   * @param objectB Segundo objeto
   * @param collisionInfo Informações da colisão
   * @returns Novas posições para ambos objetos
   */
  private adjustPositionsAfterCollision(
    objectA: PhysicsObject, 
    objectB: PhysicsObject,
    collisionInfo: CollisionInfo
  ): {
    objectA: { x: number, y: number },
    objectB: { x: number, y: number }
  } {
    // Usa o vetor normal da colisão para separar os objetos
    if (!collisionInfo.normal) {
      return {
        objectA: { x: objectA.x, y: objectA.y },
        objectB: { x: objectB.x, y: objectB.y }
      };
    }
    
    const normal = collisionInfo.normal;
    
    // Calcula a sobreposição
    const minHalfWidth = Math.min(objectA.width / 2, objectB.width / 2);
    const minHalfHeight = Math.min(objectA.height / 2, objectB.height / 2);
    
    // Distância entre os centros
    const centerAX = objectA.x + objectA.width / 2;
    const centerAY = objectA.y + objectA.height / 2;
    const centerBX = objectB.x + objectB.width / 2;
    const centerBY = objectB.y + objectB.height / 2;
    
    const dx = centerBX - centerAX;
    const dy = centerBY - centerAY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Cálculo da sobreposição
    const overlap = (objectA.width / 2 + objectB.width / 2) - distance;
    
    // Novas posições
    let newAX = objectA.x;
    let newAY = objectA.y;
    let newBX = objectB.x;
    let newBY = objectB.y;
    
    if (overlap > 0 && distance > 0) {
      // Move os objetos na direção oposta à sobreposição
      const moveRatioA = objectB.mass / (objectA.mass + objectB.mass);
      const moveRatioB = objectA.mass / (objectA.mass + objectB.mass);
      
      newAX = objectA.x - normal.x * overlap * moveRatioA;
      newAY = objectA.y - normal.y * overlap * moveRatioA;
      
      newBX = objectB.x + normal.x * overlap * moveRatioB;
      newBY = objectB.y + normal.y * overlap * moveRatioB;
    }
    
    return {
      objectA: { x: newAX, y: newAY },
      objectB: { x: newBX, y: newBY }
    };
  }
} 