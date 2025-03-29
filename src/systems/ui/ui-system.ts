import * as PIXI from 'pixi.js';
import EventEmitter from 'eventemitter3';
import { UIElement, IUISystem, UIEventType, UIElementEventData } from './ui-types';
import { UIFactory } from './ui-factory';
import { UIDataBinding } from './ui-data-binding';

/**
 * Sistema principal de UI que gerencia todos os elementos
 * Implementa a interface IUISystem
 */
export class UISystem implements IUISystem {
  public container: PIXI.Container;
  private elements: Map<string, UIElement> = new Map();
  private factory: UIFactory;
  private eventEmitter: EventEmitter;
  private binding: UIDataBinding;
  
  /**
   * Cria uma nova instância do sistema de UI
   * @param container Container PIXI onde os elementos serão adicionados
   * @param factory Factory opcional para criar elementos (se não fornecido, cria um novo)
   */
  constructor(container: PIXI.Container, factory?: UIFactory) {
    this.container = container;
    this.eventEmitter = new EventEmitter();
    this.factory = factory || new UIFactory(this.eventEmitter);
    this.binding = UIDataBinding.getInstance();
    
    // Registra evento para quando elementos são criados pela factory
    this.factory.onElementCreated((element) => {
      this.addElement(element);
    });
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
    this.eventEmitter.emit(UIEventType.ELEMENT_ADDED, {
      id: element.id,
      element: element
    } as UIElementEventData);
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
      this.eventEmitter.emit(UIEventType.ELEMENT_REMOVED, {
        id: id,
        element: element
      } as UIElementEventData);
      
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
      element.update(delta);
    }
  }
  
  /**
   * Cria um elemento de texto
   * @param id ID do elemento
   * @param text Texto inicial
   * @param x Posição X
   * @param y Posição Y
   * @param style Estilo de texto
   * @returns Elemento criado
   */
  createText(id: string, text: string, x: number, y: number, style?: Partial<PIXI.TextStyle>): UIElement {
    const element = this.factory.createText(id, text, x, y, style);
    this.addElement(element);
    return element;
  }
  
  /**
   * Cria um elemento de botão
   * @param id ID do elemento
   * @param text Texto do botão
   * @param x Posição X
   * @param y Posição Y
   * @param width Largura
   * @param height Altura
   * @param onClick Callback de clique
   * @param style Estilo de texto
   * @returns Elemento criado
   */
  createButton(id: string, text: string, x: number, y: number, width: number, height: number, onClick: () => void): UIElement {
    const options = {
      width,
      height,
      textStyle: {}
    };
    
    const element = this.factory.createButton(id, text, x, y, options, onClick);
    this.addElement(element);
    return element;
  }
  
  /**
   * Cria uma barra de progresso
   * @param id ID do elemento
   * @param x Posição X
   * @param y Posição Y
   * @param width Largura
   * @param height Altura
   * @param value Valor inicial
   * @param maxValue Valor máximo
   * @returns Elemento criado
   */
  createProgressBar(id: string, x: number, y: number, width: number, height: number, value: number = 0, maxValue: number = 100): UIElement {
    const options = {
      width,
      height,
      value,
      maxValue
    };
    
    const element = this.factory.createProgressBar(id, x, y, options);
    this.addElement(element);
    return element;
  }
  
  /**
   * Cria um painel
   * @param id ID do elemento
   * @param x Posição X
   * @param y Posição Y
   * @param width Largura
   * @param height Altura
   * @param backgroundColor Cor de fundo
   * @returns Elemento criado
   */
  createPanel(id: string, x: number, y: number, width: number, height: number, backgroundColor: number = 0x000000): UIElement {
    const options = {
      width,
      height,
      backgroundColor
    };
    
    const element = this.factory.createPanel(id, x, y, options);
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
  
  /**
   * Registra um callback para eventos
   * @param event Nome do evento
   * @param listener Função de callback
   * @returns This para encadeamento
   */
  on(event: string | symbol, listener: (...args: any[]) => void): this {
    this.eventEmitter.on(event, listener);
    return this;
  }
  
  /**
   * Remove um callback de eventos
   * @param event Nome do evento
   * @param listener Função de callback
   * @returns This para encadeamento
   */
  off(event: string | symbol, listener: (...args: any[]) => void): this {
    this.eventEmitter.off(event, listener);
    return this;
  }
  
  /**
   * Obtém a fábrica de elementos UI
   * @returns Fábrica de UI
   */
  getFactory(): UIFactory {
    return this.factory;
  }
  
  /**
   * Obtém o sistema de binding de dados
   * @returns Sistema de binding
   */
  getBinding(): UIDataBinding {
    return this.binding;
  }
  
  /**
   * Destrói todos os elementos e limpa recursos
   */
  destroy(): void {
    this.clear();
    this.factory.dispose();
    this.eventEmitter.removeAllListeners();
  }
} 