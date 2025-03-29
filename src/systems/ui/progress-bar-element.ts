import * as PIXI from 'pixi.js';
import { BaseUIElement } from './base-ui-element';
import { ProgressBarOptions, UIEventType, UIValueChangedEventData } from './ui-types';
import EventEmitter from 'eventemitter3';

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
  private cornerRadius: number;
  private eventEmitter: EventEmitter;
  
  /**
   * Cria uma nova barra de progresso
   * @param id Identificador único do elemento
   * @param x Posição X
   * @param y Posição Y
   * @param options Opções da barra
   * @param eventEmitter Emissor de eventos opcional
   */
  constructor(
    id: string, 
    x: number, 
    y: number, 
    options: ProgressBarOptions,
    eventEmitter?: EventEmitter
  ) {
    // Extrai opções com valores padrão
    const {
      width, 
      height, 
      value = 0,
      maxValue = 100,
      backgroundColor = 0x333333,
      fillColor = 0x00CC00,
      cornerRadius = 4
    } = options;
    
    // Cria o container
    const container = new PIXI.Container();
    container.position.set(x, y);
    
    // Cria o fundo da barra
    const background = new PIXI.Graphics();
    background.beginFill(backgroundColor);
    background.drawRoundedRect(0, 0, width, height, cornerRadius);
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
    this.value = Math.max(0, Math.min(value, maxValue));
    this.maxValue = maxValue;
    this.backgroundColor = backgroundColor;
    this.fillColor = fillColor;
    this.cornerRadius = cornerRadius;
    this.eventEmitter = eventEmitter || new EventEmitter();
    
    // Atualiza a visualização inicial
    this.updateVisual();
  }
  
  /**
   * Define o valor atual da barra
   * @param value Valor atual
   */
  setValue(value: number): void {
    // Armazena valor antigo para emitir evento
    const oldValue = this.value;
    
    // Atualiza com limites
    this.value = Math.max(0, Math.min(value, this.maxValue));
    
    // Atualiza visual
    this.updateVisual();
    
    // Emite evento de mudança se o valor realmente mudou
    if (oldValue !== this.value) {
      this.emitValueChanged(oldValue, this.value);
    }
  }
  
  /**
   * Define o valor máximo da barra
   * @param maxValue Valor máximo
   */
  setMaxValue(maxValue: number): void {
    const oldValue = this.value;
    
    this.maxValue = maxValue;
    this.value = Math.min(this.value, this.maxValue);
    
    this.updateVisual();
    
    if (oldValue !== this.value) {
      this.emitValueChanged(oldValue, this.value);
    }
  }
  
  /**
   * Obtém o valor atual
   * @returns Valor atual
   */
  getValue(): number {
    return this.value;
  }
  
  /**
   * Obtém o valor máximo
   * @returns Valor máximo
   */
  getMaxValue(): number {
    return this.maxValue;
  }
  
  /**
   * Obtém o valor percentual (0-100%)
   * @returns Percentual de preenchimento
   */
  getPercent(): number {
    return (this.value / this.maxValue) * 100;
  }
  
  /**
   * Emite evento de alteração de valor
   * @param oldValue Valor antigo
   * @param newValue Novo valor
   */
  private emitValueChanged(oldValue: number, newValue: number): void {
    const eventData: UIValueChangedEventData = {
      id: this.id,
      element: this,
      oldValue,
      newValue
    };
    
    this.eventEmitter.emit(UIEventType.VALUE_CHANGED, eventData);
  }
  
  /**
   * Atualiza a visualização da barra
   */
  private updateVisual(): void {
    const fillWidth = (this.value / this.maxValue) * this.width;
    
    this.foreground.clear();
    this.foreground.beginFill(this.fillColor);
    this.foreground.drawRoundedRect(0, 0, fillWidth, this.height, this.cornerRadius);
    this.foreground.endFill();
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
   * Define a cor de preenchimento
   * @param color Nova cor de preenchimento
   */
  setFillColor(color: number): void {
    this.fillColor = color;
    this.updateVisual();
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
  
  /**
   * Registra um callback para eventos de alteração de valor
   * @param listener Função de callback
   */
  onValueChanged(listener: (data: UIValueChangedEventData) => void): void {
    this.eventEmitter.on(UIEventType.VALUE_CHANGED, listener);
  }
  
  /**
   * Remove um callback para eventos de alteração de valor
   * @param listener Função de callback
   */
  offValueChanged(listener: (data: UIValueChangedEventData) => void): void {
    this.eventEmitter.off(UIEventType.VALUE_CHANGED, listener);
  }
  
  /**
   * Destrói a barra de progresso
   */
  destroy(): void {
    this.eventEmitter.removeAllListeners();
    super.destroy();
  }
} 