import * as PIXI from 'pixi.js';
import { BaseUIElement } from './base-ui-element';
import { ProgressBarOptions, TextStyle, UIValueChangedEventData, UIEventType } from './ui-types';
import { TextElement } from './text-element';
import { ProgressBarElement } from './progress-bar-element';
import EventEmitter from 'eventemitter3';

/**
 * Posição do rótulo em relação à barra
 */
export enum LabelPosition {
  ABOVE = 'above',
  BELOW = 'below',
  LEFT = 'left',
  RIGHT = 'right',
  CENTER = 'center'
}

/**
 * Opções para barra com rótulo
 */
export interface LabeledBarOptions extends ProgressBarOptions {
  label?: string;
  labelPosition?: LabelPosition;
  labelOffset?: number;
  showValue?: boolean;
  valueFormat?: (value: number, maxValue: number) => string;
  labelStyle?: TextStyle;
}

/**
 * Elemento de UI que combina uma barra de progresso com um rótulo de texto
 */
export class LabeledBarElement extends BaseUIElement {
  private container: PIXI.Container;
  private progressBar: ProgressBarElement;
  private labelText: TextElement;
  private valueText: TextElement | null = null;
  
  private label: string;
  private labelPosition: LabelPosition;
  private labelOffset: number;
  private showValue: boolean;
  private valueFormat: (value: number, maxValue: number) => string;
  private eventEmitter: EventEmitter;
  private barWidth: number;
  private barHeight: number;
  
  /**
   * Cria uma nova barra com rótulo
   * @param id Identificador único do elemento
   * @param x Posição X
   * @param y Posição Y
   * @param options Opções da barra com rótulo
   * @param eventEmitter Emissor de eventos opcional
   */
  constructor(
    id: string, 
    x: number, 
    y: number, 
    options: LabeledBarOptions,
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
      cornerRadius = 4,
      label = '',
      labelPosition = LabelPosition.ABOVE,
      labelOffset = 5,
      showValue = false,
      valueFormat = (value, maxValue) => `${value}/${maxValue}`,
      labelStyle = {}
    } = options;
    
    // Cria o container principal
    const container = new PIXI.Container();
    container.position.set(x, y);
    
    // Inicializa a classe base
    super(id, container);
    
    this.container = container;
    this.label = label;
    this.labelPosition = labelPosition;
    this.labelOffset = labelOffset;
    this.showValue = showValue;
    this.valueFormat = valueFormat;
    this.eventEmitter = eventEmitter || new EventEmitter();
    this.barWidth = width;
    this.barHeight = height;
    
    // Cria a barra de progresso interna
    const barId = `${id}_bar`;
    const barX = 0;
    const barY = 0;
    
    // Define a posição da barra com base na posição do rótulo
    let labelX = 0;
    let labelY = 0;
    
    // Configuração inicial da posição do rótulo
    if (labelPosition === LabelPosition.ABOVE) {
      labelY = -(labelOffset + 15); // Altura aproximada do texto
    } else if (labelPosition === LabelPosition.BELOW) {
      labelY = height + labelOffset;
    } else if (labelPosition === LabelPosition.LEFT) {
      labelX = -(labelOffset + 50); // Largura aproximada do texto
    } else if (labelPosition === LabelPosition.RIGHT) {
      labelX = width + labelOffset;
    }
    // Para CENTER, manteremos 0,0 e ajustaremos após criar o texto
    
    // Cria os elementos internos
    this.progressBar = new ProgressBarElement(
      barId,
      barX,
      barY,
      {
        width,
        height,
        value,
        maxValue,
        backgroundColor,
        fillColor,
        cornerRadius
      },
      this.eventEmitter
    );
    
    // Cria o elemento de texto para o rótulo
    this.labelText = new TextElement(
      `${id}_label`,
      label,
      labelStyle,
      labelX,
      labelY
    );
    
    // Cria o elemento de texto para o valor, se necessário
    if (showValue) {
      // Copiamos apenas as propriedades válidas em vez de fazer spread
      const valueTextStyle: TextStyle = {};
      if (labelStyle) {
        // Copiamos apenas as propriedades válidas da TextStyle
        Object.assign(valueTextStyle, labelStyle);
      }
      
      this.valueText = new TextElement(
        `${id}_value`,
        this.formatValue(),
        valueTextStyle,
        width / 2,
        height / 2
      );
      
      // Centraliza o texto de valor na barra
      this.valueText.setAnchor(0.5, 0.5);
    }
    
