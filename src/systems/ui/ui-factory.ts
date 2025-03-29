import * as PIXI from 'pixi.js';
import { TextElement } from './text-element';
import { ButtonElement } from './button-element';
import { ProgressBarElement } from './progress-bar-element';
import { PanelElement } from './panel-element';
import { LabeledBarElement, LabeledBarOptions, LabelPosition } from './labeled-bar-element';
import { GridElement, GridOptions, CellAlignment } from './grid-element';
import { IconElement, IconOptions } from './icon-element';
import { UIElement, IUIFactory, ButtonOptions, ProgressBarOptions, PanelOptions, TextStyle } from './ui-types';
import EventEmitter from 'eventemitter3';

/**
 * Fábrica de elementos UI
 * Responsável por criar diferentes tipos de elementos UI
 */
export class UIFactory implements IUIFactory {
  private eventEmitter: EventEmitter;
  
  /**
   * Cria uma nova fábrica de UI
   * @param eventEmitter Emissor de eventos opcional
   */
  constructor(eventEmitter?: EventEmitter) {
    this.eventEmitter = eventEmitter || new EventEmitter();
  }
  
  /**
   * Cria um elemento de texto
   * @param id Identificador único
   * @param text Texto inicial
   * @param x Posição X
   * @param y Posição Y
   * @param style Estilo do texto
   * @returns Elemento de texto
   */
  createText(id: string, text: string, x: number, y: number, style?: TextStyle): UIElement {
    return new TextElement(id, text, style || {}, x, y);
  }
  
  /**
   * Cria um elemento de botão
   * @param id Identificador único
   * @param text Texto do botão
   * @param x Posição X
   * @param y Posição Y
   * @param options Opções do botão
   * @param onClick Callback para clique
   * @returns Elemento de botão
   */
  createButton(id: string, text: string, x: number, y: number, options: ButtonOptions, onClick: () => void): UIElement {
    return new ButtonElement(id, text, x, y, options, onClick, this.eventEmitter);
  }
  
  /**
   * Cria um elemento de barra de progresso
   * @param id Identificador único
   * @param x Posição X
   * @param y Posição Y
   * @param options Opções da barra
   * @returns Elemento de barra de progresso
   */
  createProgressBar(id: string, x: number, y: number, options: ProgressBarOptions): UIElement {
    return new ProgressBarElement(id, x, y, options, this.eventEmitter);
  }
  
  /**
   * Cria um elemento de painel
   * @param id Identificador único
   * @param x Posição X
   * @param y Posição Y
   * @param options Opções do painel
   * @returns Elemento de painel
   */
  createPanel(id: string, x: number, y: number, options: PanelOptions): UIElement {
    return new PanelElement(id, x, y, options);
  }
  
  /**
   * Cria uma barra de progresso com rótulo
   * @param id Identificador único
   * @param x Posição X
   * @param y Posição Y
   * @param options Opções da barra com rótulo
   * @returns Elemento de barra com rótulo
   */
  createLabeledBar(id: string, x: number, y: number, options: LabeledBarOptions): UIElement {
    return new LabeledBarElement(id, x, y, options, this.eventEmitter);
  }
  
  /**
   * Cria uma barra de progresso com rótulo usando opções simplificadas
   * @param id Identificador único
   * @param label Texto do rótulo
   * @param x Posição X
   * @param y Posição Y
   * @param width Largura da barra
   * @param height Altura da barra
   * @param value Valor inicial
   * @param maxValue Valor máximo
   * @param labelPosition Posição do rótulo
   * @returns Elemento de barra com rótulo
   */
  createSimpleLabeledBar(
    id: string,
    label: string,
    x: number,
    y: number,
    width: number,
    height: number,
    value: number = 0,
    maxValue: number = 100,
    labelPosition: LabelPosition = LabelPosition.ABOVE
  ): UIElement {
    const options: LabeledBarOptions = {
      width,
      height,
      value,
      maxValue,
      label,
      labelPosition,
      showValue: true
    };
    
    return this.createLabeledBar(id, x, y, options);
  }
  
  /**
   * Cria um elemento de grade para organizar outros elementos
   * @param id Identificador único
   * @param x Posição X
   * @param y Posição Y
   * @param options Opções da grade
   * @returns Elemento de grade
   */
  createGrid(id: string, x: number, y: number, options: GridOptions): UIElement {
    return new GridElement(id, x, y, options);
  }
  
  /**
   * Cria um elemento de grade usando opções simplificadas
   * @param id Identificador único
   * @param x Posição X
   * @param y Posição Y
   * @param width Largura total
   * @param height Altura total
   * @param rows Número de linhas
   * @param columns Número de colunas
   * @param showGrid Mostrar linhas da grade
   * @returns Elemento de grade
   */
  createSimpleGrid(
    id: string,
    x: number,
    y: number,
    width: number = 400,
    height: number = 300,
    rows: number = 3,
    columns: number = 3,
    showGrid: boolean = true
  ): UIElement {
    const options: GridOptions = {
      width,
      height,
      rows,
      columns,
      showGrid
    };
    
    return this.createGrid(id, x, y, options);
  }
  
  /**
   * Cria um elemento de ícone
   * @param id Identificador único
   * @param texture Textura ou caminho da imagem
   * @param x Posição X
   * @param y Posição Y
   * @param options Opções do ícone
   * @returns Elemento de ícone
   */
  createIcon(id: string, texture: PIXI.Texture | string, x: number, y: number, options?: IconOptions): UIElement {
    return new IconElement(id, texture, x, y, options);
  }
  
  /**
   * Registra evento para elementos criados
   * @param listener Função callback
   */
  onElementCreated(listener: (element: UIElement) => void): void {
    this.eventEmitter.on('elementCreated', listener);
  }
  
  /**
   * Obtém o emissor de eventos da fábrica
   * @returns Emissor de eventos
   */
  getEventEmitter(): EventEmitter {
    return this.eventEmitter;
  }
  
  /**
   * Limpa recursos
   */
  dispose(): void {
    this.eventEmitter.removeAllListeners();
  }
} 