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
 * Tipo para vetores 2D utilizados nos cálculos de física
 */
export type Vector2D = {
  x: number;
  y: number;
}

/**
 * Tipo para detectar colisões entre objetos
 */
export type CollisionInfo = {
  hasCollision: boolean;
  overlapX?: number;
  overlapY?: number;
  normal?: Vector2D;
}

/**
 * Tipo para o resultado da resolução de colisão
 */
export type CollisionResolutionResult = {
  position: Vector2D;
  velocity: Vector2D;
} 