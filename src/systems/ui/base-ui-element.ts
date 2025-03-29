import * as PIXI from 'pixi.js';
import { UIElement } from './ui-types';

/**
 * Implementação básica de um elemento de UI
 */
export abstract class BaseUIElement implements UIElement {
  id: string;
  displayObject: PIXI.DisplayObject;
  visible: boolean;
  
  /**
   * Inicializa um novo elemento base de UI
   * @param id Identificador único do elemento
   * @param displayObject Objeto visual PIXI que representa este elemento
   */
  constructor(id: string, displayObject: PIXI.DisplayObject) {
    this.id = id;
    this.displayObject = displayObject;
    this.visible = displayObject.visible;
  }
  
  /**
   * Define a visibilidade do elemento
   * @param visible Estado de visibilidade
   */
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