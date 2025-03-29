import * as PIXI from 'pixi.js';
import { BaseVehicle, VehicleType, WeaponType } from '../vehicle';
import { CONFIG } from '../../core/config';

/**
 * Veículo tipo Dragão com ataque de fogo
 */
export class DragonVehicle extends BaseVehicle {
  // Propriedades específicas do dragão
  private fireChargeLevel: number = 0;
  private maxFireChargeLevel: number = 3;
  private animationFrames: PIXI.Texture[] = [];
  private currentAnimationFrame: number = 0;
  private animationTimer: number = 0;
  private isBreathingFire: boolean = false;
  private fireBreathGraphics: PIXI.Graphics;
  private container: PIXI.Container;
  
  /**
   * Cria um novo veículo tipo Dragão
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
      VehicleType.DRAGON,
      x,
      y,
      48, // Largura
      48, // Altura
      120, // Vida
      playerId
    );
    
    // Salva a referência ao container
    this.container = container;
    
    // Inicializa o sprite do dragão (placeholder gráfico)
    this.initializeSprite();
    
    // Cria o gráfico para o sopro de fogo
    this.fireBreathGraphics = new PIXI.Graphics();
    this.container.addChild(this.fireBreathGraphics);
  }
  
  /**
   * Inicializa o sprite do dragão
   */
  private initializeSprite(): void {
    // Como não temos assets reais, vamos criar um placeholder
    const graphics = new PIXI.Graphics();
    
    // Corpo do dragão (um triângulo para representar)
    graphics.beginFill(0xFF0000); // Vermelho
    graphics.moveTo(-this.width/2, this.height/2); // Canto inferior esquerdo
    graphics.lineTo(this.width/2, this.height/2); // Canto inferior direito
    graphics.lineTo(0, -this.height/2); // Topo
    graphics.lineTo(-this.width/2, this.height/2); // Volta ao começo
    graphics.endFill();
    
    // Asas
    graphics.beginFill(0xFF8800); // Laranja
    // Asa esquerda
    graphics.drawEllipse(-this.width/2 - 10, 0, 10, 15);
    // Asa direita
    graphics.drawEllipse(this.width/2 + 10, 0, 10, 15);
    graphics.endFill();
    
    // Gera uma textura a partir do gráfico
    // Como uma solução alternativa, vamos apenas criar um sprite colorido básico
    // ao invés de gerar uma textura a partir do graphics
    this.sprite.width = this.width;
    this.sprite.height = this.height;
    this.sprite.tint = 0xFF0000; // Vermelho
    
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
    
    // Animação do dragão respirando fogo
    if (this.isBreathingFire) {
      this.animationTimer += deltaTime;
      
      if (this.animationTimer > 0.1) { // Troca de quadro a cada 100ms
        this.animationTimer = 0;
        this.currentAnimationFrame = (this.currentAnimationFrame + 1) % 4; // 4 quadros de animação
        this.updateFireBreathAnimation();
      }
      
      // Verifica se a animação de fogo deve terminar
      if (this.animationTimer > 1.5) { // 1.5 segundos de duração
        this.isBreathingFire = false;
        this.fireBreathGraphics.clear();
      }
    }
  }
  
  /**
   * Dispara a arma primária (bola de fogo)
   * @param angle Ângulo de disparo
   * @param power Potência do disparo
   */
  override firePrimaryWeapon(angle: number, power: number): void {
    // Aumenta o poder baseado no nível de carga de fogo
    const boostedPower = power * (1 + this.fireChargeLevel * 0.2);
    
    // Dispara
    console.log(`${this.name} disparou uma bola de fogo com ângulo ${angle} e potência ${boostedPower}`);
    
    // Consome um nível de carga de fogo se disponível
    if (this.fireChargeLevel > 0) {
      this.fireChargeLevel--;
    }
    
    // Animação de respirar fogo
    this.isBreathingFire = true;
    this.animationTimer = 0;
    this.updateFireBreathAnimation();
  }
  
