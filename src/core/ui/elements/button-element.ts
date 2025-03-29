import * as PIXI from 'pixi.js';
import { BaseUIElement } from './ui-element';

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