import { PhysicsObject, Vector2D } from './physics-object';
import { CONFIG } from '../../core/config';

/**
 * Classe responsável por calcular e aplicar forças em objetos físicos
 */
export class ForceCalculator {
  /**
   * Aplica gravidade a um objeto
   * @param object Objeto a receber a gravidade
   * @param deltaTime Tempo desde o último frame em segundos
   * @returns Nova velocidade após aplicação da gravidade
   */
  applyGravity(object: PhysicsObject, deltaTime: number): Vector2D {
    if (object.isStatic) {
      return { x: object.velocityX, y: object.velocityY };
    }
    
    return {
      x: object.velocityX,
      y: object.velocityY + CONFIG.PHYSICS.GRAVITY * deltaTime
    };
  }
  
  /**
   * Aplica uma força a um objeto
   * @param object Objeto a receber a força
   * @param forceX Componente X da força
   * @param forceY Componente Y da força
   * @returns Nova velocidade após aplicação da força
   */
  applyForce(object: PhysicsObject, forceX: number, forceY: number): Vector2D {
    if (object.isStatic) {
      return { x: object.velocityX, y: object.velocityY };
    }
    
    // F = m * a => a = F / m
    return {
      x: object.velocityX + forceX / object.mass,
      y: object.velocityY + forceY / object.mass
    };
  }
  
  /**
   * Aplica uma força de impulso (instantânea) a um objeto
   * @param object Objeto a receber o impulso
   * @param impulseX Componente X do impulso
   * @param impulseY Componente Y do impulso
   * @returns Nova velocidade após aplicação do impulso
   */
  applyImpulse(object: PhysicsObject, impulseX: number, impulseY: number): Vector2D {
    if (object.isStatic) {
      return { x: object.velocityX, y: object.velocityY };
    }
    
    // Impulso = alteração direta na velocidade
    return {
      x: object.velocityX + impulseX / object.mass,
      y: object.velocityY + impulseY / object.mass
    };
  }
  
  /**
   * Calcula a nova posição baseada na velocidade
   * @param object Objeto a ser atualizado
   * @param deltaTime Tempo desde o último frame em segundos
   * @returns Nova posição após o movimento
   */
  calculateNewPosition(object: PhysicsObject, deltaTime: number): Vector2D {
    if (object.isStatic) {
      return { x: object.x, y: object.y };
    }
    
    return {
      x: object.x + object.velocityX * deltaTime,
      y: object.y + object.velocityY * deltaTime
    };
  }
  
  /**
   * Aplica resistência do ar para desacelerar objetos
   * @param object Objeto a receber a resistência
   * @param dragCoefficient Coeficiente de arrasto (padrão: 0.01)
   * @returns Nova velocidade após aplicação da resistência
   */
  applyDrag(object: PhysicsObject, dragCoefficient: number = 0.01): Vector2D {
    if (object.isStatic) {
      return { x: object.velocityX, y: object.velocityY };
    }
    
    // Resistência do ar proporcional ao quadrado da velocidade
    const speed = Math.sqrt(object.velocityX * object.velocityX + object.velocityY * object.velocityY);
    
    if (speed > 0) {
      const dragForceX = -dragCoefficient * object.velocityX * speed;
      const dragForceY = -dragCoefficient * object.velocityY * speed;
      
      return this.applyForce(object, dragForceX, dragForceY);
    }
    
    return { x: object.velocityX, y: object.velocityY };
  }
} 