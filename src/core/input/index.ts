// Exportação dos tipos e interfaces
export * from './input-types';

// Exportação dos componentes individuais
export { KeyboardController } from './keyboard-controller';
export { MouseController } from './mouse-controller';
export { TouchController } from './touch-controller';
export { ActionMapper } from './action-mapper';
export { InputManager } from './input-manager';

// Exportação por padrão do gerenciador de input
import { InputManager } from './input-manager';
export default InputManager; 