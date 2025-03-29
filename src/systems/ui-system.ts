import * as PIXI from 'pixi.js';
import { EventEmitter } from 'eventemitter3';

/**
 * Tipo de evento do sistema de UI
 */
export enum UIEventType {
  BUTTON_CLICKED = 'buttonClicked',
  VALUE_CHANGED = 'valueChanged',
  ELEMENT_ADDED = 'elementAdded',
  ELEMENT_REMOVED = 'elementRemoved'
}

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

/**
 * Elemento de botão para UI
 */
export class ButtonElement extends BaseUIElement {
  private background: PIXI.Graphics;
  private text: PIXI.Text;
  private isPressed: boolean = false;
  private isHovered: boolean = false;
  private onClick: () => void;
  
  constructor(
    id: string, 
    text: string, 
    x: number, 
    y: number, 
    width: number, 
    height: number,
    onClick: () => void,
    style?: Partial<PIXI.TextStyle>,
    backgroundColor: number = 0x3366CC,
    hoverColor: number = 0x4477DD,
    pressColor: number = 0x2255BB
  ) {
    // Cria o container
    const container = new PIXI.Container();
    container.position.set(x, y);
    container.interactive = true;
    // A propriedade buttonMode foi removida no Pixi.js v7
    // Usamos o cursor para simular o comportamento
    container.cursor = 'pointer';
    
    // Cria o fundo do botão
    const background = new PIXI.Graphics();
    background.beginFill(backgroundColor);
    background.drawRoundedRect(0, 0, width, height, 8);
    background.endFill();
    
    // Cria o texto
    const textObject = new PIXI.Text(text, {
      fontFamily: 'Arial',
      fontSize: 16,
      fill: 0xFFFFFF,
      align: 'center',
      ...style
    });
    
    // Centraliza o texto no botão
    textObject.anchor.set(0.5);
    textObject.position.set(width / 2, height / 2);
    
    // Adiciona ao container
    container.addChild(background);
    container.addChild(textObject);
    
    // Inicializa a classe base
    super(id, container);
    
    this.background = background;
    this.text = textObject;
    this.onClick = onClick;
    
    // Configura eventos
    container.on('pointerdown', this.onPointerDown.bind(this));
    container.on('pointerup', this.onPointerUp.bind(this));
    container.on('pointerupoutside', this.onPointerUpOutside.bind(this));
    container.on('pointerover', this.onPointerOver.bind(this));
    container.on('pointerout', this.onPointerOut.bind(this));
  }
  
  private onPointerDown(): void {
    this.isPressed = true;
    this.updateVisual();
  }
  
  private onPointerUp(): void {
    if (this.isPressed) {
      this.onClick();
    }
    this.isPressed = false;
    this.updateVisual();
  }
  
  private onPointerUpOutside(): void {
    this.isPressed = false;
    this.updateVisual();
  }
  
  private onPointerOver(): void {
    this.isHovered = true;
    this.updateVisual();
  }
  
  private onPointerOut(): void {
    this.isHovered = false;
    this.updateVisual();
  }
  
  private updateVisual(): void {
    this.background.clear();
    
    let color = 0x3366CC; // cor padrão
    
    if (this.isPressed) {
      color = 0x2255BB; // cor quando pressionado
    } else if (this.isHovered) {
      color = 0x4477DD; // cor quando hover
    }
    
    this.background.beginFill(color);
    this.background.drawRoundedRect(0, 0, 
      (this.displayObject as PIXI.Container).width, 
      (this.displayObject as PIXI.Container).height, 
      8);
    this.background.endFill();
  }
  
  setText(text: string): void {
    this.text.text = text;
  }
  
  /**
   * Atualiza o botão
   * @param delta Delta time
   * @param text Novo texto (opcional)
   */
  update(delta: number, text?: string): void {
    if (text !== undefined) {
      this.setText(text);
    }
  }
  
  /**
   * Destrói o botão e remove listeners
   */
  destroy(): void {
    // Remove os event listeners
    this.displayObject.off('pointerdown');
    this.displayObject.off('pointerup');
    this.displayObject.off('pointerupoutside');
    this.displayObject.off('pointerover');
    this.displayObject.off('pointerout');
    
    // Chama o método da classe base
    super.destroy();
  }
}

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

/**
 * Sistema principal de UI que gerencia todos os elementos
 */
export class UISystem extends EventEmitter {
  public container: PIXI.Container;
  private elements: Map<string, UIElement> = new Map();
  
  /**
   * Cria uma nova instância do sistema de UI
   * @param container Container onde os elementos serão adicionados
   */
  constructor(container: PIXI.Container) {
    super();
    this.container = container;
  }
  
  /**
   * Adiciona um elemento à UI
   * @param element Elemento a ser adicionado
   */
  addElement(element: UIElement): void {
    // Verifica se já existe um elemento com o mesmo ID
    if (this.elements.has(element.id)) {
      console.warn(`Elemento de UI com ID '${element.id}' já existe. Substituindo.`);
      this.removeElement(element.id);
    }
    
    // Adiciona o elemento ao mapa e o display object ao container
    this.elements.set(element.id, element);
    this.container.addChild(element.displayObject);
    
    // Emite evento de elemento adicionado
    this.emit(UIEventType.ELEMENT_ADDED, {
      id: element.id,
      element: element
    });
  }
  
  /**
   * Remove um elemento da UI pelo ID
   * @param id ID do elemento a ser removido
   * @returns Verdadeiro se o elemento foi removido
   */
  removeElement(id: string): boolean {
    const element = this.elements.get(id);
    
    if (element) {
      // Remove o display object do container
      this.container.removeChild(element.displayObject);
      // Remove do mapa
      this.elements.delete(id);
      
      // Emite evento de elemento removido
      this.emit(UIEventType.ELEMENT_REMOVED, {
        id: id,
        element: element
      });
      
      return true;
    }
    
    return false;
  }
  
  /**
   * Obtém um elemento pelo ID
   * @param id ID do elemento
   * @returns Elemento ou undefined se não encontrado
   */
  getElement<T extends UIElement>(id: string): T | undefined {
    return this.elements.get(id) as T | undefined;
  }
  
  /**
   * Atualiza todos os elementos que têm método update
   * @param delta Delta time
   */
  update(delta: number): void {
    for (const element of this.elements.values()) {
      if (element.update) {
        element.update(delta);
      }
    }
  }
  
  /**
   * Cria e adiciona um elemento de texto
   * @param id ID do elemento
   * @param text Texto inicial
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
    const element = new TextElement(id, text, style || {}, x, y);
    this.addElement(element);
    return element;
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
    const element = new ButtonElement(id, text, x, y, width, height, onClick, style);
    this.addElement(element);
    return element;
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
    const element = new ProgressBarElement(
      id, x, y, width, height, value, maxValue, backgroundColor, fillColor
    );
    this.addElement(element);
    return element;
  }
  
  /**
   * Limpa todos os elementos de UI
   */
  clear(): void {
    const elementsToRemove = Array.from(this.elements.keys());
    for (const id of elementsToRemove) {
      this.removeElement(id);
    }
  }
  
  /**
   * Mostra ou esconde todos os elementos
   * @param visible Estado de visibilidade
   */
  setAllVisible(visible: boolean): void {
    for (const element of this.elements.values()) {
      element.setVisible(visible);
    }
  }
  
  /**
   * Obtém todos os IDs de elementos registrados
   * @returns Array de IDs
   */
  getElementIds(): string[] {
    return Array.from(this.elements.keys());
  }
} 