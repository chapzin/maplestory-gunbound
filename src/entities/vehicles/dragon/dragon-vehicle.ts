import * as PIXI from 'pixi.js';
import { BaseVehicle } from '../base-vehicle';
import { VehicleType, WeaponType } from '../types';

/**
 * Implementação do veículo do tipo Dragão
 */
export class DragonVehicle extends BaseVehicle {
  // Propriedades específicas do dragão
  private fireBreathCharge: number = 0;
  private wingSpan: number = 0;
  private fireTexture: PIXI.Texture | null = null;
  
  /**
   * Cria um novo veículo do tipo Dragão
   * @param id Identificador único
   * @param x Posição inicial X
   * @param y Posição inicial Y
   * @param playerId ID do jogador proprietário
   */
  constructor(id: number, x: number, y: number, playerId: number = 0) {
    // Chama o construtor da classe base com os parâmetros específicos do dragão
    super(
      id,
      'Dragão',
      VehicleType.DRAGON,
      x,
      y,
      60, // width
      40, // height
      120, // health - dragões têm mais vida
      playerId
    );
    
    // Configura as armas específicas do dragão
    this.primaryWeapon = WeaponType.FIRE;
    this.secondaryWeapon = WeaponType.BOMB;
    
    // Configura propriedades específicas
    this.maxSpecialAbilityCharge = 150; // Dragões têm mais carga de habilidade especial
    this.mass = 8; // Dragões são mais leves que outros veículos
    
    // Carrega os recursos gráficos específicos
    this.loadDragonGraphics();
  }
  
  /**
   * Carrega os recursos gráficos do dragão
   */
  private loadDragonGraphics(): void {
    // TODO: Carregar textura do dragão
    if (this.sprite) {
      // Configura a textura do dragão (placeholder)
      this.sprite.width = this.width;
      this.sprite.height = this.height;
      this.sprite.tint = 0xFF0000; // Dragão vermelho
    }
    
    // Adiciona efeitos visuais específicos
    this.addWings();
  }
  
  /**
   * Adiciona asas ao modelo do dragão
   */
  private addWings(): void {
    // Criar asas como sprites adicionais
    const leftWing = new PIXI.Graphics();
    leftWing.beginFill(0xDD0000);
    leftWing.drawPolygon([
      0, 0,
      -20, -10,
      -15, 10
    ]);
    leftWing.endFill();
    leftWing.x = -this.width / 4;
    
    const rightWing = new PIXI.Graphics();
    rightWing.beginFill(0xDD0000);
    rightWing.drawPolygon([
      0, 0,
      20, -10,
      15, 10
    ]);
    rightWing.endFill();
    rightWing.x = this.width / 4;
    
    // Adiciona as asas ao container gráfico
    this.graphics.addChild(leftWing);
    this.graphics.addChild(rightWing);
  }
  
  /**
   * Implementação especializada do método de atualização
   * @param deltaTime Tempo desde o último frame
   */
  override update(deltaTime: number): void {
    // Chama a implementação da classe base
    super.update(deltaTime);
    
    // Lógica específica do dragão
    this.animateWings(deltaTime);
    
    // Recupera pontos de vida lentamente (regeneração)
    if (!this.isDead && this.health < this.maxHealth) {
      this.heal(0.1 * deltaTime);
    }
  }
  
  /**
   * Animação das asas do dragão
   * @param deltaTime Tempo desde o último frame
   */
  private animateWings(deltaTime: number): void {
    // Implementação simplificada da animação das asas
    this.wingSpan = Math.sin(Date.now() / 200) * 5;
    
    // Aplica a animação aos sprites das asas (se existirem)
    if (this.graphics.children.length > 2) {
      const leftWing = this.graphics.children[2] as PIXI.Graphics;
      const rightWing = this.graphics.children[3] as PIXI.Graphics;
      
      if (leftWing && rightWing) {
        leftWing.y = this.wingSpan;
        rightWing.y = this.wingSpan;
      }
    }
  }
  
  /**
   * Implementação especializada do método de disparo primário (fogo)
   * @param velocityX Componente X da velocidade inicial do projétil
   * @param velocityY Componente Y da velocidade inicial do projétil
   * @returns O projétil criado ou null se não foi possível atirar
   */
  override firePrimaryWeapon(velocityX: number, velocityY: number): any {
    // Implementação especializada para o sopro de fogo
    console.log(`${this.name} dispara rajada de fogo com velocidade (${velocityX}, ${velocityY})`);
    
    // TODO: Criar um projétil de fogo e retorná-lo
    
    // Adiciona carga à habilidade especial quando atira
    this.chargeSpecialAbility(10);
    
    return null; // Por enquanto retorna null
  }
  
  /**
   * Implementação especializada da habilidade especial
   * @returns Verdadeiro se a habilidade foi usada com sucesso
   */
  override useSpecialAbility(): boolean {
    // Verifica se pode usar a habilidade (implementação da classe base)
    if (!super.useSpecialAbility()) {
      return false;
    }
    
    // Implementação da habilidade especial do dragão: Tempestade de Fogo
    console.log(`${this.name} usa Tempestade de Fogo!`);
    
    // TODO: Implementar efeito visual da tempestade de fogo
    
    // Aplica o efeito da habilidade (dano em área, por exemplo)
    // Isso seria implementado com o sistema de jogo
    
    return true;
  }
} 