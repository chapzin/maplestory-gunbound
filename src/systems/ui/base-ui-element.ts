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
   * Verifica se o elemento está visível
   * @returns Estado de visibilidade
   */
  isVisible(): boolean {
    return this.visible;
  }
  
  /**
   * Define a posição do elemento
   * @param x Posição X
   * @param y Posição Y
   */
  setPosition(x: number, y: number): void {
    this.displayObject.position.set(x, y);
  }
  
  /**
   * Obtém a posição atual do elemento
   * @returns Objeto com coordenadas x e y
   */
  getPosition(): { x: number, y: number } {
    return { 
      x: this.displayObject.position.x,
      y: this.displayObject.position.y
    };
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