  /**
   * Dispara a arma secundária (bomba de fogo)
   * @param angle Ângulo de disparo
   * @param power Potência do disparo
   */
  override fireSecondaryWeapon(angle: number, power: number): void {
    // A bomba de fogo causa dano em área
    console.log(`${this.name} disparou uma bomba de fogo com ângulo ${angle} e potência ${power}`);
    
    // Consome dois níveis de carga de fogo se disponível
    if (this.fireChargeLevel >= 2) {
      this.fireChargeLevel -= 2;
    } else {
      this.fireChargeLevel = 0;
    }
    
    // Animação de respirar fogo
    this.isBreathingFire = true;
    this.animationTimer = 0;
    this.updateFireBreathAnimation();
  }
  
  /**
   * Usa a habilidade especial do dragão (Fúria do Dragão)
   * @returns Verdadeiro se a habilidade foi usada com sucesso
   */
  override useSpecialAbility(): boolean {
    // Verifica se tem carga suficiente
    if (this.specialAbilityCharge < this.maxSpecialAbilityCharge) {
      return false;
    }
    
    // Fúria do Dragão - Aumenta o nível de carga de fogo ao máximo
    this.fireChargeLevel = this.maxFireChargeLevel;
    
    // Consome a carga da habilidade especial
    this.specialAbilityCharge = 0;
    
    console.log(`${this.name} ativou Fúria do Dragão! Nível de Fogo: ${this.fireChargeLevel}`);
    
    return true;
  }
  
  /**
   * Atualiza a animação de sopro de fogo
   */
  private updateFireBreathAnimation(): void {
    // Limpa a animação anterior
    this.fireBreathGraphics.clear();
    
    // Calcula a direção do sopro de fogo (para a direita)
    const angle = 0; // 0 graus - para a direita
    const length = 100; // Comprimento do sopro de fogo
    
    // Intensidade do fogo baseada no quadro atual de animação
    const intensity = [0.5, 0.8, 1.0, 0.8][this.currentAnimationFrame];
    
    // Desenha o sopro de fogo
    this.fireBreathGraphics.beginFill(0xFF0000, 0.7 * intensity); // Vermelho
    
    // Posição de início (boca do dragão)
    const startX = this.x + this.width / 2;
    const startY = this.y;
    
    // Forma de cone para o fogo
    const endWidth = 30 * intensity;
    
    // Desenha o triângulo do fogo
    this.fireBreathGraphics.moveTo(startX, startY);
    this.fireBreathGraphics.lineTo(
      startX + length * Math.cos(angle),
      startY + length * Math.sin(angle) - endWidth / 2
    );
    this.fireBreathGraphics.lineTo(
      startX + length * Math.cos(angle),
      startY + length * Math.sin(angle) + endWidth / 2
    );
    this.fireBreathGraphics.lineTo(startX, startY);
    
    this.fireBreathGraphics.endFill();
    
    // Adiciona partículas de fogo
    for (let i = 0; i < 5; i++) {
      const distance = Math.random() * length;
      const offset = (Math.random() - 0.5) * endWidth * (distance / length);
      
      this.fireBreathGraphics.beginFill(0xFFFF00, 0.5 * intensity); // Amarelo
      this.fireBreathGraphics.drawCircle(
        startX + distance * Math.cos(angle),
        startY + distance * Math.sin(angle) + offset,
        3 + Math.random() * 5
      );
      this.fireBreathGraphics.endFill();
    }
  }
  
  /**
   * Retorna o nível atual de carga de fogo
   */
  getFireChargeLevel(): number {
    return this.fireChargeLevel;
  }
  
  /**
   * Incrementa o nível de carga de fogo
   */
  chargeFireLevel(): void {
    if (this.fireChargeLevel < this.maxFireChargeLevel) {
      this.fireChargeLevel++;
    }
  }
  
  /**
   * Sobrescreve o método destroy para limpar recursos específicos
   */
  override destroy(): void {
    super.destroy();
    this.fireBreathGraphics.destroy();
    this.container.removeChild(this.fireBreathGraphics);
  }
} 