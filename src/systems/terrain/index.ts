// Exportação dos tipos e interfaces
export * from './terrain-data';

// Exportação dos componentes individuais
export { TerrainGenerator } from './terrain-generator';
export { TerrainRenderer } from './terrain-renderer';
export { TerrainPhysics } from './terrain-physics';
export { TerrainUtility } from './terrain-utility';
export { TerrainManager } from './terrain-manager';

// Exportação por padrão do gerenciador de terreno
import { TerrainManager } from './terrain-manager';
export default TerrainManager; 