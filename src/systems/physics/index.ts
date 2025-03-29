// Re-exportações do sistema de física
export * from './types';
export * from './physics-system';

// Uma instância global para conveniência
import { PhysicsSystem } from './physics-system';
export const Physics = new PhysicsSystem();

// Exportação de todos os componentes do sistema de física
export { PhysicsObject, Vector2D, CollisionInfo, CollisionResolutionResult } from './physics-object';
export { CollisionDetector } from './collision-detector';
export { CollisionResolver } from './collision-resolver';
export { ForceCalculator } from './force-calculator';
export { PhysicsEngine } from './physics-engine';

// Exportação por padrão do engine de física para compatibilidade com código existente
import { PhysicsEngine } from './physics-engine';
export default PhysicsEngine; 