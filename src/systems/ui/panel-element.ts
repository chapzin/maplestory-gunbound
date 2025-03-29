import * as PIXI from 'pixi.js';
import { BaseUIElement } from './base-ui-element';
import { PanelOptions, UIElement } from './ui-types';

/**
 * Elemento de painel para UI
 * Funciona como um container para outros elementos com fundo personalizável
 */
export class PanelElement extends BaseUIElement {
  private background: PIXI.Graphics;
  private childContainer: PIXI.Container;
  private mainContainer: PIXI.Container;
  
  private width: number;
  private height: number;
  private backgroundColor: number;
  private borderColor: number;
  private borderWidth: number;
  private cornerRadius: number;
  private padding: number;
  private alpha: number;
  
  /**
   * Cria um novo painel
   * @param id Identificador único do elemento
   * @param x Posição X
   * @param y Posição Y
   * @param options Opções do painel
   */
  constructor(
    id: string, 
    x: number, 
    y: number, 
    options: PanelOptions
  ) {
    // Extrai opções com valores padrão
    const {
      width, 
      height, 
      backgroundColor = 0x000000,
      borderColor = 0xFFFFFF,
      borderWidth = 0,
      cornerRadius = 0,
      padding = 0,
      alpha = 1
    } = options;
    
    // Cria o container principal
    const mainContainer = new PIXI.Container();
    mainContainer.position.set(x, y);
    
    // Cria o fundo do painel
    const background = new PIXI.Graphics();
    
    // Cria o container para elementos filhos
    const childContainer = new PIXI.Container();
    childContainer.position.set(padding, padding);
    
    // Adiciona elementos ao container principal
    mainContainer.addChild(background);
    mainContainer.addChild(childContainer);
    
    // Inicializa a classe base
    super(id, mainContainer);
    
    // Armazena referências
    this.mainContainer = mainContainer;
    this.background = background;
    this.childContainer = childContainer;
    
    // Armazena as propriedades
    this.width = width;
    this.height = height;
    this.backgroundColor = backgroundColor;
    this.borderColor = borderColor;
    this.borderWidth = borderWidth;
    this.cornerRadius = cornerRadius;
    this.padding = padding;
    this.alpha = alpha;
    
    // Atualiza a visualização inicial
    this.updateVisual();
  }
  
  /**
   * Atualiza a visualização do painel
   */
  private updateVisual(): void {
    this.background.clear();
    
    // Desenha a borda se necessário
    if (this.borderWidth > 0) {
      this.background.lineStyle(this.borderWidth, this.borderColor);
    }
    
    // Desenha o fundo
    this.background.beginFill(this.backgroundColor, this.alpha);
    this.background.drawRoundedRect(0, 0, this.width, this.height, this.cornerRadius);
    this.background.endFill();
  }
  
  /**
   * Adiciona um elemento filho ao painel
   * @param element Elemento UI para adicionar
   */
  addChild(element: UIElement): void {
    this.childContainer.addChild(element.displayObject);
  }
  
  /**
   * Remove um elemento filho do painel
   * @param element Elemento UI para remover
   * @returns true se o elemento foi removido, false caso contrário
   */
  removeChild(element: UIElement): boolean {
    if (this.childContainer.children.includes(element.displayObject)) {
      this.childContainer.removeChild(element.displayObject);
      return true;
    }
    return false;
  }
  
  /**
   * Remove um elemento filho do painel pelo ID
   * @param id ID do elemento para remover
   * @returns true se o elemento foi removido, false caso contrário
   */
  removeChildById(id: string): boolean {
    for (let i = 0; i < this.childContainer.children.length; i++) {
      const child = this.childContainer.children[i];
      if ((child as any).id === id) {
        this.childContainer.removeChildAt(i);
        return true;
      }
    }
    return false;
  }
  
  /**
   * Limpa todos os elementos filhos
   */
  clearChildren(): void {
    this.childContainer.removeChildren();
  }
  
  /**
   * Define a largura e altura do painel
   * @param width Nova largura
   * @param height Nova altura
   */
  resize(width: number, height: number): void {
    this.width = width;
    this.height = height;
    this.updateVisual();
  }
  
  /**
   * Define a cor de fundo
   * @param color Nova cor de fundo
   */
  setBackgroundColor(color: number): void {
    this.backgroundColor = color;
    this.updateVisual();
  }
  
  /**
   * Define a cor da borda
   * @param color Nova cor de borda
   */
  setBorderColor(color: number): void {
    this.borderColor = color;
    this.updateVisual();
  }
  
  /**
   * Define a largura da borda
   * @param width Nova largura de borda
   */
  setBorderWidth(width: number): void {
    this.borderWidth = width;
    this.updateVisual();
  }
  
  /**
   * Define o raio dos cantos arredondados
   * @param radius Novo raio
   */
  setCornerRadius(radius: number): void {
    this.cornerRadius = radius;
    this.updateVisual();
  }
  
  /**
   * Define o padding interno
   * @param padding Novo padding
   */
  setPadding(padding: number): void {
    this.padding = padding;
    this.childContainer.position.set(padding, padding);
    this.updateVisual();
  }
  
  /**
   * Define a transparência do painel
   * @param alpha Valor de alpha (0-1)
   */
  setAlpha(alpha: number): void {
    this.alpha = Math.max(0, Math.min(1, alpha));
    this.updateVisual();
  }
  
  /**
   * Atualiza o painel e seus filhos
   * @param delta Delta time
   */
  update(delta: number): void {
    // Atualiza os elementos filhos
    for (const child of this.childContainer.children) {
      if ((child as any).update && typeof (child as any).update === 'function') {
        (child as any).update(delta);
      }
    }
  }
  
  /**
   * Destrói o painel e seus filhos
   */
  destroy(): void {
    // Limpa os elementos filhos
    this.clearChildren();
    
    // Chama destroy da classe base
    super.destroy();
  }
} 