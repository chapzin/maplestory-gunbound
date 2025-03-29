import * as PIXI from 'pixi.js';
import { Projectile } from './projectile';
import { PhysicsSystem } from '../systems/physics-adapter';
import { EventSystem } from '../systems/event-system';

/**
 * Classe que representa um projétil de fragmentação
 * Quando explode, cria múltiplos projéteis menores em direções diversas
 */
export class FragProjectile extends Projectile {
  private fragmentCount: number = 8;
  private fragmentDamage: number = 15;
  private explosionRadius: number = 40;
  private fragmentSpread: number = 120; // Ângulo de espalhamento em graus
  private explosionGraphics: PIXI.Graphics | null = null;
  private explosionAnimating: boolean = false;
  private explosionTime: number = 0;
  private explosionDuration: number = 0.5; // Duração da animação em segundos
  private containerRef: PIXI.Container;
  private currentX: number = 0;
  private currentY: number = 0;
  private currentVx: number = 0;
  private currentVy: number = 0;
  
  // Fragmentos criados após a explosão
  private fragments: Array<{
    x: number,
    y: number,
    vx: number,
    vy: number,
    active: boolean,
    graphics: PIXI.Graphics
  }> = [];
  
  /**
   * Inicializa um projétil de fragmentação
   * @param container Container pai para adicionar o gráfico
   * @param startX Posição inicial X
   * @param startY Posição inicial Y
   * @param angle Ângulo de disparo em graus
   * @param power Potência do disparo
   * @param physicsSystem Sistema de física
   * @param fragmentCount Número de fragmentos criados ao explodir
   * @param fragmentDamage Dano causado por cada fragmento
   * @param explosionRadius Raio da explosão
   * @param fragmentSpread Ângulo de espalhamento dos fragmentos em graus
   */
  constructor(
    container: PIXI.Container,
    startX: number,
    startY: number,
    angle: number,
    power: number,
    physicsSystem: PhysicsSystem,
    fragmentCount: number = 8,
    fragmentDamage: number = 15,
    explosionRadius: number = 40,
    fragmentSpread: number = 120
  ) {
    super(container, startX, startY, angle, power, physicsSystem);
    
    this.containerRef = container;
    this.currentX = startX;
    this.currentY = startY;
    
    this.fragmentCount = fragmentCount;
    this.fragmentDamage = fragmentDamage;
    this.explosionRadius = explosionRadius;
    this.fragmentSpread = fragmentSpread;
    
    // Personaliza a aparência do projétil
    this.setColor(0xFF8800); // Laranja para bomba de fragmentação
    
    // Inicializa o gráfico da explosão (inicialmente invisível)
    this.initExplosionGraphics();
  }
  
  /**
   * Define a cor do projétil
   * @param color Cor em formato hexadecimal
   */
  public setColor(color: number): void {
    // Este método deve ser implementado na classe base Projectile
    // Se não estiver disponível, estaremos apenas preparando para quando estiver
  }
  
  /**
   * Inicializa o gráfico da explosão
   */
  private initExplosionGraphics(): void {
    this.explosionGraphics = new PIXI.Graphics();
    this.explosionGraphics.beginFill(0xFF8800, 0.7);
    this.explosionGraphics.drawCircle(0, 0, this.explosionRadius);
    this.explosionGraphics.endFill();
    this.explosionGraphics.visible = false;
    this.containerRef.addChild(this.explosionGraphics);
  }
  
  /**
   * Atualiza o projétil de fragmentação
   * @param deltaTime Delta time em segundos
   */
  public update(deltaTime: number): void {
    if (this.explosionAnimating) {
      this.updateExplosionAnimation(deltaTime);
      return;
    }
    
    if (this.fragments.length > 0) {
      this.updateFragments(deltaTime);
      return;
    }
    
    // Atualiza a posição para rastreamento
    EventSystem.getInstance().on('projectile:moved', (data: any) => {
      if (data && this.isActive()) {
        this.currentX = data.x;
        this.currentY = data.y;
        this.currentVx = data.vx;
        this.currentVy = data.vy;
      }
    });
    
    // Se não está em animação de explosão nem tem fragmentos,
    // usa a lógica de atualização da classe pai
    super.update(deltaTime);
  }
  
  /**
   * Atualiza a animação da explosão
   * @param deltaTime Delta time em segundos
   */
  private updateExplosionAnimation(deltaTime: number): void {
    if (!this.explosionGraphics) return;
    
    this.explosionTime += deltaTime;
    
    // Calcula o progresso da animação (0 a 1)
    const progress = Math.min(this.explosionTime / this.explosionDuration, 1);
    
    // Ajusta a opacidade e o tamanho da explosão
    this.explosionGraphics.alpha = 1 - progress;
    const scale = 1 + progress * 0.5;
    this.explosionGraphics.scale.set(scale, scale);
    
    // Se a animação terminou, cria os fragmentos e remove a animação
    if (progress >= 1) {
      this.explosionAnimating = false;
      this.explosionGraphics.visible = false;
      
      // Cria os fragmentos
      this.createFragments();
    }
  }
  
