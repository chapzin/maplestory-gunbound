import * as PIXI from 'pixi.js';

/**
 * Componente visual que mostra informações sobre o vento
 */
export class WindDisplay {
  private container: PIXI.Container;
  private text: PIXI.Text;
  private windArrow: PIXI.Graphics;
  private x: number = 10;
  private y: number = 10;
  private wind: number = 0;

  /**
   * Inicializa o display de vento
   * @param container Container pai para adicionar o texto
   */
  constructor(container: PIXI.Container) {
    this.container = container;
    
    // Cria o texto para exibir o valor do vento
    this.text = new PIXI.Text('Vento: 0', {
      fontFamily: 'Arial',
      fontSize: 16,
      fill: 0xFFFFFF,
      align: 'center',
    });
    this.text.position.set(this.x, this.y);
    container.addChild(this.text);
    
    // Cria a seta para indicar a direção do vento
    this.windArrow = new PIXI.Graphics();
    container.addChild(this.windArrow);
    
    this.drawWindArrow();
  }

  /**
   * Define a posição do display
   * @param x Coordenada X
   * @param y Coordenada Y
   */
  public setPosition(x: number, y: number): void {
    this.x = x;
    this.y = y;
    this.text.position.set(x, y);
    this.drawWindArrow();
  }

  /**
   * Atualiza o valor do vento
   * @param wind Velocidade do vento (positivo: direita, negativo: esquerda)
   */
  public update(wind: number): void {
    this.wind = wind;
    this.text.text = `Vento: ${wind.toFixed(1)}`;
    this.drawWindArrow();
  }

  /**
   * Desenha a seta indicadora de direção do vento
   */
  private drawWindArrow(): void {
    this.windArrow.clear();
    
    // Posiciona a seta ao lado do texto
    const arrowX = this.x + this.text.width + 10;
    const arrowY = this.y + this.text.height / 2;
    
    // Define o comprimento da seta baseado na força do vento
    const arrowLength = Math.min(Math.abs(this.wind) * 5, 40);
    
    // Desenha a seta na direção apropriada
    this.windArrow.lineStyle(2, 0xFFFFFF);
    
    if (this.wind !== 0) {
      const direction = Math.sign(this.wind);
      
      // Linha principal
      this.windArrow.moveTo(arrowX, arrowY);
      this.windArrow.lineTo(arrowX + arrowLength * direction, arrowY);
      
      // Ponta da seta
      this.windArrow.moveTo(arrowX + arrowLength * direction, arrowY);
      this.windArrow.lineTo(arrowX + (arrowLength - 5) * direction, arrowY - 5);
      this.windArrow.moveTo(arrowX + arrowLength * direction, arrowY);
      this.windArrow.lineTo(arrowX + (arrowLength - 5) * direction, arrowY + 5);
    }
  }

  /**
   * Atualiza a visibilidade do display
   * @param visible Estado de visibilidade
   */
  public setVisible(visible: boolean): void {
    this.text.visible = visible;
    this.windArrow.visible = visible;
  }

  /**
   * Limpa recursos ao destruir o componente
   */
  public destroy(): void {
    this.text.destroy();
    this.windArrow.destroy();
  }
} 