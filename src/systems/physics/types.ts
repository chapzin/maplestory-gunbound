import { CONFIG } from '../../core/config';

/**
 * Interface para representar um vetor 2D
 */
export interface Vector2D {
  x: number;
  y: number;
}

/**
 * Interface para objetos que interagem com o sistema de física moderno
 */
export interface ModernPhysicsObject {
  // Posição e velocidade como vetores
  position: Vector2D;
  velocity: Vector2D;
  
  // Propriedades físicas
  mass: number;
  isStatic: boolean;
  width: number;
  height: number;
}

/**
 * Interface para objetos que interagem com o sistema de física legado
 * Mantida para compatibilidade com código existente
 */
export interface LegacyPhysicsObject {
  // Posição e velocidade como propriedades individuais
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
 * Alias para o tipo de objeto físico usado no sistema atual
 * Isso permite flexibilidade para alternar entre implementações
 */
export type PhysicsObject = ModernPhysicsObject;

/**
 * Funções utilitárias para conversão entre tipos
 */
export const PhysicsUtils = {
  /**
   * Converte um objeto físico moderno para o formato legado
   */
  modernToLegacy(obj: ModernPhysicsObject): LegacyPhysicsObject {
    return {
      x: obj.position.x,
      y: obj.position.y,
      velocityX: obj.velocity.x,
      velocityY: obj.velocity.y,
      mass: obj.mass,
      isStatic: obj.isStatic,
      width: obj.width,
      height: obj.height
    };
  },
  
  /**
   * Converte um objeto físico legado para o formato moderno
   */
  legacyToModern(obj: LegacyPhysicsObject): ModernPhysicsObject {
    return {
      position: { x: obj.x, y: obj.y },
      velocity: { x: obj.velocityX, y: obj.velocityY },
      mass: obj.mass,
      isStatic: obj.isStatic,
      width: obj.width,
      height: obj.height
    };
  }
}; 