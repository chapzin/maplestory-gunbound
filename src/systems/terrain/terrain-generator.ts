import { createNoise2D } from 'simplex-noise';
import { ITerrainData, ITerrainConfig } from './terrain-data';

/**
 * Classe responsável pela geração do terreno
 */
export class TerrainGenerator {
  private noise2D: (x: number, y: number) => number;
  
  /**
   * Cria um novo gerador de terreno
   */
  constructor() {
    // Inicializa o gerador de ruído
    this.noise2D = createNoise2D();
  }
  
  /**
   * Gera um novo terreno com as configurações especificadas
   * @param config Configurações do terreno
   * @returns Dados do terreno gerado
   */
  generate(config: ITerrainConfig): ITerrainData {
    // Cria um novo mapa de altura vazio
    const heightMap: number[] = [];
    
    // Extrai configurações com valores padrão
    const {
      width,
      height,
      noiseScale = 0.01,
      amplitude = height * 0.3,
      baseHeight = height * 0.7,
      platformCount = 3 + Math.floor(Math.random() * 3),
      platformWidth = 50
    } = config;
    
    // Gera o mapa de altura inicial usando ruído Simplex
    this.generateBaseHeightMap(heightMap, width, height, noiseScale, amplitude, baseHeight);
    
    // Aplica suavização ao terreno
    this.smoothHeightMap(heightMap, config.smoothingFactor || 5);
    
    // Adiciona plataformas e outras características
    this.addTerrainFeatures(heightMap, width, platformCount, platformWidth);
    
    // Retorna os dados do terreno
    return {
      heightMap,
      width,
      height
    };
  }
  
  /**
   * Gera o mapa de altura base usando ruído Simplex
   * @private
   */
  private generateBaseHeightMap(
    heightMap: number[],
    width: number,
    height: number,
    noiseScale: number,
    amplitude: number,
    baseHeight: number
  ): void {
    // Gera a altura para cada ponto do terreno
    for (let x = 0; x < width; x++) {
      // Gera valor de ruído (entre -1 e 1)
      const noiseValue = this.noise2D(x * noiseScale, 0);
      
      // Converte para altura do terreno
      const terrainHeight = baseHeight + noiseValue * amplitude;
      
      // Adiciona ao mapa de altura
      heightMap.push(terrainHeight);
    }
  }
  
  /**
   * Suaviza o mapa de altura para evitar mudanças bruscas
   * @private
   */
  private smoothHeightMap(heightMap: number[], windowSize: number): void {
    const smoothedMap = [...heightMap];
    
    for (let i = 0; i < heightMap.length; i++) {
      let sum = 0;
      let count = 0;
      
      // Calcula a média dos pontos vizinhos
      for (let j = Math.max(0, i - windowSize); j <= Math.min(heightMap.length - 1, i + windowSize); j++) {
        sum += heightMap[j];
        count++;
      }
      
      smoothedMap[i] = sum / count;
    }
    
    // Atualiza o mapa de altura com os valores suavizados
    for (let i = 0; i < heightMap.length; i++) {
      heightMap[i] = smoothedMap[i];
    }
  }
  
  /**
   * Adiciona características específicas ao terreno, como plataformas
   * @private
   */
  private addTerrainFeatures(
    heightMap: number[],
    width: number,
    platformCount: number,
    platformWidth: number
  ): void {
    // Adiciona plataformas planas para posicionamento de veículos
    for (let i = 0; i < platformCount; i++) {
      // Posição aleatória para a plataforma
      const startIndex = Math.floor(Math.random() * (width - platformWidth));
      const height = heightMap[startIndex];
      
      // Cria uma plataforma plana
      for (let j = 0; j < platformWidth; j++) {
        if (startIndex + j < width) {
          heightMap[startIndex + j] = height;
        }
      }
    }
  }
  
  /**
   * Regenera o terreno usando uma nova semente aleatória
   * @param config Configurações do terreno
   * @returns Novo terreno gerado
   */
  regenerate(config: ITerrainConfig): ITerrainData {
    // Recria o gerador de ruído para obter uma nova semente
    this.noise2D = createNoise2D();
    
    // Gera um novo terreno
    return this.generate(config);
  }
} 