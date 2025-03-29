import * as PIXI from 'pixi.js';

/**
 * Interface para elementos de UI
 */
export interface UIElement {
  id: string;
  displayObject: PIXI.DisplayObject;
  visible: boolean;
  setVisible(visible: boolean): void;
  update(delta: number, ...args: any[]): void;
  destroy(): void;
}

/**
 * Implementação básica de um elemento de UI
 */
export abstract class BaseUIElement implements UIElement {
  id: string;
  displayObject: PIXI.DisplayObject;
  visible: boolean;
  
  constructor(id: string, displayObject: PIXI.DisplayObject) {
    this.id = id;
    this.displayObject = displayObject;
    this.visible = displayObject.visible;
  }
  
  setVisible(visible: boolean): void {
    this.visible = visible;
    this.displayObject.visible = visible;
  }
  
  /**
   * Atualiza o elemento
   * @param delta Delta time
   * @param args Argumentos adicionais
   */
  update(delta: number, ...args: any[]): void {
    // Implementação base vazia, a ser sobrescrita pelas subclasses
  }
  
  /**
   * Destrói o elemento e libera recursos
   */
  destroy(): void {
    this.displayObject.destroy({ children: true });
  }
} 