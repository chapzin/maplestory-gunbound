import * as PIXI from 'pixi.js';
import { GridOptions } from './grid-element';
import { IconOptions } from './icon-element';
import EventEmitter from 'eventemitter3';

/**
 * Eventos do sistema de UI
 */
export enum UIEventType {
  ELEMENT_ADDED = 'element_added',
  ELEMENT_REMOVED = 'element_removed',
  ELEMENT_UPDATED = 'element_updated',
  BUTTON_CLICKED = 'button_clicked',
  VALUE_CHANGED = 'value_changed',
  MOUSE_OVER = 'mouse_over',
  MOUSE_OUT = 'mouse_out'
}

/**
 * Interface base para elementos de UI
 */
export interface UIElement {
  id: string;
  displayObject: PIXI.DisplayObject;
  update(delta: number): void;
  setVisible(visible: boolean): void;
  isVisible(): boolean;
  setPosition(x: number, y: number): void;
  getPosition(): { x: number, y: number };
  setEnabled?(enabled: boolean): void;
  isEnabled?(): boolean;
  addChild?(child: UIElement): void;
  removeChild?(child: UIElement): void;
  destroy(): void;
}

/**
 * Dados de evento para elementos de UI
 */
export interface UIElementEventData {
  id: string;
  element: UIElement;
}

/**
 * Dados de evento para mudança de valor
 */
export interface UIValueChangedEventData extends UIElementEventData {
  oldValue: number;
  newValue: number;
}

/**
 * Dados de evento para botão clicado
 */
export interface UIButtonEventData extends UIElementEventData {
  originalEvent?: MouseEvent | TouchEvent;
}

/**
 * Tipo para estilos de texto
 */
export type TextStyle = Partial<PIXI.TextStyle> & {
  [key: string]: any;
};

/**
 * Opções para botões
 */
export interface ButtonOptions {
  width: number;
  height: number;
  backgroundColor?: number;
  backgroundAlpha?: number;
  hoverColor?: number;
  disabledColor?: number;
  textColor?: number;
  textStyle?: TextStyle;
  cornerRadius?: number;
  enabled?: boolean;
}

/**
 * Opções para barras de progresso
 */
export interface ProgressBarOptions {
  width: number;
  height: number;
  value?: number;
  maxValue?: number;
  backgroundColor?: number;
  fillColor?: number;
  borderColor?: number;
  borderWidth?: number;
  cornerRadius?: number;
}

/**
 * Opções para painéis
 */
export interface PanelOptions {
  width: number;
  height: number;
  backgroundColor?: number;
  backgroundAlpha?: number;
  borderColor?: number;
  borderWidth?: number;
  cornerRadius?: number;
}

/**
 * Interface para a fábrica de elementos de UI
 */
export interface IUIFactory {
  createText(id: string, text: string, x: number, y: number, style?: TextStyle): UIElement;
  createButton(id: string, text: string, x: number, y: number, options: ButtonOptions, onClick: () => void): UIElement;
  createProgressBar(id: string, x: number, y: number, options: ProgressBarOptions): UIElement;
  createPanel(id: string, x: number, y: number, options: PanelOptions): UIElement;
  createGrid(id: string, x: number, y: number, options: GridOptions): UIElement;
  createIcon(id: string, texture: PIXI.Texture | string, x: number, y: number, options?: IconOptions): UIElement;
  onElementCreated(listener: (element: UIElement) => void): void;
  getEventEmitter(): EventEmitter;
  dispose(): void;
}

/**
 * Interface para o sistema de UI
 */
export interface IUISystem {
  container: PIXI.Container;
  addElement(element: UIElement): void;
  removeElement(id: string): boolean;
  getElement<T extends UIElement>(id: string): T | undefined;
  update(delta: number): void;
  createText(id: string, text: string, x: number, y: number, style?: Partial<PIXI.TextStyle>): UIElement;
  createButton(id: string, text: string, x: number, y: number, width: number, height: number, onClick: () => void): UIElement;
  createProgressBar(id: string, x: number, y: number, width: number, height: number, value?: number, maxValue?: number): UIElement;
  createPanel(id: string, x: number, y: number, width: number, height: number, backgroundColor?: number): UIElement;
  clear(): void;
  setAllVisible(visible: boolean): void;
  getElementIds(): string[];
  on(event: string | symbol, listener: (...args: any[]) => void): IUISystem;
  off(event: string | symbol, listener: (...args: any[]) => void): IUISystem;
  getFactory(): IUIFactory;
  getBinding(): any; // Tipo será definido quando implementarmos o binding
  destroy(): void;
} 