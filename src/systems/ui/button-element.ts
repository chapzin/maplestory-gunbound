import * as PIXI from 'pixi.js';
import { BaseUIElement } from './base-ui-element';
import { ButtonOptions, TextStyle, UIEventType, UIButtonClickedEventData } from './ui-types';
import EventEmitter from 'eventemitter3';

/**
 * Elemento de botão para UI
 */
export class ButtonElement extends BaseUIElement {
  private background: PIXI.Graphics;
  private text: PIXI.Text;
  private container: PIXI.Container;
  private isPressed: boolean = false;
  private isHovered: boolean = false;
  private onClick: () => void;
  private eventEmitter: EventEmitter | null;
  
  // Cores padrão
  private backgroundColor: number = 0x3366CC;
  private hoverColor: number = 0x4477DD;
  private pressColor: number = 0x2255BB;
  private width: number;
  private height: number;
  private cornerRadius: number;
  
  /**
   * Cria um novo elemento de botão
   * @param id Identificador único do elemento
   * @param text Texto do botão
   * @param x Posição X
   * @param y Posição Y
   * @param options Opções do botão
   * @param onClick Função de callback para clique
   * @param eventEmitter Emissor de eventos opcional
   */
  constructor(
    id: string, 
    text: string, 
    x: number, 
    y: number, 
    options: ButtonOptions,
    onClick: () => void,
    eventEmitter?: EventEmitter
  ) {
    // Extrai opções com valores padrão
    const {
      width, 
      height, 
      backgroundColor = 0x3366CC, 
      hoverColor = 0x4477DD, 
      pressColor = 0x2255BB,
      cornerRadius = 8,
      textStyle = {}
    } = options;
    
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
    background.drawRoundedRect(0, 0, width, height, cornerRadius);
    background.endFill();
    
    // Configura o estilo de texto com padrões
    const defaultStyle: TextStyle = {
      fontFamily: 'Arial',
      fontSize: 16,
      fill: 0xFFFFFF,
      align: 'center'
    };
    
    // Mescla os estilos padrão com os fornecidos
    const finalStyle = { ...defaultStyle, ...textStyle };
    
    // Cria o texto
    const textObject = new PIXI.Text(text, finalStyle);
    
    // Centraliza o texto no botão
    textObject.anchor.set(0.5);
    textObject.position.set(width / 2, height / 2);
    
    // Adiciona ao container
    container.addChild(background);
    container.addChild(textObject);
    
    // Inicializa a classe base
    super(id, container);
    
    // Armazena propriedades
    this.container = container;
    this.background = background;
    this.text = textObject;
    this.onClick = onClick;
    this.width = width;
    this.height = height;
    this.backgroundColor = backgroundColor;
    this.hoverColor = hoverColor;
    this.pressColor = pressColor;
    this.cornerRadius = cornerRadius;
    this.eventEmitter = eventEmitter || null;
    
    // Configura eventos
    this.setupEventListeners();
  }
  
  /**
   * Configura listeners para eventos do botão
   */
  private setupEventListeners(): void {
    this.container.on('pointerdown', this.onPointerDown.bind(this));
    this.container.on('pointerup', this.onPointerUp.bind(this));
    this.container.on('pointerupoutside', this.onPointerUpOutside.bind(this));
    this.container.on('pointerover', this.onPointerOver.bind(this));
    this.container.on('pointerout', this.onPointerOut.bind(this));
  }
  
  /**
   * Handler para evento pointerdown
   */
  private onPointerDown(): void {
    this.isPressed = true;
    this.updateVisual();
  }
  
  /**
   * Handler para evento pointerup
   */
  private onPointerUp(): void {
    if (this.isPressed) {
      this.onClick();
      
      // Emite evento de clique se houver um eventEmitter
      if (this.eventEmitter) {
        const eventData: UIButtonClickedEventData = {
          id: this.id,
          element: this
        };
        this.eventEmitter.emit(UIEventType.BUTTON_CLICKED, eventData);
      }
    }
    this.isPressed = false;
    this.updateVisual();
  }
  
  /**
   * Handler para evento pointerupoutside
   */
  private onPointerUpOutside(): void {
    this.isPressed = false;
    this.updateVisual();
  }
  
  /**
   * Handler para evento pointerover
   */
  private onPointerOver(): void {
    this.isHovered = true;
    this.updateVisual();
  }
  
  /**
   * Handler para evento pointerout
   */
  private onPointerOut(): void {
    this.isHovered = false;
    this.updateVisual();
  }
  
  /**
   * Atualiza a aparência visual do botão
   */
  private updateVisual(): void {
    this.background.clear();
    
    let color = this.backgroundColor; // cor padrão
    
    if (this.isPressed) {
      color = this.pressColor; // cor quando pressionado
    } else if (this.isHovered) {
      color = this.hoverColor; // cor quando hover
    }
    
    this.background.beginFill(color);
    this.background.drawRoundedRect(0, 0, this.width, this.height, this.cornerRadius);
    this.background.endFill();
  }
  
  /**
   * Define o texto do botão
   * @param text Novo texto
   */
  setText(text: string): void {
    this.text.text = text;
  }
  
  /**
   * Obtém o texto atual do botão
   * @returns Texto atual
   */
  getText(): string {
    return this.text.text;
  }
  
  /**
   * Define o callback de clique
   * @param onClick Nova função de callback
   */
  setOnClick(onClick: () => void): void {
    this.onClick = onClick;
  }
  
  /**
   * Define o emissor de eventos
   * @param eventEmitter Novo emissor de eventos
   */
  setEventEmitter(eventEmitter: EventEmitter): void {
    this.eventEmitter = eventEmitter;
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
    this.container.off('pointerdown');
    this.container.off('pointerup');
    this.container.off('pointerupoutside');
    this.container.off('pointerover');
    this.container.off('pointerout');
    
    // Chama o método da classe base
    super.destroy();
  }
} 