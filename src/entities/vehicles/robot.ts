import * as PIXI from 'pixi.js';
import { BaseVehicle, VehicleType, WeaponType } from '../vehicle';
import { CONFIG } from '../../core/config';

/**
 * Veículo tipo Robô com ataque de laser
 */
export class RobotVehicle extends BaseVehicle {
  // Propriedades específicas do robô
  private energyLevel: number = 100; // Energia do robô
  private maxEnergyLevel: number = 100;
  private energyRegenRate: number = 5; // Taxa de regeneração por turno
  private shieldActive: boolean = false;
  private shieldGraphics: PIXI.Graphics;
  private laserGraphics: PIXI.Graphics;
  private isShootingLaser: boolean = false;
  private laserAnimationTimer: number = 0;
  private laserAngle?: number;
  private laserPower?: number;
  private container: PIXI.Container;
  
  /**
   * Cria um novo veículo tipo Robô
   * @param id Identificador único
   * @param name Nome do veículo
   * @param x Posição inicial X
   * @param y Posição inicial Y
   * @param container Container para adicionar os sprites
   * @param playerId ID do jogador dono do veículo
   */
  constructor(
    id: number,
    name: string,
    x: number,
    y: number,
    container: PIXI.Container,
    playerId: number = 0
  ) {
    // Chama o construtor da classe pai com os parâmetros necessários
    super(
      id,
      name,
      VehicleType.ROBOT,
      x,
      y,
      40, // Largura
      60, // Altura
      100, // Vida
      playerId
    );
    
    // Salva a referência ao container
    this.container = container;
    
    // Inicializa o sprite do robô (placeholder gráfico)
    this.initializeSprite();
    
    // Cria os gráficos para o escudo e laser
    this.shieldGraphics = new PIXI.Graphics();
    this.laserGraphics = new PIXI.Graphics();
    this.container.addChild(this.shieldGraphics);
    this.container.addChild(this.laserGraphics);
  }
  
  /**
   * Inicializa o sprite do robô
   */
  private initializeSprite(): void {
    // Como não temos assets reais, vamos criar um placeholder
    const graphics = new PIXI.Graphics();
    
    // Corpo do robô (um retângulo com detalhes)
    graphics.beginFill(0x0088FF); // Azul
    graphics.drawRect(-this.width/2, -this.height/2, this.width, this.height);
    graphics.endFill();
    
    // Cabeça
    graphics.beginFill(0x666666); // Cinza
    graphics.drawCircle(0, -this.height/2 - 10, 15);
    graphics.endFill();
    
    // Olhos
    graphics.beginFill(0xFF0000); // Vermelho
    graphics.drawCircle(-5, -this.height/2 - 10, 3);
    graphics.drawCircle(5, -this.height/2 - 10, 3);
    graphics.endFill();
    
    // Antenas
    graphics.lineStyle(2, 0x000000);
    graphics.moveTo(-10, -this.height/2 - 20);
    graphics.lineTo(-5, -this.height/2 - 30);
    graphics.moveTo(10, -this.height/2 - 20);
    graphics.lineTo(5, -this.height/2 - 30);
    
    // Detalhes do corpo
    graphics.lineStyle(2, 0x000000);
    graphics.drawRect(-this.width/3, -this.height/3, this.width/1.5, this.height/3);
    
    // Como uma solução alternativa, vamos apenas criar um sprite colorido básico
    // ao invés de gerar uma textura a partir do graphics
    this.sprite.width = this.width;
    this.sprite.height = this.height;
    this.sprite.tint = 0x0088FF; // Azul
    
    // Centraliza o ponto de origem
    this.sprite.anchor.set(0.5);
    
    // Posiciona o sprite
    this.sprite.x = this.x;
    this.sprite.y = this.y;
    
    // Limpa o gráfico temporário
    graphics.destroy();
  }
  
  /**
   * Atualiza o estado do veículo
   * @param deltaTime Tempo desde o último frame
   */
  override update(deltaTime: number): void {
    super.update(deltaTime);
    
    // Regeneração de energia
    if (this.energyLevel < this.maxEnergyLevel) {
      this.energyLevel += (this.energyRegenRate * deltaTime) / 60; // Regeneração proporcional ao tempo passado
      if (this.energyLevel > this.maxEnergyLevel) {
        this.energyLevel = this.maxEnergyLevel;
      }
    }
    
    // Atualiza o escudo
    if (this.shieldActive) {
      this.updateShield();
      
      // Consome energia enquanto o escudo está ativo
      this.energyLevel -= (10 * deltaTime) / 60;
      
      // Desativa o escudo se a energia acabar
      if (this.energyLevel <= 0) {
        this.energyLevel = 0;
        this.shieldActive = false;
        this.shieldGraphics.clear();
      }
    }
    
    // Animação do laser
    if (this.isShootingLaser) {
      this.laserAnimationTimer += deltaTime;
      
      if (this.laserAnimationTimer > 0.05) { // Atualiza a cada 50ms
        this.laserAnimationTimer = 0;
        this.updateLaserAnimation();
      }
      
      // Finaliza a animação do laser
      if (this.laserAnimationTimer > 0.8) { // 800ms de duração
        this.isShootingLaser = false;
        this.laserGraphics.clear();
      }
    }
  }
  
