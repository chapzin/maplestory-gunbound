import { ITerrainData, ITerrainPosition } from './terrain-data';

/**
 * Classe com utilidades para o terreno
 */
export class TerrainUtility {
  private terrainData: ITerrainData | null = null;
  
  /**
   * Inicializa com os dados do terreno
   * @param terrainData Dados do terreno
   */
  initialize(terrainData: ITerrainData): void {
    this.terrainData = terrainData;
  }
  
  /**
   * Encontra posições adequadas para colocar objetos no terreno
   * @param count Número de posições a encontrar
   * @param minDistance Distância mínima entre as posições
   * @returns Array de posições {x, y}
   */
  findSuitablePositions(count: number, minDistance: number = 100): ITerrainPosition[] {
    if (!this.terrainData) {
      return [];
    }
    
    const { heightMap, width } = this.terrainData;
    const positions: ITerrainPosition[] = [];
    const attempts = count * 5; // Número de tentativas
    
    for (let i = 0; i < attempts && positions.length < count; i++) {
      // Escolhe um X aleatório, evitando as bordas
      const x = Math.floor(50 + Math.random() * (width - 100));
      
      // Encontra a altura do terreno nesse ponto
      const y = heightMap[x];
      
      // Verifica se o ponto está a uma distância mínima dos outros
      let tooClose = false;
      
      for (const pos of positions) {
        const distance = Math.sqrt(Math.pow(pos.x - x, 2) + Math.pow(pos.y - y, 2));
        if (distance < minDistance) {
          tooClose = true;
          break;
        }
      }
      
      // Se não estiver muito próximo, adiciona à lista
      if (!tooClose) {
        positions.push({ x, y });
      }
    }
    
    return positions;
  }
  
  /**
   * Encontra a altura do terreno em uma posição X específica
   * @param x Posição X
   * @returns Altura do terreno nessa posição ou -1 se fora dos limites
   */
  getHeightAt(x: number): number {
    if (!this.terrainData) {
      return -1;
    }
    
    const { heightMap, width } = this.terrainData;
    
    // Limita X aos limites do terreno
    if (x < 0 || x >= width) {
      return -1;
    }
    
    const clampedX = Math.max(0, Math.min(Math.floor(x), width - 1));
    return heightMap[clampedX];
  }
  
  /**
   * Encontra o ponto de colisão mais próximo no terreno
   * @param x Posição X
   * @param y Posição Y
   * @param maxDistance Distância máxima para procurar
   * @returns Ponto no terreno mais próximo ou null se não encontrar
   */
  findNearestTerrainPoint(x: number, y: number, maxDistance: number = 50): ITerrainPosition | null {
    if (!this.terrainData) {
      return null;
    }
    
    const { heightMap, width } = this.terrainData;
    
    // Limita a busca a uma área ao redor do ponto
    const startX = Math.max(0, Math.floor(x - maxDistance));
    const endX = Math.min(width - 1, Math.ceil(x + maxDistance));
    
    let nearestPoint: ITerrainPosition | null = null;
    let minDistance = maxDistance;
    
    // Verifica cada ponto dentro da área
    for (let i = startX; i <= endX; i++) {
      const terrainY = heightMap[i];
      const distance = Math.sqrt(Math.pow(i - x, 2) + Math.pow(terrainY - y, 2));
      
      if (distance < minDistance) {
        minDistance = distance;
        nearestPoint = { x: i, y: terrainY };
      }
    }
    
    return nearestPoint;
  }
  
  /**
   * Verifica se uma trajetória colide com o terreno
   * @param startX Posição inicial X
   * @param startY Posição inicial Y
   * @param endX Posição final X
   * @param endY Posição final Y
   * @param steps Número de passos para verificar
   * @returns Ponto de colisão ou null se não colidir
   */
  checkTrajectoryCollision(
    startX: number, 
    startY: number, 
    endX: number, 
    endY: number,
    steps: number = 10
  ): ITerrainPosition | null {
    if (!this.terrainData) {
      return null;
    }
    
    // Calcula o incremento para cada passo
    const stepX = (endX - startX) / steps;
    const stepY = (endY - startY) / steps;
    
    // Verifica cada ponto da trajetória
    for (let i = 0; i <= steps; i++) {
      const x = startX + stepX * i;
      const y = startY + stepY * i;
      
      // Obtém a altura do terreno nesse ponto
      const terrainHeight = this.getHeightAt(x);
      
      // Se o ponto estiver abaixo do terreno, há colisão
      if (terrainHeight !== -1 && y >= terrainHeight) {
        return { x, y: terrainHeight };
      }
    }
    
    // Não houve colisão
    return null;
  }
  
  /**
   * Retorna uma cópia do mapa de altura atual
   * @returns Array com as alturas do terreno ou array vazio se não inicializado
   */
  getHeightMap(): number[] {
    if (!this.terrainData) {
      return [];
    }
    
    return [...this.terrainData.heightMap];
  }
} 