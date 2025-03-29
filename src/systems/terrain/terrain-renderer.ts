import * as PIXI from 'pixi.js';
import { ITerrainData, ITerrainConfig, ITerrainVisuals, IDestructionRegion } from './terrain-data';

/**
 * Classe responsável pela renderização do terreno
 */
export class TerrainRenderer {
  private visuals: ITerrainVisuals;
  private terrainData: ITerrainData | null = null;
  private config: ITerrainConfig | null = null;
  private renderer: PIXI.IRenderer;
  
  /**
   * Cria um novo renderizador de terreno
   * @param container Container PIXI para o terreno
   * @param renderer Renderer PIXI
   */
  constructor(container: PIXI.Container, renderer: PIXI.IRenderer) {
    this.visuals = {
      terrainGraphics: new PIXI.Graphics(),
      destructionMask: new PIXI.Graphics(),
      container
    };
    
    this.renderer = renderer;
    
    // Adiciona os elementos gráficos ao container
    container.addChild(this.visuals.terrainGraphics);
    container.addChild(this.visuals.destructionMask);
    
    // Configura a máscara como invisível
    this.visuals.destructionMask.visible = false;
  }
  
  /**
   * Renderiza o terreno com base nos dados fornecidos
   * @param terrainData Dados do terreno a renderizar
   * @param config Configurações visuais
   */
  render(terrainData: ITerrainData, config: ITerrainConfig): void {
    // Armazena referências
    this.terrainData = terrainData;
    this.config = config;
    
    // Limpa gráficos existentes
    this.clear();
    
    // Renderiza o terreno
    this.renderTerrainShape();
    
    // Adiciona textura visual
    this.addTerrainTexture();
    
    // Converte para textura para melhor desempenho
    this.convertToTexture();
  }
  
  /**
   * Limpa os elementos visuais do terreno
   */
  clear(): void {
    this.visuals.terrainGraphics.clear();
    this.visuals.destructionMask.clear();
    
    if (this.visuals.terrainSprite) {
      this.visuals.container.removeChild(this.visuals.terrainSprite);
      this.visuals.terrainSprite = undefined;
    }
    
    if (this.visuals.terrainTexture) {
      this.visuals.terrainTexture.destroy();
      this.visuals.terrainTexture = undefined;
    }
  }
  
  /**
   * Renderiza a forma básica do terreno
   * @private
   */
  private renderTerrainShape(): void {
    if (!this.terrainData || !this.config) return;
    
    const { heightMap, width, height } = this.terrainData;
    const terrainColor = this.config.terrainColor || 0x5B3A29; // Marrom para terra
    const borderColor = this.config.borderColor || 0x3D2817; // Marrom escuro para borda
    
    // Define o estilo de preenchimento
    this.visuals.terrainGraphics.beginFill(terrainColor);
    
    // Desenha a forma do terreno
    this.visuals.terrainGraphics.moveTo(0, height);
    
    for (let x = 0; x < heightMap.length; x++) {
      this.visuals.terrainGraphics.lineTo(x, heightMap[x]);
    }
    
    // Completa a forma fechando até o fundo da tela
    this.visuals.terrainGraphics.lineTo(width, height);
    this.visuals.terrainGraphics.lineTo(0, height);
    
    // Finaliza o preenchimento
    this.visuals.terrainGraphics.endFill();
    
    // Adiciona uma linha no topo (borda do terreno)
    this.visuals.terrainGraphics.lineStyle(2, borderColor);
    this.visuals.terrainGraphics.moveTo(0, heightMap[0]);
    
    for (let x = 1; x < heightMap.length; x++) {
      this.visuals.terrainGraphics.lineTo(x, heightMap[x]);
    }
  }
  
  /**
   * Adiciona textura visual ao terreno
   * @private
   */
  private addTerrainTexture(): void {
    if (!this.terrainData || !this.config) return;
    
    const { height } = this.terrainData;
    const textureColor = this.config.textureColor || 0x49311F;
    
    // Adiciona alguns detalhes aleatórios para simular textura
    this.visuals.terrainGraphics.lineStyle(1, textureColor, 0.5);
    
    // Cria linhas horizontais para simular camadas de terra
    for (let y = 0; y < height; y += 20) {
      const waviness = 5; // Amplitude da ondulação
      const frequency = 0.1; // Frequência da ondulação
      
      this.visuals.terrainGraphics.moveTo(0, y);
      
      for (let x = 0; x < this.terrainData.width; x += 10) {
        const offsetY = Math.sin(x * frequency) * waviness;
        this.visuals.terrainGraphics.lineTo(x, y + offsetY);
      }
    }
  }
  
  /**
   * Converte o terreno desenhado para uma textura para melhor performance
   * @private
   */
  private convertToTexture(): void {
    if (!this.terrainData) return;
    
    const { width, height } = this.terrainData;
    
    try {
      // Cria uma textura a partir dos gráficos usando o renderer armazenado
      this.visuals.terrainTexture = this.renderer.generateTexture(this.visuals.terrainGraphics);
      
      // Cria um sprite com a textura
      if (this.visuals.terrainTexture) {
        this.visuals.terrainSprite = new PIXI.Sprite(this.visuals.terrainTexture);
        
        // Adiciona o sprite ao container
        this.visuals.container.removeChild(this.visuals.terrainGraphics);
        this.visuals.container.addChild(this.visuals.terrainSprite);
        
        // Configura a máscara de destruição
        this.visuals.destructionMask.clear();
        this.visuals.destructionMask.beginFill(0xFF0000);
        this.visuals.destructionMask.drawRect(0, 0, width, height);
        this.visuals.destructionMask.endFill();
        
        // Adiciona a máscara ao container, mas torna invisível
        this.visuals.destructionMask.visible = false;
        this.visuals.container.addChild(this.visuals.destructionMask);
        
        // Aplica a máscara ao sprite do terreno
        this.visuals.terrainSprite.mask = this.visuals.destructionMask;
      }
    } catch (error) {
      console.error("Erro ao converter terreno para textura:", error);
      // Mantém o terrainGraphics como fallback
      this.visuals.terrainGraphics.visible = true;
    }
  }
  
  /**
   * Atualiza a máscara de destruição do terreno
   * @param region Região a ser destruída
   */
  applyDestructionMask(region: IDestructionRegion): void {
    if (!this.visuals.terrainSprite) return;
    
    // Atualiza a máscara de destruição
    this.visuals.destructionMask.beginFill(0x000000, 0);
    this.visuals.destructionMask.drawCircle(region.x, region.y, region.radius);
    this.visuals.destructionMask.endFill();
  }
  
  /**
   * Obtém os elementos visuais do terreno
   */
  getVisuals(): ITerrainVisuals {
    return this.visuals;
  }
} 