    // Ajusta a posição do rótulo se for centralizado
    if (labelPosition === LabelPosition.CENTER) {
      this.labelText.setPosition(width / 2, height / 2);
      this.labelText.setAnchor(0.5, 0.5);
    }
    
    // Adiciona os elementos ao container
    this.container.addChild(this.progressBar.displayObject);
    this.container.addChild(this.labelText.displayObject);
    
    if (this.valueText) {
      this.container.addChild(this.valueText.displayObject);
    }
    
    // Configura eventos para atualizar o texto de valor quando o valor mudar
    this.progressBar.onValueChanged(this.handleValueChange.bind(this));
  }
  
  /**
   * Processa evento de mudança de valor
   * @param data Dados do evento
   */
  private handleValueChange(data: UIValueChangedEventData): void {
    // Atualiza o texto de valor
    if (this.valueText) {
      this.valueText.setText(this.formatValue());
    }
    
    // Propaga o evento
    this.eventEmitter.emit(UIEventType.VALUE_CHANGED, data);
  }
  
  /**
   * Formata o valor atual segundo a função de formatação
   * @returns String formatada
   */
  private formatValue(): string {
    return this.valueFormat(this.progressBar.getValue(), this.progressBar.getMaxValue());
  }
  
  /**
   * Define o valor da barra
   * @param value Novo valor
   */
  setValue(value: number): void {
    this.progressBar.setValue(value);
  }
  
  /**
   * Obtém o valor atual
   * @returns Valor atual
   */
  getValue(): number {
    return this.progressBar.getValue();
  }
  
  /**
   * Define o valor máximo
   * @param maxValue Novo valor máximo
   */
  setMaxValue(maxValue: number): void {
    this.progressBar.setMaxValue(maxValue);
  }
  
  /**
   * Obtém o valor máximo
   * @returns Valor máximo
   */
  getMaxValue(): number {
    return this.progressBar.getMaxValue();
  }
  
  /**
   * Define o texto do rótulo
   * @param text Novo texto
   */
  setLabel(text: string): void {
    this.label = text;
    this.labelText.setText(text);
  }
  
  /**
   * Obtém o texto do rótulo
   * @returns Texto atual
   */
  getLabel(): string {
    return this.label;
  }
  
  /**
   * Define se o valor numérico deve ser exibido
   * @param show Mostrar ou não
   */
  setShowValue(show: boolean): void {
    this.showValue = show;
    
    if (show && !this.valueText) {
      // Cria o elemento de texto para o valor
      const valueTextStyle: TextStyle = {};
      
      this.valueText = new TextElement(
        `${this.id}_value`,
        this.formatValue(),
        valueTextStyle,
        this.barWidth / 2,
        this.barHeight / 2
      );
      
      // Centraliza o texto de valor na barra
      this.valueText.setAnchor(0.5, 0.5);
      
      // Adiciona ao container
      this.container.addChild(this.valueText.displayObject);
    } else if (!show && this.valueText) {
      // Remove o elemento de texto de valor
      this.container.removeChild(this.valueText.displayObject);
      this.valueText = null;
    }
  }
  
  /**
   * Define a função de formatação de valor
   * @param format Nova função de formatação
   */
  setValueFormat(format: (value: number, maxValue: number) => string): void {
    this.valueFormat = format;
    if (this.valueText) {
      this.valueText.setText(this.formatValue());
    }
  }
  
  /**
   * Atualiza o elemento
   * @param delta Delta time
   * @param value Novo valor (opcional)
   */
  update(delta: number, value?: number): void {
    if (value !== undefined) {
      this.setValue(value);
    }
    
    // Atualiza os elementos internos
    this.progressBar.update(delta);
    this.labelText.update(delta);
    if (this.valueText) {
      this.valueText.update(delta);
    }
  }
  
  /**
   * Destrói o elemento e libera recursos
   */
  destroy(): void {
    // Limpa os callbacks de eventos
    this.progressBar.offValueChanged(this.handleValueChange.bind(this));
    
    // Destrói os elementos internos
    this.progressBar.destroy();
    this.labelText.destroy();
    if (this.valueText) {
      this.valueText.destroy();
    }
    
    // Chama o método da classe base
    super.destroy();
  }
} 