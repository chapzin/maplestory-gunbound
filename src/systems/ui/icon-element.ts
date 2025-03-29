import * as PIXI from 'pixi.js';
import { BaseUIElement } from './base-ui-element';

/**
 * Opções para configuração do ícone
 */
export interface IconOptions {
  width?: number;
  height?: number;
  tint?: number;
  alpha?: number;
  anchor?: {x: number, y: number};
  scale?: {x: number, y: number};
  rotation?: number;
}

/**
 * Elemento de UI para exibir ícones ou imagens simples
 */
export class IconElement extends BaseUIElement {
  private sprite: PIXI.Sprite;
  private originalTexture: PIXI.Texture;
  private options: IconOptions;
  
  /**
   * Cria um novo elemento de ícone
   * @param id Identificador único do elemento
   * @param texture Textura ou caminho da imagem
   * @param x Posição X
   * @param y Posição Y
   * @param options Opções do ícone
   */
  constructor(
    id: string, 
    texture: PIXI.Texture | string,
    x: number,
    y: number,
    options: IconOptions = {}
  ) {
    // Configura valores padrão para opções
    const defaultOptions: IconOptions = {
      width: undefined,
      height: undefined,
      tint: 0xFFFFFF,
      alpha: 1,
      anchor: { x: 0, y: 0 },
      scale: { x: 1, y: 1 },
      rotation: 0
    };
    
    // Cria textura a partir de string ou usa a textura diretamente
    let iconTexture: PIXI.Texture;
    if (typeof texture === 'string') {
      iconTexture = PIXI.Texture.from(texture);
    } else {
      iconTexture = texture;
    }
    
    // Cria sprite com a textura
    const sprite = new PIXI.Sprite(iconTexture);
    sprite.position.set(x, y);
    
    // Inicializa a classe base
    super(id, sprite);
    
    // Salva referências
    this.sprite = sprite;
    this.originalTexture = iconTexture;
    this.options = { ...defaultOptions, ...options };
    
    // Aplica as opções
    this.applyOptions();
  }
  
  /**
   * Aplica as opções configuradas ao sprite
   */
  private applyOptions(): void {
    const { width, height, tint, alpha, anchor, scale, rotation } = this.options;
    
    // Dimensões
    if (width !== undefined) {
      this.sprite.width = width;
    }
    
    if (height !== undefined) {
      this.sprite.height = height;
    }
    
    // Aparência
    this.sprite.tint = tint || 0xFFFFFF;
    this.sprite.alpha = alpha !== undefined ? alpha : 1;
    
    // Transformações
    if (anchor) {
      this.sprite.anchor.set(anchor.x, anchor.y);
    }
    
    if (scale) {
      this.sprite.scale.set(scale.x, scale.y);
    }
    
    if (rotation !== undefined) {
      this.sprite.rotation = rotation;
    }
  }
  
  /**
   * Define a textura do ícone
   * @param texture Nova textura ou caminho da imagem
   */
  setTexture(texture: PIXI.Texture | string): void {
    let newTexture: PIXI.Texture;
    
    if (typeof texture === 'string') {
      newTexture = PIXI.Texture.from(texture);
    } else {
      newTexture = texture;
    }
    
    this.sprite.texture = newTexture;
    this.originalTexture = newTexture;
    
    // Reaplicar opções que podem depender da textura
    this.applyOptions();
  }
  
  /**
   * Obtém a textura atual
   * @returns Textura atual
   */
  getTexture(): PIXI.Texture {
    return this.sprite.texture;
  }
  
  /**
   * Define a cor de matiz do ícone
   * @param tint Cor em formato hexadecimal (0xRRGGBB)
   */
  setTint(tint: number): void {
    this.options.tint = tint;
    this.sprite.tint = tint;
  }
  
  /**
   * Obtém a cor de matiz atual
   * @returns Cor em formato hexadecimal
   */
  getTint(): number {
    // Converte para number se necessário
    return typeof this.sprite.tint === 'number' 
      ? this.sprite.tint 
      : 0xFFFFFF; // Valor padrão
  }
  
  /**
   * Define a transparência do ícone
   * @param alpha Valor de 0 (transparente) a 1 (opaco)
   */
  setAlpha(alpha: number): void {
    alpha = Math.max(0, Math.min(1, alpha)); // Limita entre 0 e 1
    this.options.alpha = alpha;
    this.sprite.alpha = alpha;
  }
  
  /**
   * Obtém a transparência atual
   * @returns Valor de alpha
   */
  getAlpha(): number {
    return this.sprite.alpha;
  }
  
  /**
   * Define as dimensões do ícone
   * @param width Largura (undefined para usar tamanho original)
   * @param height Altura (undefined para usar tamanho original)
   */
  setDimensions(width?: number, height?: number): void {
    this.options.width = width;
    this.options.height = height;
    
    if (width !== undefined) {
      this.sprite.width = width;
    } else {
      // Restaura largura original
      this.sprite.texture = this.originalTexture;
      this.sprite.scale.x = this.options.scale?.x || 1;
    }
    
    if (height !== undefined) {
      this.sprite.height = height;
    } else {
      // Restaura altura original
      this.sprite.texture = this.originalTexture;
      this.sprite.scale.y = this.options.scale?.y || 1;
    }
  }
  
  /**
   * Define o ponto de ancoragem do ícone
   * @param x Ancoragem horizontal (0 a 1)
   * @param y Ancoragem vertical (0 a 1)
   */
  setAnchor(x: number, y: number): void {
    this.options.anchor = { x, y };
    this.sprite.anchor.set(x, y);
  }
  
  /**
   * Define a escala do ícone
   * @param x Escala horizontal
   * @param y Escala vertical
   */
  setScale(x: number, y: number = x): void {
    this.options.scale = { x, y };
    this.sprite.scale.set(x, y);
  }
  
  /**
   * Define a rotação do ícone
   * @param rotation Rotação em radianos
   */
  setRotation(rotation: number): void {
    this.options.rotation = rotation;
    this.sprite.rotation = rotation;
  }
  
  /**
   * Redimensiona o ícone mantendo a proporção
   * @param width Nova largura
   */
  resizeProportionally(width: number): void {
    const ratio = this.sprite.height / this.sprite.width;
    this.setDimensions(width, width * ratio);
  }
  
  /**
   * Atualiza o elemento
   * @param delta Delta time
   */
  update(delta: number): void {
    // O elemento de ícone é estático por padrão, mas
    // este método pode ser sobrescrito por classes derivadas
    // ou usado para animações futuras
  }
  
  /**
   * Destrói o elemento e libera recursos
   */
  destroy(): void {
    // Libera a textura se for criada dinamicamente
    if (typeof this.originalTexture === 'string') {
      // Apenas remove a referência, o PIXI gerencia o cache de texturas
      this.sprite.texture = PIXI.Texture.EMPTY;
    }
    
    // Chama o método da classe base
    super.destroy();
  }
} 