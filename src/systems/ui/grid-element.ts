import * as PIXI from 'pixi.js';
import { BaseUIElement } from './base-ui-element';
import { UIElement } from './ui-types';

/**
 * Posição de alinhamento dentro de uma célula
 */
export enum CellAlignment {
  TOP_LEFT,
  TOP_CENTER,
  TOP_RIGHT,
  MIDDLE_LEFT,
  MIDDLE_CENTER,
  MIDDLE_RIGHT,
  BOTTOM_LEFT,
  BOTTOM_CENTER,
  BOTTOM_RIGHT
}

/**
 * Opções para configuração da grade
 */
export interface GridOptions {
  width: number;
  height: number;
  rows: number;
  columns: number;
  cellPadding?: number;
  backgroundColor?: number;
  showGrid?: boolean;
  gridColor?: number;
  gridAlpha?: number;
}

/**
 * Elemento que organiza outros elementos em um layout de grade
 */
export class GridElement extends BaseUIElement {
  private container: PIXI.Container;
  private background: PIXI.Graphics;
  private gridLines: PIXI.Graphics;
  private cells: Array<Array<UIElement | null>>;
  
  private options: GridOptions;
  private cellWidth: number;
  private cellHeight: number;
  
  /**
   * Cria um novo elemento de grade
   * @param id Identificador único
   * @param x Posição X
   * @param y Posição Y
   * @param options Opções da grade
   */
  constructor(id: string, x: number, y: number, options: GridOptions) {
    // Configura valores padrão para opções não especificadas
    const defaultOptions: GridOptions = {
      width: 400,
      height: 300,
      rows: 3,
      columns: 3,
      cellPadding: 5,
      backgroundColor: 0xFFFFFF,
      showGrid: true,
      gridColor: 0xCCCCCC,
      gridAlpha: 0.5
    };
    
    // Mescla opções fornecidas com valores padrão
    const mergedOptions = { ...defaultOptions, ...options };
    
    // Cria o container principal
    const container = new PIXI.Container();
    container.position.set(x, y);
    
    // Inicializa a classe base
    super(id, container);
    
    // Atribui aos campos da classe
    this.container = container;
    this.options = mergedOptions;
    this.cellWidth = this.options.width / this.options.columns;
    this.cellHeight = this.options.height / this.options.rows;
    
    // Cria fundo
    this.background = new PIXI.Graphics();
    this.drawBackground();
    this.container.addChild(this.background);
    
    // Cria linhas da grade
    this.gridLines = new PIXI.Graphics();
    if (this.options.showGrid) {
      this.drawGridLines();
    }
    this.container.addChild(this.gridLines);
    
    // Inicializa matriz de células vazias
    this.cells = Array(this.options.rows).fill(null)
      .map(() => Array(this.options.columns).fill(null));
  }
  
  /**
   * Desenha o fundo da grade
   */
  private drawBackground(): void {
    const { width, height, backgroundColor } = this.options;
    
    this.background.clear();
    this.background.beginFill(backgroundColor);
    this.background.drawRect(0, 0, width, height);
    this.background.endFill();
  }
  
  /**
   * Desenha as linhas da grade
   */
  private drawGridLines(): void {
    const { width, height, rows, columns, gridColor, gridAlpha } = this.options;
    
    this.gridLines.clear();
    this.gridLines.lineStyle(1, gridColor, gridAlpha);
    
    // Linhas horizontais
    for (let i = 1; i < rows; i++) {
      const y = i * this.cellHeight;
      this.gridLines.moveTo(0, y);
      this.gridLines.lineTo(width, y);
    }
    
    // Linhas verticais
    for (let j = 1; j < columns; j++) {
      const x = j * this.cellWidth;
      this.gridLines.moveTo(x, 0);
      this.gridLines.lineTo(x, height);
    }
  }
  
  /**
   * Adiciona um elemento em uma célula específica
   * @param element Elemento a ser adicionado
   * @param row Índice da linha (0-based)
   * @param column Índice da coluna (0-based)
   * @param alignment Alinhamento dentro da célula
   * @returns Verdadeiro se o elemento foi adicionado com sucesso
   */
  addElement(
    element: UIElement, 
    row: number, 
    column: number, 
    alignment: CellAlignment = CellAlignment.MIDDLE_CENTER
  ): boolean {
    // Verifica se a célula está dentro dos limites
    if (row < 0 || row >= this.options.rows || column < 0 || column >= this.options.columns) {
      console.warn(`Célula (${row}, ${column}) está fora dos limites da grade ${this.id}`);
      return false;
    }
    
    // Verifica se a célula já está ocupada
    if (this.cells[row][column] !== null) {
      console.warn(`Célula (${row}, ${column}) já está ocupada na grade ${this.id}`);
      return false;
    }
    
    // Calcula a posição base da célula
    const cellX = column * this.cellWidth;
    const cellY = row * this.cellHeight;
    
    // Ajusta a posição com base no alinhamento
    const padding = this.options.cellPadding || 0;
    const innerWidth = this.cellWidth - (padding * 2);
    const innerHeight = this.cellHeight - (padding * 2);
    
    let elementX = cellX + padding;
    let elementY = cellY + padding;
    
    // Ajuste horizontal
    if (alignment === CellAlignment.TOP_CENTER || 
        alignment === CellAlignment.MIDDLE_CENTER || 
        alignment === CellAlignment.BOTTOM_CENTER) {
      elementX += innerWidth / 2;
    } else if (alignment === CellAlignment.TOP_RIGHT || 
              alignment === CellAlignment.MIDDLE_RIGHT || 
              alignment === CellAlignment.BOTTOM_RIGHT) {
      elementX += innerWidth;
    }
    
    // Ajuste vertical
    if (alignment === CellAlignment.MIDDLE_LEFT || 
        alignment === CellAlignment.MIDDLE_CENTER || 
        alignment === CellAlignment.MIDDLE_RIGHT) {
      elementY += innerHeight / 2;
    } else if (alignment === CellAlignment.BOTTOM_LEFT || 
              alignment === CellAlignment.BOTTOM_CENTER || 
              alignment === CellAlignment.BOTTOM_RIGHT) {
      elementY += innerHeight;
    }
    
    // Define a posição do elemento
    element.displayObject.position.set(elementX, elementY);
    
    // Adiciona ao container e à matriz
    this.container.addChild(element.displayObject);
    this.cells[row][column] = element;
    
    return true;
  }
  
