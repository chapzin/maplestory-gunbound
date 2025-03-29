import * as PIXI from 'pixi.js';
import { BaseUIElement } from './base-ui-element';
import { TextStyle } from './ui-types';

/**
 * Elemento de texto para UI
 */
export class TextElement extends BaseUIElement {
  private textObject: PIXI.Text;
  
  /**
   * Cria um novo elemento de texto
   * @param id Identificador único do elemento 
   * @param text Texto a ser exibido
   * @param style Estilo do texto
   * @param x Posição X
   * @param y Posição Y
   */
  constructor(id: string, text: string, style: TextStyle, x: number, y: number) {
    const textObject = new PIXI.Text(text, style);
    textObject.position.set(x, y);
    super(id, textObject);
    this.textObject = textObject;
  }
  
  /**
   * Define o texto do elemento
   * @param text Novo texto
   */
  setText(text: string): void {
    this.textObject.text = text;
  }
  
  /**
   * Obtém o texto atual
   * @returns Texto atual
   */
  getText(): string {
    return this.textObject.text;
  }
  
  /**
   * Define o estilo do texto
   * @param style Novo estilo
   */
  setStyle(style: TextStyle): void {
    Object.assign(this.textObject.style, style);
  }
  
  /**
   * Define a posição do texto
   * @param x Posição X
   * @param y Posição Y
   */
  setPosition(x: number, y: number): void {
    this.textObject.position.set(x, y);
  }
  
  /**
   * Define a âncora do texto (ponto de origem)
   * @param x Âncora X (0-1)
   * @param y Âncora Y (0-1)
   */
  setAnchor(x: number, y: number): void {
    this.textObject.anchor.set(x, y);
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