import * as PIXI from 'pixi.js';

/**
 * Classe base para todas as cenas do jogo
 */
export abstract class BaseScene {
  protected app: PIXI.Application;
  protected container: PIXI.Container;
  protected isActive: boolean = false;

  /**
   * Inicializa a cena base
   * @param app Aplicação Pixi.js
   */
  constructor(app: PIXI.Application) {
    this.app = app;
    this.container = new PIXI.Container();
    app.stage.addChild(this.container);
  }

  /**
   * Ativa a cena
   */
  public activate(): void {
    this.isActive = true;
    this.container.visible = true;
  }

  /**
   * Desativa a cena
   */
  public deactivate(): void {
    this.isActive = false;
    this.container.visible = false;
  }

  /**
   * Método para atualizar a lógica da cena
   * Deve ser implementado pelas classes filhas
   * @param deltaTime Tempo desde o último frame
   */
  public abstract update(deltaTime: number): void;

  /**
   * Método para renderizar a cena
   * Pode ser sobrescrito pelas classes filhas se necessário
   */
  protected render(): void {
    // Renderização base - mais específica nas subclasses
  }

  /**
   * Redimensiona a cena quando a janela é redimensionada
   * @param width Nova largura
   * @param height Nova altura
   */
  public resize(width: number, height: number): void {
    // Lógica de redimensionamento básica
  }

  /**
   * Limpa recursos ao destruir a cena
   */
  public destroy(): void {
    this.container.destroy({children: true});
  }
} 