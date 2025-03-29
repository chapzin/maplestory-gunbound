import * as PIXI from 'pixi.js';
import { CONFIG } from '../core/config';
import { createNoise2D } from 'simplex-noise';

/**
 * Classe responsável pela geração e manipulação do terreno
 */
export class Terrain {
  private container: PIXI.Container;
  private renderer: PIXI.IRenderer;
  private terrainGraphics: PIXI.Graphics;
  private heightMap: number[] = [];
  private terrainTexture: PIXI.Texture | undefined = undefined;
  private terrainSprite: PIXI.Sprite | undefined = undefined;
  private destructionMask: PIXI.Graphics;
  private noise2D: (x: number, y: number) => number;
  
  // Dimensões do terreno
  private width: number;
  private height: number;
  
  /**
   * Cria um novo gerenciador de terreno
   * @param container Container para armazenar os gráficos do terreno
   * @param renderer Renderer PIXI para criação de textura
   */
  constructor(container: PIXI.Container, renderer: PIXI.IRenderer) {
    this.container = container;
    this.renderer = renderer;
    this.width = renderer.width;
    this.height = renderer.height;
    
    // Cria elementos gráficos
    this.terrainGraphics = new PIXI.Graphics();
    this.destructionMask = new PIXI.Graphics();
    this.container.addChild(this.terrainGraphics);
    
    // Inicializa o gerador de ruído
    this.noise2D = createNoise2D();
  }
  
  /**
   * Gera um novo terreno
   */
  generate(): void {
    // Limpa o container e reseta o heightMap
    this.clear();
    
    // Gera o mapa de altura com ruído Simplex
    this.generateHeightMap();
    
    // Renderiza o terreno inicial
    this.renderTerrain();
    
    // Converte para textura para melhor performance
    this.convertToTexture();
  }
  
  /**
   * Limpa o terreno atual
   */
  clear(): void {
    this.heightMap = [];
    this.terrainGraphics.clear();
    
    if (this.terrainSprite) {
      this.container.removeChild(this.terrainSprite);
      this.terrainSprite = undefined;
    }
    
    if (this.terrainTexture) {
      this.terrainTexture.destroy();
      this.terrainTexture = undefined;
    }
    
    this.destructionMask.clear();
  }
  
  /**
   * Gera um mapa de altura usando ruído Simplex
   */
  private generateHeightMap(): void {
    const segments = this.width; // Um ponto por pixel na largura
    
    // Valores para configurar o ruído
    const scale = 0.01; // Escala do ruído (menores valores = terreno mais suave)
    const amplitude = this.height * 0.3; // Amplitude do terreno (altura máxima)
    const baseHeight = this.height * 0.7; // Altura base (linha onde o terreno começa)
    
    // Cria pontos do mapa de altura
    for (let x = 0; x < segments; x++) {
      // Gera valor de ruído (entre -1 e 1)
      const noiseValue = this.noise2D(x * scale, 0);
      
      // Converte para altura do terreno
      const height = baseHeight + noiseValue * amplitude;
      
      // Adiciona ao mapa de altura
      this.heightMap.push(height);
    }
    
    // Aplica um filtro de suavização
    this.smoothHeightMap();
    
    // Adiciona algumas variações para tornar o terreno mais interessante
    this.addTerrainFeatures();
  }
  
  /**
   * Suaviza o mapa de altura para evitar mudanças bruscas
   */
  private smoothHeightMap(): void {
    const smoothedMap = [...this.heightMap];
    const windowSize = 5; // Tamanho da janela de suavização
    
    for (let i = 0; i < this.heightMap.length; i++) {
      let sum = 0;
      let count = 0;
      
      // Calcula a média dos pontos vizinhos
      for (let j = Math.max(0, i - windowSize); j <= Math.min(this.heightMap.length - 1, i + windowSize); j++) {
        sum += this.heightMap[j];
        count++;
      }
      
      smoothedMap[i] = sum / count;
    }
    
    this.heightMap = smoothedMap;
  }
  
