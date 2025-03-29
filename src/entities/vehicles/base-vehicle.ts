import * as PIXI from 'pixi.js';
import { Vehicle, VehicleType, WeaponType, Vector2D } from './types';

/**
 * Classe base para implementação de veículos
 */
export class BaseVehicle implements Vehicle {
  // Propriedades físicas
  position: Vector2D;
  velocity: Vector2D;
  mass: number;
  isStatic: boolean = false;
  width: number;
  height: number;
  
  // Propriedades para compatibilidade com o sistema de física
  get x(): number { return this.position.x; }
  set x(value: number) { this.position.x = value; }
  
  get y(): number { return this.position.y; }
  set y(value: number) { this.position.y = value; }
  
  get velocityX(): number { return this.velocity.x; }
  set velocityX(value: number) { this.velocity.x = value; }
  
  get velocityY(): number { return this.velocity.y; }
  set velocityY(value: number) { this.velocity.y = value; }
  
  // Propriedades base
  id: number;
  name: string;
  type: VehicleType;
  health: number;
  maxHealth: number;
  primaryWeapon: WeaponType;
  secondaryWeapon: WeaponType;
  specialAbilityCharge: number = 0;
  maxSpecialAbilityCharge: number = 100;
  graphics: PIXI.Container;
  sprite: PIXI.Sprite | null;
  playerId: number;
  movementPoints: number;
  maxMovementPoints: number;
  
  // Estado interno
  protected isDead: boolean = false;
  protected healthBar: PIXI.Graphics | null;
  
  /**
   * Cria um novo veículo
   * @param id Identificador único
   * @param name Nome do veículo
   * @param type Tipo de veículo
   * @param x Posição inicial X
   * @param y Posição inicial Y
   * @param width Largura do veículo
   * @param height Altura do veículo
   * @param health Vida inicial/máxima
   * @param playerId ID do jogador proprietário
   */
  constructor(
    id: number,
    name: string,
    type: VehicleType,
    x: number,
    y: number,
    width: number,
    height: number,
    health: number = 100,
    playerId: number = 0
  ) {
    this.id = id;
    this.name = name;
    this.type = type;
    this.position = { x, y };
    this.velocity = { x: 0, y: 0 };
    this.width = width;
    this.height = height;
    this.playerId = playerId;
    
    // Valores de vida
    this.maxHealth = health;
    this.health = this.maxHealth;
    
    // Valores de movimento
    this.maxMovementPoints = 100;
    this.movementPoints = this.maxMovementPoints;
    this.mass = 10;
    
    // Inicializa armas padrão
    this.primaryWeapon = WeaponType.CANNON;
    this.secondaryWeapon = WeaponType.BOMB;
    
    // Cria o container gráfico
    this.graphics = new PIXI.Container();
    
    // Cria o sprite base
    this.sprite = new PIXI.Sprite();
    this.graphics.addChild(this.sprite);
    
    // Cria a barra de vida
    this.healthBar = new PIXI.Graphics();
    this.graphics.addChild(this.healthBar);
    
    // Inicializa a renderização
    this.updateHealthBar();
  }
  
  /**
   * Atualiza o estado do veículo
   * @param deltaTime Tempo desde o último frame
   */
  update(deltaTime: number): void {
    // Atualiza posição baseada na física
    this.position.x += this.velocity.x * deltaTime;
    this.position.y += this.velocity.y * deltaTime;
    
    // Atualiza a posição do container gráfico
    this.graphics.x = this.position.x;
    this.graphics.y = this.position.y;
    
    // Atualiza a barra de vida
    this.updateHealthBar();
  }
  
  /**
   * Renderiza o veículo
   */
  render(): void {
    // A renderização é feita automaticamente pelo PIXI
    // quando os sprites são adicionados ao container
  }
  
  /**
   * Aplica dano ao veículo
   * @param amount Quantidade de dano
   */
  takeDamage(amount: number): void {
    this.health = Math.max(0, this.health - amount);
    
    if (this.health <= 0) {
      this.isDead = true;
    }
    
    this.updateHealthBar();
  }
  
