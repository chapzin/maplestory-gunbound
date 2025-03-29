import * as PIXI from 'pixi.js';
import { CONFIG } from '../core/config';

/**
 * Componente visual que mostra a potência de disparo
 */
export class PowerIndicator {
  private container: PIXI.Container;
  private graphics: PIXI.Graphics;
  private x: number = 50;
  private y: number = 320;
  private width: number = 100;
  private height: number = 10;
  private power: number = 50;

  /**
   * Inicializa o indicador de potência
   * @param container Container pai para adicionar o gráfico
   */
  constructor(container: PIXI.Container) {
    this.container = container;
    this.graphics = new PIXI.Graphics();
    container.addChild(this.graphics);
    this.draw();
  }

  /**
   * Define a posição do indicador
   * @param x Coordenada X
   * @param y Coordenada Y
   */
  public setPosition(x: number, y: number): void {
    this.x = x;
    this.y = y;
    this.draw();
  }

  /**
   * Define a potência atual
   * @param power Potência (0-100)
   */
  public setPower(power: number): void {
    this.power = Math.max(CONFIG.GAME.MIN_POWER, Math.min(CONFIG.GAME.MAX_POWER, power));
    this.draw();
  }

  /**
   * Obtém a potência atual
   */
  public getPower(): number {
    return this.power;
  }

  /**
   * Define as dimensões do indicador
   * @param width Largura
   * @param height Altura
   */
  public setSize(width: number, height: number): void {
    this.width = width;
    this.height = height;
    this.draw();
  }

  /**
   * Desenha o indicador de potência
   */
  private draw(): void {
    // Limpa o gráfico anterior
    this.graphics.clear();
    
    // Desenha a borda do indicador
    this.graphics.lineStyle(1, 0xFFFFFF);
    this.graphics.drawRect(this.x, this.y, this.width, this.height);
    
    // Calcula a largura do preenchimento baseado na potência atual
    const fillWidth = (this.power / CONFIG.GAME.MAX_POWER) * this.width;
    
    // Desenha o preenchimento
    this.graphics.beginFill(0xFF0000);
    this.graphics.drawRect(this.x, this.y, fillWidth, this.height);
    this.graphics.endFill();
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