  /**
   * Dispara a arma primária (laser)
   * @param angle Ângulo de disparo
   * @param power Potência do disparo
   */
  override firePrimaryWeapon(angle: number, power: number): void {
    // Verifica se tem energia suficiente
    const energyCost = 20;
    if (this.energyLevel < energyCost) {
      console.log(`${this.name} não tem energia suficiente para disparar laser!`);
      return;
    }
    
    // Consome energia
    this.energyLevel -= energyCost;
    
    // Dispara o laser
    console.log(`${this.name} disparou laser com ângulo ${angle} e potência ${power}`);
    
    // Inicia a animação do laser
    this.isShootingLaser = true;
    this.laserAnimationTimer = 0;
    this.laserAngle = angle;
    this.laserPower = power;
    this.updateLaserAnimation();
  }
  
  /**
   * Dispara a arma secundária (míssil)
   * @param angle Ângulo de disparo
   * @param power Potência do disparo
   */
  override fireSecondaryWeapon(angle: number, power: number): void {
    // Verifica se tem energia suficiente
    const energyCost = 35;
    if (this.energyLevel < energyCost) {
      console.log(`${this.name} não tem energia suficiente para disparar míssil!`);
      return;
    }
    
    // Consome energia
    this.energyLevel -= energyCost;
    
    // Dispara o míssil guiado
    console.log(`${this.name} disparou míssil guiado com ângulo ${angle} e potência ${power}`);
  }
  
  /**
   * Usa a habilidade especial do robô (Escudo de Energia)
   * @returns Verdadeiro se a habilidade foi usada com sucesso
   */
  override useSpecialAbility(): boolean {
    // Verifica se tem carga suficiente
    if (this.specialAbilityCharge < this.maxSpecialAbilityCharge) {
      return false;
    }
    
    // Escudo de Energia - Ativa um escudo que protege o robô
    this.shieldActive = true;
    
    // Consome a carga da habilidade especial
    this.specialAbilityCharge = 0;
    
    console.log(`${this.name} ativou Escudo de Energia!`);
    
    // Desenha o escudo
    this.updateShield();
    
    return true;
  }
  
  /**
   * Atualiza o visual do escudo
   */
  private updateShield(): void {
    // Limpa o gráfico anterior
    this.shieldGraphics.clear();
    
    // Desenha um círculo ao redor do robô
    this.shieldGraphics.beginFill(0x00FFFF, 0.3); // Azul claro transparente
    this.shieldGraphics.lineStyle(2, 0x00FFFF, 0.8);
    this.shieldGraphics.drawCircle(this.x, this.y, this.width * 1.2);
    this.shieldGraphics.endFill();
    
    // Adiciona efeito de brilho
    this.shieldGraphics.beginFill(0xFFFFFF, 0.2); // Branco transparente
    this.shieldGraphics.drawCircle(this.x, this.y, this.width * 1.1);
    this.shieldGraphics.endFill();
  }
  
  /**
   * Atualiza a animação do laser
   */
  private updateLaserAnimation(): void {
    // Limpa o gráfico anterior
    this.laserGraphics.clear();
    
    // Ângulo e comprimento do laser
    const angle = this.laserAngle ?? 0;
    const length = 500; // Comprimento do raio laser
    
    // Posição inicial (centro do robô)
    const startX = this.x;
    const startY = this.y;
    
    // Variação aleatória para efeito visual
    const jitter = Math.random() * 2 - 1;
    
    // Desenha o raio laser
    this.laserGraphics.lineStyle(3, 0xFF0000, 0.8); // Linha vermelha
    this.laserGraphics.moveTo(startX, startY);
    this.laserGraphics.lineTo(
      startX + length * Math.cos(angle),
      startY + length * Math.sin(angle) + jitter
    );
    
    // Adiciona brilho ao redor do laser
    this.laserGraphics.lineStyle(6, 0xFF0000, 0.3);
    this.laserGraphics.moveTo(startX, startY);
    this.laserGraphics.lineTo(
      startX + length * Math.cos(angle),
      startY + length * Math.sin(angle)
    );
    
    // Adiciona ponto de impacto
    this.laserGraphics.beginFill(0xFFFF00, 0.7); // Amarelo
    this.laserGraphics.drawCircle(
      startX + length * Math.cos(angle),
      startY + length * Math.sin(angle),
      5 + Math.random() * 3
    );
    this.laserGraphics.endFill();
  }
  
  /**
   * Sobrescreve o método takeDamage para considerar o escudo
   * @param amount Quantidade de dano
   */
  override takeDamage(amount: number): void {
    // Se o escudo está ativo, reduz o dano em 75%
    if (this.shieldActive) {
      const reducedDamage = Math.floor(amount * 0.25);
      super.takeDamage(reducedDamage);
    } else {
      // Sem escudo, dano normal
      super.takeDamage(amount);
    }
  }
  
  /**
   * Retorna o nível atual de energia
   */
  getEnergyLevel(): number {
    return this.energyLevel;
  }
  
  /**
   * Recebe energia (para powerups ou regeneração externa)
   * @param amount Quantidade de energia a receber
   */
  rechargeEnergy(amount: number): void {
    this.energyLevel += amount;
    if (this.energyLevel > this.maxEnergyLevel) {
      this.energyLevel = this.maxEnergyLevel;
    }
  }
  
  /**
   * Sobrescreve o método destroy para limpar recursos específicos
   */
  override destroy(): void {
    super.destroy();
    this.shieldGraphics.destroy();
    this.laserGraphics.destroy();
    this.container.removeChild(this.shieldGraphics);
    this.container.removeChild(this.laserGraphics);
  }
} 