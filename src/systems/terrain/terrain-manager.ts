import * as PIXI from 'pixi.js';
import { 
  ITerrainData, 
  ITerrainConfig, 
  ITerrainCollisionResult, 
  ITerrainPosition,
  IDestructionRegion
} from './terrain-data';
import { TerrainGenerator } from './terrain-generator';
import { TerrainRenderer } from './terrain-renderer';
import { TerrainPhysics } from './terrain-physics';
import { TerrainUtility } from './terrain-utility';

/**
 * Gerenciador principal do sistema de terreno
 * Coordena a geração, renderização, física e utilidades do terreno
 */
export class TerrainManager {
  private terrainData: ITerrainData | null = null;
  private config: ITerrainConfig;
  
  private generator: TerrainGenerator;
  private renderer: TerrainRenderer;
  private physics: TerrainPhysics;
  private utility: TerrainUtility;
  
  /**
   * Cria um novo gerenciador de terreno
   * @param container Container PIXI para o terreno
   * @param renderer Renderer PIXI
   * @param config Configurações do terreno
   */
  constructor(
    container: PIXI.Container, 
    renderer: PIXI.IRenderer,
    config: ITerrainConfig
  ) {
    this.config = config;
    
    // Inicializa os componentes
    this.generator = new TerrainGenerator();
    this.renderer = new TerrainRenderer(container, renderer);
    this.physics = new TerrainPhysics();
    this.utility = new TerrainUtility();
  }
  
  /**
   * Gera um novo terreno
   */
  generate(): void {
    // Gera os dados do terreno
    this.terrainData = this.generator.generate(this.config);
    
    // Inicializa os componentes com os dados gerados
    this.physics.initialize(this.terrainData);
    this.utility.initialize(this.terrainData);
    
    // Renderiza o terreno
    this.renderer.render(this.terrainData, this.config);
  }
  
  /**
   * Limpa o terreno atual
   */
  clear(): void {
    this.terrainData = null;
    this.renderer.clear();
  }
  
  /**
   * Verifica colisão com o terreno
   * @param x Coordenada X
   * @param y Coordenada Y
   * @param radius Raio opcional para verificar área circular
   * @returns Resultado da colisão
   */
  checkCollision(x: number, y: number, radius: number = 1): ITerrainCollisionResult {
    return this.physics.checkCollision(x, y, radius);
  }
  
  /**
   * Destrói uma área do terreno
   * @param x Centro X da explosão
   * @param y Centro Y da explosão
   * @param radius Raio da destruição
   */
  destroyAt(x: number, y: number, radius: number): void {
    // Define a região a ser destruída
    const region: IDestructionRegion = { x, y, radius };
    
    // Aplica a explosão aos dados do terreno
    const updatedData = this.physics.applyExplosion(region);
    
    // Se a explosão funcionou, atualiza os dados e a renderização
    if (updatedData) {
      this.terrainData = updatedData;
      
      // Atualiza os outros componentes
      this.utility.initialize(updatedData);
      
      // Atualiza a máscara de destruição no renderer
      this.renderer.applyDestructionMask(region);
    }
  }
  
  /**
   * Encontra posições adequadas para objetos no terreno
   * @param count Número de posições a encontrar
   * @param minDistance Distância mínima entre posições
   * @returns Array de posições
   */
  findSuitablePositions(count: number, minDistance: number = 100): ITerrainPosition[] {
    return this.utility.findSuitablePositions(count, minDistance);
  }
  
  /**
   * Obtém a altura do terreno em uma posição X
   * @param x Coordenada X
   * @returns Altura do terreno nessa posição
   */
  getHeightAt(x: number): number {
    return this.utility.getHeightAt(x);
  }
  
  /**
   * Regenera o terreno com uma nova semente aleatória
   */
  regenerate(): void {
    // Limpa o terreno existente
    this.clear();
    
    // Gera um novo terreno
    this.terrainData = this.generator.regenerate(this.config);
    
    // Inicializa os componentes com os novos dados
    this.physics.initialize(this.terrainData);
    this.utility.initialize(this.terrainData);
    
    // Renderiza o novo terreno
    this.renderer.render(this.terrainData, this.config);
  }
  
  /**
   * Retorna o mapa de altura atual
   * @returns Array com as alturas do terreno
   */
  getHeightMap(): number[] {
    return this.utility.getHeightMap();
  }
  
  /**
   * Obtém os dados do terreno atual
   * @returns Dados do terreno
   */
  getTerrainData(): ITerrainData | null {
    return this.terrainData;
  }
  
  /**
   * Verifica colisão de uma trajetória com o terreno
   * @param startX Posição inicial X
   * @param startY Posição inicial Y
   * @param endX Posição final X
   * @param endY Posição final Y
   * @returns Ponto de colisão ou null se não colidir
   */
  checkTrajectoryCollision(
    startX: number, 
    startY: number, 
    endX: number, 
    endY: number
  ): ITerrainPosition | null {
    return this.utility.checkTrajectoryCollision(startX, startY, endX, endY);
  }
} 