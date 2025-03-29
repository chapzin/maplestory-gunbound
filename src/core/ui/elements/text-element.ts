import * as PIXI from 'pixi.js';
import { BaseUIElement } from './ui-element';

/**
 * Elemento de texto para UI
 */
export class TextElement extends BaseUIElement {
  private textObject: PIXI.Text;
  
  constructor(id: string, text: string, style: PIXI.TextStyle | Partial<PIXI.TextStyle>, x: number, y: number) {
    const textObject = new PIXI.Text(text, style);
    textObject.position.set(x, y);
    super(id, textObject);
    this.textObject = textObject;
  }
  
  setText(text: string): void {
    this.textObject.text = text;
  }
  
  getText(): string {
    return this.textObject.text;
  }
  
  /**
   * Atualiza o elemento de texto
   * @param delta Delta time
   * @param text Novo texto (opcional)
   */
  update(delta: number, text?: string): void {
    if (text !== undefined) {
      this.setText(text);
    }
  }
} 