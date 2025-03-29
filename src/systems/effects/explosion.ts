import * as PIXI from 'pixi.js';

/**
 * Sistema para criar efeitos de explosão
 */
export class ExplosionEffect {
  private container: PIXI.Container;
  private particles: Array<{
    sprite: PIXI.Graphics,
    x: number,
    y: number,
    vx: number,
    vy: number,
    life: number,
    maxLife: number,
    size: number,
  }> = [];
  private active: boolean = false;

  /**
   * Inicializa o efeito de explosão
   * @param container Container pai para adicionar o efeito
   */
  constructor(container: PIXI.Container) {
    this.container = container;
  }

  /**
   * Cria uma explosão em um determinado ponto
   * @param x Coordenada X
   * @param y Coordenada Y
   * @param power Potência da explosão
   */
  public create(x: number, y: number, power: number): void {
    this.active = true;
    
    // Limpar partículas anteriores
    this.clearParticles();
    
    // Número de partículas baseado na potência
    const particleCount = Math.min(Math.floor(power / 2), 50);
    
    // Raio da explosão baseado na potência
    const radius = Math.min(power, 100);
    
    // Cria as partículas
    for (let i = 0; i < particleCount; i++) {
      // Ângulo aleatório
      const angle = Math.random() * Math.PI * 2;
      
      // Velocidade baseada na distância do centro e na potência
      const speed = (0.5 + Math.random() * 0.5) * power * 0.05;
      
      // Componentes de velocidade
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      
      // Tamanho da partícula
      const size = 2 + Math.random() * 4;
      
      // Tempo de vida
      const maxLife = 30 + Math.random() * 30;
      
      // Cria gráfico da partícula
      const particle = new PIXI.Graphics();
      particle.beginFill(this.getExplosionColor(Math.random()));
      particle.drawCircle(0, 0, size);
      particle.endFill();
      particle.position.set(x, y);
      this.container.addChild(particle);
      
      // Adiciona à lista de partículas
      this.particles.push({
        sprite: particle,
        x: x,
        y: y,
        vx: vx,
        vy: vy,
        life: maxLife,
        maxLife: maxLife,
        size: size,
      });
    }
    
    // Cria o flash inicial da explosão
    this.createExplosionFlash(x, y, radius);
  }

  /**
   * Cria o flash inicial da explosão
   * @param x Coordenada X
   * @param y Coordenada Y
   * @param radius Raio da explosão
   */
  private createExplosionFlash(x: number, y: number, radius: number): void {
    const flash = new PIXI.Graphics();
    flash.beginFill(0xFFFFFF, 0.8);
    flash.drawCircle(x, y, radius);
    flash.endFill();
    this.container.addChild(flash);
    
    // Animação do flash
    const animate = () => {
      radius *= 0.9;
      flash.clear();
      flash.beginFill(0xFFFFFF, 0.8 * (radius / 100));
      flash.drawCircle(x, y, radius);
      flash.endFill();
      
      if (radius > 1) {
        requestAnimationFrame(animate);
      } else {
        flash.destroy();
      }
    };
    
    requestAnimationFrame(animate);
  }

  /**
   * Retorna uma cor para a partícula da explosão
   * @param random Valor aleatório entre 0 e 1
   */
  private getExplosionColor(random: number): number {
    if (random < 0.3) {
      return 0xFF0000; // Vermelho
    } else if (random < 0.6) {
      return 0xFF7700; // Laranja
    } else if (random < 0.9) {
      return 0xFFFF00; // Amarelo
    } else {
      return 0xFFFFFF; // Branco
    }
  }

  /**
   * Atualiza o estado das partículas
   * @param deltaTime Tempo desde o último frame
   */
  public update(deltaTime: number): void {
    if (!this.active || this.particles.length === 0) return;
    
    let allDead = true;
    
    // Atualiza cada partícula
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      
      // Reduz tempo de vida
      p.life -= deltaTime;
      
      if (p.life <= 0) {
        // Remove partícula morta
        p.sprite.destroy();
        this.particles.splice(i, 1);
      } else {
        // Atualiza posição
        p.x += p.vx * deltaTime;
        p.y += p.vy * deltaTime;
        
        // Adiciona gravidade
        p.vy += 0.1 * deltaTime;
        
        // Atualiza posição do sprite
        p.sprite.position.set(p.x, p.y);
        
        // Atualiza transparência baseada no tempo de vida restante
        const alpha = p.life / p.maxLife;
        p.sprite.alpha = alpha;
        
        allDead = false;
      }
    }
    
    // Se todas as partículas morreram, desativa o efeito
    if (allDead) {
      this.active = false;
    }
  }

  /**
   * Limpa todas as partículas
   */
  private clearParticles(): void {
    for (const p of this.particles) {
      p.sprite.destroy();
    }
    this.particles = [];
  }

  /**
   * Verifica se o efeito está ativo
   */
  public isActive(): boolean {
    return this.active;
  }

  /**
   * Limpa recursos ao destruir o efeito
   */
  public destroy(): void {
    this.clearParticles();
  }
} 