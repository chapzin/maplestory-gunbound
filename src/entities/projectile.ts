import * as PIXI from 'pixi.js';
import { PhysicsSystem } from '../systems/physics-adapter';
import { EventSystem } from '../systems/event-system';

/**
 * Classe que representa um projétil no jogo
 */
export class Projectile {
  private container: PIXI.Container;
  private graphics: PIXI.Graphics;
  private physicsSystem: PhysicsSystem;
  private eventSystem: EventSystem;
  
  private x: number;
  private y: number;
  private vx: number;
  private vy: number;
  private radius: number = 5;
  private active: boolean = false;
  private trailPoints: Array<{x: number, y: number}> = [];
  private trailGraphics: PIXI.Graphics;
  private containerWidth: number;
  private containerHeight: number;

  // Eventos específicos
  private static readonly EVENTS = {
    PROJECTILE_FIRED: 'projectile:fired',
    PROJECTILE_MOVED: 'projectile:moved',
    PROJECTILE_IMPACT: 'projectile:impact',
  };

  /**
   * Inicializa um projétil
   * @param container Container pai para adicionar o gráfico
   * @param startX Posição inicial X
   * @param startY Posição inicial Y
   * @param angle Ângulo de disparo em graus
   * @param power Potência do disparo
   * @param physicsSystem Sistema de física
   */
  constructor(
    container: PIXI.Container, 
    startX: number, 
    startY: number, 
    angle: number, 
    power: number,
    physicsSystem: PhysicsSystem
  ) {
    this.container = container;
    this.x = startX;
    this.y = startY;
    this.physicsSystem = physicsSystem;
    this.eventSystem = EventSystem.getInstance();
    
    // Armazena as dimensões do container para uso posterior
    this.containerWidth = container.width || 800;  // Valor padrão caso não definido
    this.containerHeight = container.height || 600; // Valor padrão caso não definido
    
    // Calcula velocidade inicial baseada no ângulo e potência
    const angleRad = angle * (Math.PI / 180);
    this.vx = Math.cos(angleRad) * power * 0.1;
    this.vy = -Math.sin(angleRad) * power * 0.1;
    
    // Cria o gráfico do projétil
    this.graphics = new PIXI.Graphics();
    this.container.addChild(this.graphics);
    
    // Cria o gráfico da trilha
    this.trailGraphics = new PIXI.Graphics();
    this.container.addChild(this.trailGraphics);
    
    // Desenha o projétil
    this.draw();
  }

  /**
   * Dispara o projétil
   */
  public fire(): void {
    this.active = true;
    this.trailPoints = [{ x: this.x, y: this.y }];
    this.eventSystem.emit(Projectile.EVENTS.PROJECTILE_FIRED, {
      x: this.x,
      y: this.y,
      angle: Math.atan2(-this.vy, this.vx) * (180 / Math.PI),
      power: Math.sqrt(this.vx * this.vx + this.vy * this.vy) * 10,
    });
  }

  /**
   * Atualiza o estado do projétil
   * @param deltaTime Tempo desde o último frame
   */
  public update(deltaTime: number): void {
    if (!this.active) return;

    // Aplica gravidade e vento
    const gravity = this.physicsSystem.getGravity();
    const wind = this.physicsSystem.getWind() * 0.005;
    
    // Atualiza velocidade
    this.vy += gravity * deltaTime;
    this.vx += wind * deltaTime;
    
    // Atualiza posição
    this.x += this.vx * deltaTime;
    this.y += this.vy * deltaTime;
    
    // Adiciona ponto à trilha
    this.trailPoints.push({ x: this.x, y: this.y });
    
    // Limita o tamanho da trilha
    if (this.trailPoints.length > 30) {
      this.trailPoints.shift();
    }
    
    // Emite evento de movimento
    this.eventSystem.emit(Projectile.EVENTS.PROJECTILE_MOVED, {
      x: this.x,
      y: this.y,
      vx: this.vx,
      vy: this.vy,
    });
    
    // Verifica colisão com o terreno ou saída da tela
    this.checkCollision();
    
    // Desenha o projétil e a trilha
    this.draw();
  }

  /**
   * Verifica colisão com o terreno ou saída da tela
   */
  private checkCollision(): void {
    // Verifica saída da tela usando as dimensões armazenadas
    if (
      this.x < 0 || 
      this.x > this.containerWidth ||
      this.y > this.containerHeight
    ) {
      this.explode();
      return;
    }
    
    // Aqui seria a verificação de colisão com o terreno
    // Na implementação completa, isso envolveria verificar colisão com o TerrainSystem
  }

  /**
   * Causa explosão no ponto de impacto
   */
  private explode(): void {
    this.active = false;
    
    // Emite evento de impacto
    this.eventSystem.emit(Projectile.EVENTS.PROJECTILE_IMPACT, {
      x: this.x,
      y: this.y,
      power: Math.sqrt(this.vx * this.vx + this.vy * this.vy) * 10,
    });
    
    // Remove o projétil e a trilha após a explosão
    setTimeout(() => {
      this.clear();
    }, 1000);
  }

  /**
   * Desenha o projétil e a trilha
   */
  private draw(): void {
    // Limpa o gráfico anterior
    this.graphics.clear();
    
    // Desenha o projétil
    if (this.active) {
      this.graphics.beginFill(0xFFFF00);
      this.graphics.drawCircle(this.x, this.y, this.radius);
      this.graphics.endFill();
    }
    
    // Desenha a trilha
    this.trailGraphics.clear();
    if (this.trailPoints.length > 1) {
      this.trailGraphics.lineStyle(1, 0xFFFF00, 0.5);
      this.trailGraphics.moveTo(this.trailPoints[0].x, this.trailPoints[0].y);
      
      for (let i = 1; i < this.trailPoints.length; i++) {
        this.trailGraphics.lineTo(this.trailPoints[i].x, this.trailPoints[i].y);
      }
    }
  }

  /**
   * Limpa todos os gráficos
   */
  private clear(): void {
    this.graphics.clear();
    this.trailGraphics.clear();
    this.trailPoints = [];
  }

  /**
   * Verifica se o projétil está ativo
   */
  public isActive(): boolean {
    return this.active;
  }

  /**
   * Registra callback para evento de disparo
   * @param callback Função a ser chamada
   */
  public static onFired(callback: (data: any) => void): void {
    EventSystem.getInstance().on(Projectile.EVENTS.PROJECTILE_FIRED, callback);
  }

  /**
   * Registra callback para evento de impacto
   * @param callback Função a ser chamada
   */
  public static onImpact(callback: (data: any) => void): void {
    EventSystem.getInstance().on(Projectile.EVENTS.PROJECTILE_IMPACT, callback);
  }

  /**
   * Atualiza as dimensões do container
   * Esta função deve ser chamada quando o tamanho do container mudar
   */
  public updateContainerDimensions(width: number, height: number): void {
    this.containerWidth = width;
    this.containerHeight = height;
  }

  /**
   * Limpa recursos ao destruir o projétil
   */
  public destroy(): void {
    this.graphics.destroy();
    this.trailGraphics.destroy();
  }
} 