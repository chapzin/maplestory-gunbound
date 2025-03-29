import * as PIXI from 'pixi.js';
import { EventEmitter } from 'eventemitter3';
import { UIEventType } from './events/ui-event-types';
import { 
  UIElement, 
  TextElement, 
  ButtonElement, 
  ProgressBarElement 
} from './elements';

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