  /**
   * Adiciona características específicas ao terreno
   */
  private addTerrainFeatures(): void {
    // Adiciona algumas plataformas planas para posicionamento de veículos
    const platforms = 3 + Math.floor(Math.random() * 3); // 3-5 plataformas
    const platformWidth = 50; // Largura da plataforma
    
    for (let i = 0; i < platforms; i++) {
      // Posição aleatória para a plataforma
      const startIndex = Math.floor(Math.random() * (this.width - platformWidth));
      const height = this.heightMap[startIndex];
      
      // Cria uma plataforma plana
      for (let j = 0; j < platformWidth; j++) {
        if (startIndex + j < this.width) {
          this.heightMap[startIndex + j] = height;
        }
      }
    }
  }
  
  /**
   * Renderiza o terreno usando os valores do mapa de altura
   */
  private renderTerrain(): void {
    // Limpa os gráficos existentes
    this.terrainGraphics.clear();
    
    // Define o estilo de preenchimento
    this.terrainGraphics.beginFill(0x5B3A29); // Marrom para terra
    
    // Desenha a forma do terreno
    this.terrainGraphics.moveTo(0, this.height);
    
    for (let x = 0; x < this.heightMap.length; x++) {
      this.terrainGraphics.lineTo(x, this.heightMap[x]);
    }
    
    // Completa a forma fechando até o fundo da tela
    this.terrainGraphics.lineTo(this.width, this.height);
    this.terrainGraphics.lineTo(0, this.height);
    
    // Finaliza o preenchimento
    this.terrainGraphics.endFill();
    
    // Adiciona uma linha no topo (borda do terreno)
    this.terrainGraphics.lineStyle(2, 0x3D2817);
    this.terrainGraphics.moveTo(0, this.heightMap[0]);
    
    for (let x = 1; x < this.heightMap.length; x++) {
      this.terrainGraphics.lineTo(x, this.heightMap[x]);
    }
    
    // Adiciona alguma textura ao terreno
    this.addTerrainTexture();
  }
  
  /**
   * Adiciona textura visual ao terreno
   */
  private addTerrainTexture(): void {
    // Adiciona alguns detalhes aleatórios para simular textura
    this.terrainGraphics.lineStyle(1, 0x49311F, 0.5);
    
    // Cria linhas horizontais para simular camadas de terra
    for (let y = 0; y < this.height; y += 20) {
      const waviness = 5; // Amplitude da ondulação
      const frequency = 0.1; // Frequência da ondulação
      
      this.terrainGraphics.moveTo(0, y);
      
      for (let x = 0; x < this.width; x += 10) {
        const offsetY = Math.sin(x * frequency) * waviness;
        this.terrainGraphics.lineTo(x, y + offsetY);
      }
    }
  }
  
  /**
   * Converte o terreno desenhado para uma textura para melhor performance
   */
  private convertToTexture(): void {
    try {
      // Cria uma textura a partir dos gráficos
      this.terrainTexture = this.renderer.generateTexture(this.terrainGraphics);
      
      // Cria um sprite com a textura
      if (this.terrainTexture) {
        this.terrainSprite = new PIXI.Sprite(this.terrainTexture);
        
        // Adiciona o sprite ao container
        this.container.removeChild(this.terrainGraphics);
        this.container.addChild(this.terrainSprite);
        
        // Configura a máscara de destruição
        this.destructionMask = new PIXI.Graphics();
        this.destructionMask.beginFill(0xFF0000);
        this.destructionMask.drawRect(0, 0, this.width, this.height);
        this.destructionMask.endFill();
        
        // Adiciona a máscara ao container, mas torna invisível
        this.destructionMask.visible = false;
        this.container.addChild(this.destructionMask);
        
        // Aplica a máscara ao sprite do terreno
        this.terrainSprite.mask = this.destructionMask;
      }
    } catch (error) {
      console.error("Erro ao converter terreno para textura:", error);
      // Mantém o terrainGraphics como fallback
      this.terrainGraphics.visible = true;
    }
  }
  
