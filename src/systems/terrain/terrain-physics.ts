import { ITerrainData, ITerrainCollisionResult, IDestructionRegion } from './terrain-data';

/**
 * Classe responsável pela física do terreno
 */
export class TerrainPhysics {
  private terrainData: ITerrainData | null = null;
  
  /**
   * Inicializa a física do terreno com os dados fornecidos
   * @param terrainData Dados do terreno
   */
  initialize(terrainData: ITerrainData): void {
    this.terrainData = terrainData;
  }
  
  /**
   * Verifica se um ponto colide com o terreno
   * @param x Coordenada X
   * @param y Coordenada Y
   * @param radius Raio opcional para verificar área circular
   * @returns Resultado da colisão
   */
  checkCollision(x: number, y: number, radius: number = 1): ITerrainCollisionResult {
    if (!this.terrainData) {
      return { collision: false };
    }
    
    const { heightMap, width, height } = this.terrainData;
    
    // Se está fora dos limites laterais, não há colisão
    if (x < 0 || x >= width) {
      return { collision: false };
    }
    
    // Se está abaixo da tela, há colisão
    if (y >= height) {
      return { 
        collision: true,
        point: { x, y: height },
        normal: { x: 0, y: -1 }
      };
    }
    
    // Se está acima da tela, não há colisão
    if (y < 0) {
      return { collision: false };
    }
    
    // Índice do ponto no mapa de altura (arredonda para o inteiro mais próximo)
    const index = Math.round(x);
    
    // Altura do terreno naquele ponto
    const terrainHeight = heightMap[index];
    
    // Verifica colisão com o raio
    if (radius > 1) {
      // Verifica pontos ao redor dentro do raio
      for (let offsetX = -radius; offsetX <= radius; offsetX++) {
        const checkX = index + offsetX;
        
        // Pula pontos fora dos limites
        if (checkX < 0 || checkX >= width) {
          continue;
        }
        
        // Calcula a distância entre o centro do círculo e o ponto do terreno
        const checkHeight = heightMap[checkX];
        const distX = offsetX;
        const distY = y - checkHeight;
        const distance = Math.sqrt(distX * distX + distY * distY);
        
        // Se a distância for menor que o raio, há colisão
        if (distance < radius) {
          // Calcula o vetor normal no ponto de colisão
          const normal = this.calculateNormal(checkX, checkHeight);
          
          return { 
            collision: true,
            point: { x: checkX, y: checkHeight },
            normal
          };
        }
      }
      
      return { collision: false };
    }
    
    // Colisão simples de ponto
    const collision = y >= terrainHeight;
    
    if (collision) {
      // Calcula o vetor normal no ponto de colisão
      const normal = this.calculateNormal(index, terrainHeight);
      
      return {
        collision: true,
        point: { x: index, y: terrainHeight },
        normal
      };
    }
    
    return { collision: false };
  }
  
  /**
   * Calcula o vetor normal do terreno em um ponto específico
   * @param x Coordenada X do ponto
   * @param y Coordenada Y do ponto
   * @returns Vetor normal normalizado
   */
  private calculateNormal(x: number, y: number): { x: number, y: number } {
    if (!this.terrainData) {
      return { x: 0, y: -1 };
    }
    
    const { heightMap, width } = this.terrainData;
    
    // Se estiver nas bordas, usa um vetor padrão
    if (x <= 0 || x >= width - 1) {
      return { x: 0, y: -1 };
    }
    
    // Obtém os pontos adjacentes
    const leftHeight = heightMap[Math.floor(x) - 1];
    const rightHeight = heightMap[Math.floor(x) + 1];
    
    // Calcula o vetor tangente (perpendicular à normal)
    const tangentX = 2; // Distância entre os pontos
    const tangentY = rightHeight - leftHeight;
    
    // A normal é perpendicular à tangente
    const normalX = -tangentY;
    const normalY = tangentX;
    
    // Normaliza o vetor
    const length = Math.sqrt(normalX * normalX + normalY * normalY);
    
    if (length === 0) {
      return { x: 0, y: -1 };
    }
    
    return {
      x: normalX / length,
      y: normalY / length
    };
  }
  
  /**
   * Aplica uma explosão que destrói uma parte do terreno
   * @param region Região a ser destruída
   * @returns Dados do terreno atualizados
   */
  applyExplosion(region: IDestructionRegion): ITerrainData | null {
    if (!this.terrainData) {
      return null;
    }
    
    const { heightMap, width, height } = this.terrainData;
    const { x, y, radius } = region;
    
    // Determina a área afetada
    const startX = Math.max(0, Math.floor(x - radius));
    const endX = Math.min(width - 1, Math.ceil(x + radius));
    
    // Cria uma cópia do mapa de altura para modificar
    const updatedHeightMap = [...heightMap];
    
    // Atualiza o mapa de altura na área afetada
    for (let i = startX; i <= endX; i++) {
      // Calcula a distância do ponto ao centro da explosão no eixo X
      const dx = i - x;
      
      // Calcula a altura máxima da destruição em cada ponto
      // (diminui conforme se afasta do centro)
      const impact = Math.sqrt(Math.max(0, radius * radius - dx * dx));
      
      // Só atualiza se o ponto estiver no raio da explosão
      if (impact > 0) {
        // Atualiza o mapa de altura
        if (updatedHeightMap[i] < y + impact) {
          updatedHeightMap[i] = Math.min(updatedHeightMap[i], y - impact);
        }
      }
    }
    
    // Retorna os dados atualizados
    const updatedTerrainData = {
      heightMap: updatedHeightMap,
      width,
      height
    };
    
    // Atualiza a referência interna
    this.terrainData = updatedTerrainData;
    
    return updatedTerrainData;
  }
  
  /**
   * Obtém os dados do terreno atual
   */
  getTerrainData(): ITerrainData | null {
    return this.terrainData;
  }
} 