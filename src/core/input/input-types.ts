/**
 * Tipos de eventos de input
 */
export enum InputEventType {
  KEY_DOWN = 'keyDown',
  KEY_UP = 'keyUp',
  MOUSE_DOWN = 'mouseDown',
  MOUSE_UP = 'mouseUp',
  MOUSE_MOVE = 'mouseMove',
  TOUCH_START = 'touchStart',
  TOUCH_END = 'touchEnd',
  TOUCH_MOVE = 'touchMove'
}

/**
 * Tipos de ações que podem ser mapeadas para inputs
 */
export enum GameAction {
  MOVE_LEFT = 'moveLeft',
  MOVE_RIGHT = 'moveRight',
  INCREASE_ANGLE = 'increaseAngle',
  DECREASE_ANGLE = 'decreaseAngle',
  INCREASE_POWER = 'increasePower',
  DECREASE_POWER = 'decreasePower',
  FIRE = 'fire',
  END_TURN = 'endTurn',
  PAUSE = 'pause',
  CONFIRM = 'confirm',
  CANCEL = 'cancel'
}

/**
 * Dados para eventos de teclado
 */
export interface KeyEventData {
  key: string;
  code: string;
  altKey: boolean;
  ctrlKey: boolean;
  shiftKey: boolean;
  repeat: boolean;
  action?: GameAction;
  originalEvent?: KeyboardEvent;
}

/**
 * Dados para eventos de mouse
 */
export interface MouseEventData {
  x: number;
  y: number;
  button: number;
  altKey: boolean;
  ctrlKey: boolean;
  shiftKey: boolean;
  action?: GameAction;
  originalEvent?: MouseEvent;
}

/**
 * Dados para eventos de toque
 */
export interface TouchEventData {
  touches: { x: number, y: number }[];
  changedTouches: { x: number, y: number }[];
  altKey: boolean;
  ctrlKey: boolean;
  shiftKey: boolean;
  action?: GameAction;
  originalEvent?: TouchEvent;
}

/**
 * Mapeamento de teclas para ações do jogo
 */
export interface KeyMapping {
  [key: string]: GameAction;
}

/**
 * Posição do mouse ou toque
 */
export interface PointerPosition {
  x: number;
  y: number;
}

/**
 * Interface para controladores de input
 */
export interface IInputController {
  initialize(element: HTMLElement): void;
  setEnabled(enabled: boolean): void;
  isEnabled(): boolean;
  dispose(): void;
}

/**
 * Opções para configuração do input
 */
export interface InputOptions {
  preventContextMenu?: boolean;
  preventDefaultTouchBehavior?: boolean;
  touchToMouseEmulation?: boolean;
  keyRepeatEnabled?: boolean;
}