  /**
   * Cria os fragmentos após a explosão
   */
  private createFragments(): void {
    // Usa a posição rastreada
    const { x, y, vx, vy } = this.getCurrentState();
    
    // Calcula o ângulo de base (direção do projétil no momento da explosão)
    const baseAngle = Math.atan2(vy, vx);
    
    // Define a velocidade dos fragmentos
    const fragmentSpeed = 2;
    
    // Calcula o ângulo de início para distribuir os fragmentos no arco de espalhamento
    const startAngle = baseAngle - (this.fragmentSpread * Math.PI / 360); // Metade do espalhamento
    
    // Cria fragmentos
    for (let i = 0; i < this.fragmentCount; i++) {
      // Calcula o ângulo para este fragmento
      const angle = startAngle + (i * this.fragmentSpread * Math.PI / 180) / this.fragmentCount;
      
      // Calcula velocidade com base no ângulo
      const fragmentVx = Math.cos(angle) * fragmentSpeed;
      const fragmentVy = Math.sin(angle) * fragmentSpeed;
      
      // Cria o gráfico para o fragmento
      const fragmentGraphic = new PIXI.Graphics();
      fragmentGraphic.beginFill(0xFF5500);
      fragmentGraphic.drawCircle(0, 0, 3); // Fragmentos são menores que o projétil original
      fragmentGraphic.endFill();
      fragmentGraphic.position.set(x, y);
      this.containerRef.addChild(fragmentGraphic);
      
      // Adiciona o fragmento à lista
      this.fragments.push({
        x,
        y,
        vx: fragmentVx,
        vy: fragmentVy,
        active: true,
        graphics: fragmentGraphic
      });
    }
    
    // Emite evento de criação de fragmentos
    this.emitFragmentCreatedEvent();
  }
  
  /**
   * Atualiza os fragmentos
   * @param deltaTime Delta time em segundos
   */
  private updateFragments(deltaTime: number): void {
    // Aplica gravidade e atualiza posição dos fragmentos
    const gravity = 0.1; // Valor menor que o normal para fragmentos
    
    for (let i = this.fragments.length - 1; i >= 0; i--) {
      const fragment = this.fragments[i];
      
      if (!fragment.active) continue;
      
      // Aplica gravidade
      fragment.vy += gravity * deltaTime;
      
      // Atualiza posição
      fragment.x += fragment.vx * deltaTime;
      fragment.y += fragment.vy * deltaTime;
      
      // Atualiza a posição do gráfico
      fragment.graphics.position.set(fragment.x, fragment.y);
      
      // Verifica saída da tela ou colisão com terreno
      if (this.isOutOfBounds(fragment.x, fragment.y)) {
        this.deactivateFragment(i);
      }
    }
    
    // Verifica se todos os fragmentos foram desativados
    if (!this.fragments.some(f => f.active)) {
      this.cleanupFragments();
    }
  }
  
  /**
   * Verifica se uma posição está fora dos limites da tela
   * @param x Coordenada X
   * @param y Coordenada Y
   * @returns True se estiver fora dos limites
   */
  private isOutOfBounds(x: number, y: number): boolean {
    // Verifica se está fora dos limites da tela
    return x < 0 || 
           x > (this.containerRef.width || 800) || 
           y > (this.containerRef.height || 600);
  }
  
  /**
   * Desativa um fragmento
   * @param index Índice do fragmento na lista
   */
  private deactivateFragment(index: number): void {
    const fragment = this.fragments[index];
    fragment.active = false;
    
    // Adiciona efeito de desaparecimento
    const fadeOut = (fragment.graphics.alpha - 0.2 <= 0);
    
    if (fadeOut) {
      // Remove o gráfico
      this.containerRef.removeChild(fragment.graphics);
      fragment.graphics.destroy();
    } else {
      // Reduz a opacidade
      fragment.graphics.alpha -= 0.2;
    }
  }
  
  /**
   * Limpa todos os fragmentos
   */
  private cleanupFragments(): void {
    // Remove todos os gráficos de fragmentos
    for (const fragment of this.fragments) {
      if (fragment.graphics.parent) {
        this.containerRef.removeChild(fragment.graphics);
      }
      fragment.graphics.destroy();
    }
    
    // Limpa a lista de fragmentos
    this.fragments = [];
  }
  
  /**
   * Emite evento quando fragmentos são criados
   */
  private emitFragmentCreatedEvent(): void {
    const eventSystem = EventSystem.getInstance();
    
    eventSystem.emit('fragment:created', {
      count: this.fragmentCount,
      position: this.getCurrentState(),
      damage: this.fragmentDamage
    });
  }
  
  /**
   * Sobrecarrega o método onImpact da classe base para monitorar impactos
   * e acionar a lógica de fragmentação personalizada
   */
  public static onImpact(callback: (data: any) => void): void {
    EventSystem.getInstance().on('projectile:impact', callback);
    
    // Também monitoramos o evento de fragmento criado
    EventSystem.getInstance().on('fragment:created', callback);
  }
  
  /**
   * Obtém o estado atual do projétil
   * @returns Objeto com posição e velocidade atual
   */
  private getCurrentState(): { x: number; y: number; vx: number; vy: number } {
    return {
      x: this.currentX,
      y: this.currentY,
      vx: this.currentVx,
      vy: this.currentVy
    };
  }
  
  /**
   * Limpa recursos utilizados pelo projétil
   */
  public destroy(): void {
    // Limpa os fragmentos
    this.cleanupFragments();
    
    // Remove o gráfico da explosão
    if (this.explosionGraphics && this.explosionGraphics.parent) {
      this.containerRef.removeChild(this.explosionGraphics);
      this.explosionGraphics.destroy();
      this.explosionGraphics = null;
    }
    
    // Chama o método destroy da classe pai
    super.destroy();
  }
} 