  /**
   * Remove um elemento de uma célula específica
   * @param row Índice da linha
   * @param column Índice da coluna
   * @returns Verdadeiro se o elemento foi removido
   */
  removeElement(row: number, column: number): boolean {
    // Verifica se a célula está dentro dos limites
    if (row < 0 || row >= this.options.rows || column < 0 || column >= this.options.columns) {
      return false;
    }
    
    const element = this.cells[row][column];
    if (element) {
      // Remove o elemento do container
      this.container.removeChild(element.displayObject);
      
      // Limpa a referência na matriz
      this.cells[row][column] = null;
      
      return true;
    }
    
    return false;
  }
  
  /**
   * Obtém o elemento em uma célula específica
   * @param row Índice da linha
   * @param column Índice da coluna
   * @returns Elemento na célula ou null se vazia
   */
  getElement(row: number, column: number): UIElement | null {
    if (row < 0 || row >= this.options.rows || column < 0 || column >= this.options.columns) {
      return null;
    }
    
    return this.cells[row][column];
  }
  
  /**
   * Limpa todas as células da grade
   */
  clear(): void {
    for (let row = 0; row < this.options.rows; row++) {
      for (let col = 0; col < this.options.columns; col++) {
        this.removeElement(row, col);
      }
    }
  }
  
  /**
   * Redimensiona a grade
   * @param width Nova largura
   * @param height Nova altura
   */
  resize(width: number, height: number): void {
    // Atualiza as dimensões
    this.options.width = width;
    this.options.height = height;
    
    // Recalcula dimensões das células
    this.cellWidth = width / this.options.columns;
    this.cellHeight = height / this.options.rows;
    
    // Redesenha elementos visuais
    this.drawBackground();
    
    if (this.options.showGrid) {
      this.drawGridLines();
    }
    
    // Reposiciona elementos existentes
    for (let row = 0; row < this.options.rows; row++) {
      for (let col = 0; col < this.options.columns; col++) {
        const element = this.cells[row][col];
        if (element) {
          // Guarda o elemento atual
          const temp = element;
          
          // Remove e readiciona para atualizar posição
          this.removeElement(row, col);
          this.addElement(temp, row, col);
        }
      }
    }
  }
  
  /**
   * Altera o número de linhas e colunas
   * @param rows Novo número de linhas
   * @param columns Novo número de colunas
   * @param preserveElements Manter elementos existentes
   */
  reconfigure(rows: number, columns: number, preserveElements: boolean = true): void {
    if (rows <= 0 || columns <= 0) {
      console.error("Número de linhas e colunas deve ser maior que zero");
      return;
    }
    
    // Guarda elementos existentes se necessário
    const existingElements: Array<{element: UIElement, row: number, col: number}> = [];
    
    if (preserveElements) {
      for (let row = 0; row < this.options.rows; row++) {
        for (let col = 0; col < this.options.columns; col++) {
          const element = this.cells[row][col];
          if (element) {
            existingElements.push({ element, row, col });
          }
        }
      }
    }
    
    // Limpa a grade
    this.clear();
    
    // Atualiza configuração
    this.options.rows = rows;
    this.options.columns = columns;
    
    // Recalcula dimensões das células
    this.cellWidth = this.options.width / columns;
    this.cellHeight = this.options.height / rows;
    
    // Redesenha elementos visuais
    this.drawBackground();
    
    if (this.options.showGrid) {
      this.drawGridLines();
    }
    
    // Recria matriz de células
    this.cells = Array(rows).fill(null)
      .map(() => Array(columns).fill(null));
    
    // Readiciona elementos preservados
    if (preserveElements) {
      for (const item of existingElements) {
        // Verifica se a célula ainda existe na nova configuração
        if (item.row < rows && item.col < columns) {
          this.addElement(item.element, item.row, item.col);
        }
      }
    }
  }
  
  /**
   * Mostra ou esconde as linhas da grade
   * @param show Estado de visibilidade
   */
  setGridVisible(show: boolean): void {
    this.options.showGrid = show;
    this.gridLines.visible = show;
    
    if (show) {
      this.drawGridLines();
    }
  }
  
  /**
   * Atualiza o elemento e seus filhos
   * @param delta Delta time
   */
  update(delta: number): void {
    // Atualiza todos os elementos na grade
    for (let row = 0; row < this.options.rows; row++) {
      for (let col = 0; col < this.options.columns; col++) {
        const element = this.cells[row][col];
        if (element) {
          element.update(delta);
        }
      }
    }
  }
  
  /**
   * Destrói o elemento e libera recursos
   */
  destroy(): void {
    // Limpa todos os elementos
    this.clear();
    
    // Limpa gráficos
    this.background.destroy();
    this.gridLines.destroy();
    
    // Chama o método da classe base
    super.destroy();
  }
} 