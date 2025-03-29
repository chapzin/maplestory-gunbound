import * as PIXI from 'pixi.js';
import { BaseUIElement } from './ui-element';

/**
 * Elemento de barra de progresso para UI
 */
export class ProgressBarElement extends BaseUIElement {
  private background: PIXI.Graphics;
  private foreground: PIXI.Graphics;
  private container: PIXI.Container;
  private width: number;
  private height: number;
  private value: number = 0;
  private maxValue: number = 100;
  private backgroundColor: number;
  private fillColor: number;
  
  constructor(
    id: string, 
    x: number, 
    y: number, 
    width: number, 
    height: number, 
    value: number = 0,
    maxValue: number = 100,
    backgroundColor: number = 0x333333,
    fillColor: number = 0x00CC00
  ) {
    // Cria o container
    const container = new PIXI.Container();
    container.position.set(x, y);
    
    // Cria o fundo da barra
    const background = new PIXI.Graphics();
    background.beginFill(backgroundColor);
    background.drawRoundedRect(0, 0, width, height, 4);
    background.endFill();
    
    // Cria a barra de preenchimento
    const foreground = new PIXI.Graphics();
    
    // Adiciona ao container
    container.addChild(background);
    container.addChild(foreground);
    
    // Inicializa a classe base
    super(id, container);
    
    // Armazena referências
    this.container = container;
    this.background = background;
    this.foreground = foreground;
    this.width = width;
    this.height = height;
    this.value = value;
    this.maxValue = maxValue;
    this.backgroundColor = backgroundColor;
    this.fillColor = fillColor;
    
    // Atualiza a visualização inicial
    this.updateVisual();
  }
  
  /**
   * Define o valor atual da barra
   * @param value Valor atual
   */
  setValue(value: number): void {
    this.value = Math.max(0, Math.min(value, this.maxValue));
    this.updateVisual();
  }
  
  /**
   * Define o valor máximo da barra
   * @param maxValue Valor máximo
   */
  setMaxValue(maxValue: number): void {
    this.maxValue = maxValue;
    this.value = Math.min(this.value, this.maxValue);
    this.updateVisual();
  }
  
  /**
   * Obtém o valor atual
   * @returns Valor atual
   */
  getValue(): number {
    return this.value;
  }
  
  /**
   * Obtém o valor percentual (0-100%)
   * @returns Percentual de preenchimento
   */
  getPercent(): number {
    return (this.value / this.maxValue) * 100;
  }
  
  /**
   * Atualiza a visualização da barra
   */
  private updateVisual(): void {
    const fillWidth = (this.value / this.maxValue) * this.width;
    
    this.foreground.clear();
    this.foreground.beginFill(this.fillColor);
    this.foreground.drawRoundedRect(0, 0, fillWidth, this.height, 4);
    this.foreground.endFill();
  }
  
  /**
   * Atualiza a barra de progresso
   * @param delta Delta time
   * @param value Novo valor (opcional)
   */
  update(delta: number, value?: number): void {
    if (value !== undefined) {
      this.setValue(value);
    }
  }
} 