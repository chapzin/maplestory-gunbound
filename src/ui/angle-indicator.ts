import * as PIXI from 'pixi.js';

/**
 * Componente visual que mostra o ângulo de disparo
 */
export class AngleIndicator {
  private container: PIXI.Container;
  private graphics: PIXI.Graphics;
  private startX: number = 100;
  private startY: number = 300;
  private angle: number = 45;
  private length: number = 50;

  /**
   * Inicializa o indicador de ângulo
   * @param container Container pai para adicionar o gráfico
   */
  constructor(container: PIXI.Container) {
    this.container = container;
    this.graphics = new PIXI.Graphics();
    container.addChild(this.graphics);
    this.draw();
  }

  /**
   * Define a posição inicial do indicador
   * @param x Coordenada X
   * @param y Coordenada Y
   */
  public setPosition(x: number, y: number): void {
    this.startX = x;
    this.startY = y;
    this.draw();
  }

  /**
   * Define o ângulo atual
   * @param angle Ângulo em graus
   */
  public setAngle(angle: number): void {
    this.angle = angle;
    this.draw();
  }

  /**
   * Obtém o ângulo atual
   */
  public getAngle(): number {
    return this.angle;
  }

  /**
   * Define o comprimento da linha indicadora
   * @param length Comprimento da linha
   */
  public setLength(length: number): void {
    this.length = length;
    this.draw();
  }

  /**
   * Desenha o indicador de ângulo
   */
  private draw(): void {
    // Limpa o gráfico anterior
    this.graphics.clear();
    
    // Desenha o indicador de ângulo
    this.graphics.lineStyle(2, 0xFFFFFF);
    this.graphics.moveTo(this.startX, this.startY);
    
    // Calcula o ponto final com base no ângulo
    const angleRad = this.angle * (Math.PI / 180);
    const endX = this.startX + Math.cos(angleRad) * this.length;
    const endY = this.startY - Math.sin(angleRad) * this.length;
    
    this.graphics.lineTo(endX, endY);
  }

  /**
   * Atualiza a visibilidade do indicador
   * @param visible Estado de visibilidade
   */
  public setVisible(visible: boolean): void {
    this.graphics.visible = visible;
  }

  /**
   * Limpa recursos ao destruir o componente
   */
  public destroy(): void {
    this.graphics.destroy();
  }
} 