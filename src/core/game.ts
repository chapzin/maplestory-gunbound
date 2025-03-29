import * as PIXI from 'pixi.js';
import { CONFIG } from './config';
import { GameScene } from '../scenes';

/**
 * Classe principal do jogo
 */
export class Game {
  private app: PIXI.Application;
  private isRunning: boolean = false;
  private lastTime: number = 0;
  private currentScene: GameScene | null = null;

  constructor() {
    // Inicializa a aplicação Pixi.js
    this.app = new PIXI.Application({
      width: CONFIG.SCREEN.WIDTH,
      height: CONFIG.SCREEN.HEIGHT,
      backgroundColor: CONFIG.SCREEN.BACKGROUND_COLOR,
      antialias: true,
    });
  }

  /**
   * Inicializa o jogo e anexa o canvas ao container
   */
  public init(): void {
    // Adiciona o canvas ao container do jogo
    const gameContainer = document.getElementById('game-container');
    if (gameContainer) {
      gameContainer.appendChild(this.app.view as HTMLCanvasElement);
      
      // Configura o redimensionamento responsivo
      this.setupResizing();
      
      // Carrega a cena principal
      this.loadMainScene();
      
      // Inicia o loop do jogo
      this.start();
      
      // Log de inicialização
      if (CONFIG.DEBUG.ENABLED) {
        console.log('Jogo inicializado com sucesso.');
      }
    } else {
      console.error('Container do jogo não encontrado.');
    }
  }

  /**
   * Carrega a cena principal de jogo
   */
  private loadMainScene(): void {
    this.currentScene = new GameScene(this.app);
  }

  /**
   * Inicia o loop do jogo
   */
  public start(): void {
    if (!this.isRunning) {
      this.isRunning = true;
      this.lastTime = performance.now();
      this.app.ticker.add(this.gameLoop, this);
    }
  }

  /**
   * Para o loop do jogo
   */
  public stop(): void {
    if (this.isRunning) {
      this.isRunning = false;
      this.app.ticker.remove(this.gameLoop, this);
    }
  }

  /**
   * Loop principal do jogo
   * @param deltaTime Tempo desde o último frame
   */
  private gameLoop(deltaTime: number): void {
    const currentTime = performance.now();
    const elapsedTime = currentTime - this.lastTime;
    this.lastTime = currentTime;

    // Atualiza a lógica do jogo
    this.update(deltaTime, elapsedTime);

    // Renderiza o jogo (Pixi faz isso automaticamente)
  }

  /**
   * Atualiza a lógica do jogo
   * @param deltaTime Tempo desde o último frame (normalizado pelo Pixi)
   * @param elapsedTime Tempo real em ms desde o último frame
   */
  private update(deltaTime: number, elapsedTime: number): void {
    // Atualiza a cena atual
    if (this.currentScene) {
      this.currentScene.update(deltaTime);
    }
    
    // Debug FPS
    if (CONFIG.DEBUG.ENABLED && CONFIG.DEBUG.SHOW_FPS) {
      // Calcular e mostrar FPS (a cada segundo)
      if (elapsedTime > 0) {
        const fps = Math.round(1000 / elapsedTime);
        // Aqui poderíamos atualizar um contador de FPS na interface
      }
    }
  }

  /**
   * Configura o redimensionamento responsivo
   */
  private setupResizing(): void {
    const resize = () => {
      const gameContainer = document.getElementById('game-container');
      if (!gameContainer) return;

      const w = gameContainer.clientWidth;
      const h = gameContainer.clientHeight;

      // Mantém a proporção do jogo
      const ratio = Math.min(
        w / CONFIG.SCREEN.WIDTH,
        h / CONFIG.SCREEN.HEIGHT
      );

      const newWidth = Math.floor(CONFIG.SCREEN.WIDTH * ratio);
      const newHeight = Math.floor(CONFIG.SCREEN.HEIGHT * ratio);

      this.app.renderer.resize(newWidth, newHeight);
      this.app.stage.scale.set(ratio);
    };

    // Redimensiona inicialmente e adiciona listener para redimensionamento
    resize();
    window.addEventListener('resize', resize);
  }

  /**
   * Retorna a instância da aplicação Pixi
   */
  public getApp(): PIXI.Application {
    return this.app;
  }
} 