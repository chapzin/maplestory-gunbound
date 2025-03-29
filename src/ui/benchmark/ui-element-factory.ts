import * as PIXI from 'pixi.js';
import { IUIElementFactory } from './benchmark-interfaces';
import { UISystem } from '../../core/ui/ui-system';

/**
 * Implementação concreta da factory de elementos UI
 * Encapsula a criação de elementos visuais usando PIXI.js
 */
export class UIElementFactory implements IUIElementFactory {
  private uiSystem: UISystem;
  
  /**
   * Inicializa a factory com o sistema de UI
   * @param uiSystem Sistema de UI para criar elementos
   */
  constructor(uiSystem: UISystem) {
    this.uiSystem = uiSystem;
  }
  
  /**
   * Cria um elemento de texto
   */
  createText(id: string, text: string, x: number, y: number, style?: Partial<PIXI.TextStyle>) {
    return this.uiSystem.createText(id, text, x, y, style);
  }
  
  /**
   * Cria um elemento de botão
   */
  createButton(
    id: string, 
    label: string, 
    x: number, 
    y: number, 
    width: number, 
    height: number, 
    onClick: () => void, 
    style?: Partial<PIXI.TextStyle>
  ) {
    return this.uiSystem.createButton(id, label, x, y, width, height, onClick, style);
  }
  
  /**
   * Cria uma barra de progresso
   */
  createProgressBar(
    id: string, 
    x: number, 
    y: number, 
    width: number, 
    height: number, 
    value: number = 0, 
    maxValue: number = 100, 
    bgColor: number = 0x333333, 
    fillColor: number = 0x00CC00
  ) {
    return this.uiSystem.createProgressBar(
      id, x, y, width, height, value, maxValue, bgColor, fillColor
    );
  }
  
  /**
   * Cria um container PIXI
   */
  createContainer(x: number, y: number): PIXI.Container {
    const container = new PIXI.Container();
    container.position.set(x, y);
    return container;
  }
  
  /**
   * Cria um painel (retângulo com preenchimento)
   */
  createPanel(
    x: number, 
    y: number, 
    width: number, 
    height: number, 
    bgColor: number = 0x000000, 
    alpha: number = 0.8
  ): PIXI.Graphics {
    const panel = new PIXI.Graphics();
    panel.beginFill(bgColor, alpha);
    panel.drawRect(0, 0, width, height);
    panel.endFill();
    panel.position.set(x, y);
    return panel;
  }
} 