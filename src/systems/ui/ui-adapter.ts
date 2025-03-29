import * as PIXI from 'pixi.js';
import { UISystem } from './ui-system';
import { UIElement, TextStyle, ButtonOptions, ProgressBarOptions, PanelOptions } from './ui-types';
import { TextElement } from './text-element';
import { ButtonElement } from './button-element';
import { ProgressBarElement } from './progress-bar-element';
import { PanelElement } from './panel-element';

/**
 * Adaptador para compatibilidade com o antigo UISystem
 * Mantém a mesma API do sistema antigo, mas utiliza os novos componentes internamente
 */
export class UIAdapter {
  private uiSystem: UISystem;
  
  /**
   * Cria um novo adaptador
   * @param container Container PIXI para elementos de UI
   */
  constructor(container: PIXI.Container) {
    this.uiSystem = new UISystem(container);
  }
  
  /**
   * Obtém o sistema de UI interno
   * @returns Sistema de UI
   */
  getUISystem(): UISystem {
    return this.uiSystem;
  }
  
  /**
   * Obtém o container
   */
  get container(): PIXI.Container {
    return this.uiSystem.container;
  }
  
  /**
   * Adiciona um elemento à UI
   * @param element Elemento a ser adicionado
   */
  addElement(element: UIElement): void {
    this.uiSystem.addElement(element);
  }
  
  /**
   * Remove um elemento da UI pelo ID
   * @param id ID do elemento a ser removido
   * @returns Verdadeiro se o elemento foi removido
   */
  removeElement(id: string): boolean {
    return this.uiSystem.removeElement(id);
  }
  
  /**
   * Obtém um elemento pelo ID
   * @param id ID do elemento
   * @returns Elemento ou undefined se não encontrado
   */
  getElement<T extends UIElement>(id: string): T | undefined {
    return this.uiSystem.getElement<T>(id);
  }
  
  /**
   * Atualiza todos os elementos
   * @param delta Delta time
   */
  update(delta: number): void {
    this.uiSystem.update(delta);
  }
  
  /**
   * Cria e adiciona um texto
   * @param id ID do elemento
   * @param text Texto
   * @param x Posição X
   * @param y Posição Y
   * @param style Estilo do texto
   * @returns O elemento criado
   */
  createText(
    id: string, 
    text: string, 
    x: number, 
    y: number, 
    style?: Partial<PIXI.TextStyle>
  ): TextElement {
    return this.uiSystem.createText(id, text, x, y, style) as unknown as TextElement;
  }
  
  /**
   * Cria e adiciona um botão
   * @param id ID do elemento
   * @param text Texto do botão
   * @param x Posição X
   * @param y Posição Y
   * @param width Largura
   * @param height Altura
   * @param onClick Função de callback para clique
   * @param style Estilo do texto
   * @returns O elemento criado
   */
  createButton(
    id: string, 
    text: string, 
    x: number, 
    y: number, 
    width: number, 
    height: number,
    onClick: () => void,
    style?: Partial<PIXI.TextStyle>
  ): ButtonElement {
    const options: ButtonOptions = {
      width,
      height,
      textStyle: style || {}
    };
    
    return this.uiSystem.getFactory().createButton(id, text, x, y, options, onClick) as unknown as ButtonElement;
  }
  
  /**
   * Cria e adiciona uma barra de progresso
   * @param id ID do elemento
   * @param x Posição X
   * @param y Posição Y
   * @param width Largura
   * @param height Altura
   * @param value Valor inicial
   * @param maxValue Valor máximo
   * @param backgroundColor Cor de fundo
   * @param fillColor Cor de preenchimento
   * @returns O elemento criado
   */
  createProgressBar(
    id: string, 
    x: number, 
    y: number, 
    width: number, 
    height: number,
    value: number = 0,
    maxValue: number = 100,
    backgroundColor: number = 0x333333,
    fillColor: number = 0x00CC00
  ): ProgressBarElement {
    const options: ProgressBarOptions = {
      width,
      height,
      value,
      maxValue,
      backgroundColor,
      fillColor
    };
    
    return this.uiSystem.getFactory().createProgressBar(id, x, y, options) as unknown as ProgressBarElement;
  }
  
  /**
   * Cria e adiciona um painel
   * @param id ID do elemento
   * @param x Posição X
   * @param y Posição Y
   * @param width Largura
   * @param height Altura
   * @param backgroundColor Cor de fundo
   * @param borderColor Cor da borda
   * @param borderWidth Largura da borda
   * @returns O elemento criado
   */
  createPanel(
    id: string,
    x: number,
    y: number,
    width: number,
    height: number,
    backgroundColor: number = 0x000000,
    borderColor: number = 0xFFFFFF,
    borderWidth: number = 0
  ): PanelElement {
    const options: PanelOptions = {
      width,
      height,
      backgroundColor,
      borderColor,
      borderWidth
    };
    
    return this.uiSystem.getFactory().createPanel(id, x, y, options) as unknown as PanelElement;
  }
  
  /**
   * Limpa todos os elementos de UI
   */
  clear(): void {
    this.uiSystem.clear();
  }
  
  /**
   * Mostra ou esconde todos os elementos
   * @param visible Estado de visibilidade
   */
  setAllVisible(visible: boolean): void {
    this.uiSystem.setAllVisible(visible);
  }
  
  /**
   * Obtém todos os IDs de elementos registrados
   * @returns Array de IDs
   */
  getElementIds(): string[] {
    return this.uiSystem.getElementIds();
  }
  
  /**
   * Registra um callback para eventos
   * @param event Nome do evento
   * @param listener Função de callback
   * @returns This para encadeamento
   */
  on(event: string | symbol, listener: (...args: any[]) => void): this {
    this.uiSystem.on(event, listener);
    return this;
  }
  
  /**
   * Remove um callback de eventos
   * @param event Nome do evento
   * @param listener Função de callback
   * @returns This para encadeamento
   */
  off(event: string | symbol, listener: (...args: any[]) => void): this {
    this.uiSystem.off(event, listener);
    return this;
  }
  
  /**
   * Vincula um elemento de UI a um modelo de dados
   * @param element Elemento UI
   * @param path Caminho no modelo de dados
   */
  bind<T>(element: UIElement, path: string): void {
    // Determina como fazer o binding com base no tipo de elemento
    if (element instanceof TextElement) {
      this.uiSystem.getBinding().bind<string>(
        element, 
        path,
        (el, value) => (el as unknown as TextElement).setText(value),
        (el) => (el as unknown as TextElement).getText()
      );
    } else if (element instanceof ProgressBarElement) {
      this.uiSystem.getBinding().bind<number>(
        element,
        path,
        (el, value) => (el as unknown as ProgressBarElement).setValue(value),
        (el) => (el as unknown as ProgressBarElement).getValue()
      );
    }
    // Adicione mais tipos conforme necessário
  }
  
  /**
   * Destrói todos os recursos
   */
  destroy(): void {
    this.uiSystem.destroy();
  }
} 