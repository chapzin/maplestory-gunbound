import * as PIXI from 'pixi.js';

/**
 * Interface para os dados do terreno
 */
export interface ITerrainData {
  // Mapa de altura do terreno
  heightMap: number[];
  
  // Dimensões do terreno
  width: number;
  height: number;
}

/**
 * Interface para configuração do terreno
 */
export interface ITerrainConfig {
  // Dimensões do terreno
  width: number;
  height: number;
  
  // Configurações de geração
  noiseScale?: number;       // Escala do ruído (padrão: 0.01)
  amplitude?: number;        // Amplitude da variação de altura (padrão: 30% da altura)
  baseHeight?: number;       // Altura base do terreno (padrão: 70% da altura)
  smoothingFactor?: number;  // Suavização do terreno (padrão: 5)
  
  // Configurações de plataformas
  platformCount?: number;    // Número de plataformas (padrão: 3-5)
  platformWidth?: number;    // Largura das plataformas (padrão: 50px)
  
  // Configurações visuais
  terrainColor?: number;     // Cor do terreno (padrão: 0x5B3A29 - marrom)
  borderColor?: number;      // Cor da borda (padrão: 0x3D2817 - marrom escuro)
  textureColor?: number;     // Cor das linhas de textura (padrão: 0x49311F)
}

/**
 * Interface para elementos visuais do terreno
 */
export interface ITerrainVisuals {
  terrainGraphics: PIXI.Graphics;
  terrainSprite?: PIXI.Sprite;
  terrainTexture?: PIXI.Texture;
  destructionMask: PIXI.Graphics;
  container: PIXI.Container;
}

/**
 * Tipo para resultado de colisão com terreno
 */
export interface ITerrainCollisionResult {
  collision: boolean;
  point?: { x: number, y: number }; // Ponto de colisão, se houver
  normal?: { x: number, y: number }; // Vetor normal no ponto de colisão
}

/**
 * Tipo para posição no terreno
 */
export interface ITerrainPosition {
  x: number;
  y: number;
}

/**
 * Tipo para região de destruição
 */
export interface IDestructionRegion {
  x: number;
  y: number;
  radius: number;
} 