  /**
   * Verifica se um ponto colide com o terreno
   * @param x Coordenada X
   * @param y Coordenada Y
   * @param radius Raio opcional para verificar área circular
   * @returns Verdadeiro se há colisão
   */
  checkCollision(x: number, y: number, radius: number = 1): boolean {
    // Se está fora dos limites laterais, não há colisão
    if (x < 0 || x >= this.width) {
      return false;
    }
    
    // Se está abaixo da tela, há colisão
    if (y >= this.height) {
      return true;
    }
    
    // Se está acima da tela, não há colisão
    if (y < 0) {
      return false;
    }
    
    // Índice do ponto no mapa de altura (arredonda para o inteiro mais próximo)
    const index = Math.round(x);
    
    // Altura do terreno naquele ponto
    const terrainHeight = this.heightMap[index];
    
    // Verifica colisão com o raio
    if (radius > 1) {
      // Verifica pontos ao redor dentro do raio
      for (let offsetX = -radius; offsetX <= radius; offsetX++) {
        const checkX = index + offsetX;
        
        // Pula pontos fora dos limites
        if (checkX < 0 || checkX >= this.width) {
          continue;
        }
        
        // Calcula a distância entre o centro do círculo e o ponto do terreno
        const checkHeight = this.heightMap[checkX];
        const distX = offsetX;
        const distY = y - checkHeight;
        const distance = Math.sqrt(distX * distX + distY * distY);
        
        // Se a distância for menor que o raio, há colisão
        if (distance < radius) {
          return true;
        }
      }
      
      return false;
    }
    
    // Colisão simples de ponto
    return y >= terrainHeight;
  }
  
  /**
   * Destrói uma área circular do terreno
   * @param x Centro X da explosão
   * @param y Centro Y da explosão
   * @param radius Raio da destruição
   */
  destroyAt(x: number, y: number, radius: number): void {
    // Atualiza a máscara de destruição
    this.destructionMask.beginFill(0x000000, 0);
    this.destructionMask.drawCircle(x, y, radius);
    this.destructionMask.endFill();
    
    // Atualiza o mapa de altura na área afetada
    const startX = Math.max(0, Math.floor(x - radius));
    const endX = Math.min(this.width - 1, Math.ceil(x + radius));
    
    for (let i = startX; i <= endX; i++) {
      // Calcula a distância do ponto ao centro da explosão no eixo X
      const dx = i - x;
      
      // Calcula a altura máxima da destruição em cada ponto
      // (diminui conforme se afasta do centro)
      const impact = Math.sqrt(radius * radius - dx * dx);
      
      // Atualiza o mapa de altura
      if (this.heightMap[i] < y + impact) {
        this.heightMap[i] = Math.min(this.heightMap[i], y - impact);
      }
    }
  }
  
  /**
   * Encontra posições adequadas para colocar objetos no terreno
   * @param count Número de posições a encontrar
   * @param minDistance Distância mínima entre as posições
   * @returns Array de posições {x, y}
   */
  findSuitablePositions(count: number, minDistance: number = 100): {x: number, y: number}[] {
    const positions: {x: number, y: number}[] = [];
    const attempts = count * 5; // Número de tentativas
    
    for (let i = 0; i < attempts && positions.length < count; i++) {
      // Escolhe um X aleatório, evitando as bordas
      const x = Math.floor(50 + Math.random() * (this.width - 100));
      
      // Encontra a altura do terreno nesse ponto
      const y = this.heightMap[x];
      
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
   * Retorna o mapa de altura atual
   * @returns Array com as alturas do terreno
   */
  getHeightMap(): number[] {
    return [...this.heightMap];
  }
  
  /**
   * Obtém a altura do terreno em uma posição X específica
   * @param x Posição X
   * @returns Altura do terreno nessa posição
   */
  getHeightAt(x: number): number {
    // Limita X aos limites do terreno
    const clampedX = Math.max(0, Math.min(Math.floor(x), this.width - 1));
    return this.heightMap[clampedX];
  }
} 