  /**
   * Cura o veículo
   * @param amount Quantidade de cura
   */
  heal(amount: number): void {
    this.health = Math.min(this.maxHealth, this.health + amount);
    this.updateHealthBar();
  }
  
  /**
   * Move o veículo para a esquerda
   */
  moveLeft(): void {
    // Consome pontos de movimento
    if (this.movementPoints > 0) {
      this.position.x -= 5;
      this.movementPoints -= 5;
    }
  }
  
  /**
   * Move o veículo para a direita
   */
  moveRight(): void {
    // Consome pontos de movimento
    if (this.movementPoints > 0) {
      this.position.x += 5;
      this.movementPoints -= 5;
    }
  }
  
  /**
   * Dispara a arma primária
   * @param velocityX Componente X da velocidade inicial do projétil
   * @param velocityY Componente Y da velocidade inicial do projétil
   * @returns O projétil criado ou null se não foi possível atirar
   */
  firePrimaryWeapon(velocityX: number, velocityY: number): any {
    // Esta é uma implementação básica que será sobrescrita pelas classes filhas
    console.log(`${this.name} disparou arma primária: ${this.primaryWeapon} com velocidade (${velocityX}, ${velocityY})`);
    return null;
  }
  
  /**
   * Dispara a arma secundária
   * @param velocityX Componente X da velocidade inicial do projétil
   * @param velocityY Componente Y da velocidade inicial do projétil
   * @returns O projétil criado ou null se não foi possível atirar
   */
  fireSecondaryWeapon(velocityX: number, velocityY: number): any {
    // Esta é uma implementação básica que será sobrescrita pelas classes filhas
    console.log(`${this.name} disparou arma secundária: ${this.secondaryWeapon} com velocidade (${velocityX}, ${velocityY})`);
    return null;
  }
  
  /**
   * Usa a habilidade especial do veículo
   * @returns Verdadeiro se a habilidade foi usada com sucesso
   */
  useSpecialAbility(): boolean {
    // Verifica se tem carga suficiente
    if (this.specialAbilityCharge < this.maxSpecialAbilityCharge) {
      return false;
    }
    
    // Implementação básica
    this.specialAbilityCharge = 0;
    console.log(`${this.name} usou habilidade especial`);
    
    return true;
  }
  
  /**
   * Carrega a habilidade especial
   * @param amount Quantidade de carga para adicionar
   */
  chargeSpecialAbility(amount: number): void {
    this.specialAbilityCharge = Math.min(
      this.maxSpecialAbilityCharge,
      this.specialAbilityCharge + amount
    );
  }
  
  /**
   * Reinicia os pontos de movimento para o máximo
   */
  resetMovementPoints(): void {
    this.movementPoints = this.maxMovementPoints;
  }
  
  /**
   * Verifica se o veículo foi destruído
   * @returns Verdadeiro se o veículo está morto
   */
  isDestroyed(): boolean {
    return this.isDead;
  }
  
  /**
   * Destrói o veículo liberando recursos
   */
  destroy(): void {
    // Remove todos os filhos
    this.graphics.removeChildren();
    
    // Remove referências
    this.sprite = null;
    this.healthBar = null;
    this.isDead = true;
  }
  
  /**
   * Atualiza a barra de vida
   */
  private updateHealthBar(): void {
    if (!this.healthBar) return;
    
    // Limpa a barra existente
    this.healthBar.clear();
    
    // Constantes para a barra de vida
    const barWidth = this.width;
    const barHeight = 5;
    const barY = -this.height / 2 - 10; // Posiciona acima do veículo
    
    // Desenha o fundo da barra (vermelho)
    this.healthBar.beginFill(0xFF0000);
    this.healthBar.drawRect(-barWidth / 2, barY, barWidth, barHeight);
    this.healthBar.endFill();
    
    // Desenha a vida atual (verde)
    const healthWidth = (this.health / this.maxHealth) * barWidth;
    this.healthBar.beginFill(0x00FF00);
    this.healthBar.drawRect(-barWidth / 2, barY, healthWidth, barHeight);
    this.healthBar.endFill();
  }
} 