import * as PIXI from 'pixi.js';
import { 
  TerrainManager,
  ITerrainConfig,
  ITerrainPosition,
  ITerrainCollisionResult
} from './terrain/index';

/**
 * Adaptador do sistema de terreno
 * Fornece uma interface compatível com o código existente
 */
export class TerrainSystem {
  private manager: TerrainManager;
  
  /**
   * Cria um novo adaptador para o sistema de terreno
   * @param container Container PIXI para o terreno
   * @param renderer Renderer PIXI
   */
  constructor(container: PIXI.Container, renderer: PIXI.IRenderer) {
    // Configuração padrão do terreno
    const config: ITerrainConfig = {
      width: renderer.width,
      height: renderer.height
    };
    
    // Cria o gerenciador de terreno
    this.manager = new TerrainManager(container, renderer, config);
  }
  
  /**
   * Atualiza o sistema de terreno
   * @param deltaTime Delta time em segundos
   */
  update(deltaTime: number): void {
    // O sistema de terreno atual não precisa de atualizações por frame
    // Este método existe para compatibilidade com a interface esperada
    // Se no futuro o terreno precisar de atualizações contínuas, a lógica será adicionada aqui
  }
  
  /**
   * Gera um novo terreno
   */
  generate(): void {
    this.manager.generate();
  }
  
  /**
   * Limpa o terreno atual
   */
  clear(): void {
    this.manager.clear();
  }
  
  /**
   * Verifica colisão com o terreno
   * @param x Coordenada X
   * @param y Coordenada Y
   * @param radius Raio opcional para verificar área circular
   * @returns Verdadeiro se há colisão
   */
  checkCollision(x: number, y: number, radius: number = 1): boolean {
    const result = this.manager.checkCollision(x, y, radius);
    return result.collision;
  }
  
  /**
   * Destrói uma área do terreno
   * @param x Centro X da explosão
   * @param y Centro Y da explosão
   * @param radius Raio da destruição
   */
  destroyAt(x: number, y: number, radius: number): void {
    this.manager.destroyAt(x, y, radius);
  }
  
  /**
   * Encontra posições adequadas para colocar objetos no terreno
   * @param count Número de posições a encontrar
   * @param minDistance Distância mínima entre as posições
   * @returns Array de posições {x, y}
   */
  findSuitablePositions(count: number, minDistance: number = 100): {x: number, y: number}[] {
    return this.manager.findSuitablePositions(count, minDistance);
  }
  
  /**
   * Retorna o mapa de altura atual
   * @returns Array com as alturas do terreno
   */
  getHeightMap(): number[] {
    return this.manager.getHeightMap();
  }
  
  /**
   * Obtém a altura do terreno em uma posição X específica
   * @param x Posição X
   * @returns Altura do terreno nessa posição
   */
  getHeightAt(x: number): number {
    return this.manager.getHeightAt(x);
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
    return this.manager.checkTrajectoryCollision(startX, startY, endX, endY);
  }
  
  /**
   * Regenera o terreno com uma nova semente aleatória
   */
  regenerate(): void {
    this.manager.regenerate();
  }
} 