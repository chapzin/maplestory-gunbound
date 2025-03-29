import * as PIXI from 'pixi.js';
import { BaseVehicle } from './base-vehicle';
import { VehicleType, WeaponType } from './types';

/**
 * Implementação do veículo Interceptor
 * 
 * Características:
 * - Alta mobilidade
 * - Baixa resistência
 * - Arma especial: Míssil teleguiado
 */
export class InterceptorVehicle extends BaseVehicle {
  private missileChargeLevel: number = 0;
  private maxMissileCharge: number = 100;
  private chargeSpeed: number = 5;
  
  /**
   * Cria uma nova instância de Interceptor
   * @param id ID único do veículo
   * @param x Posição inicial X
   * @param y Posição inicial Y
   * @param playerId ID do jogador proprietário
   */
  constructor(id: number, x: number, y: number, playerId: number) {
    super(
      id,
      'Interceptor',
      VehicleType.INTERCEPTOR,
      x,
      y,
      32, // width
      24, // height
      80, // health
      playerId
    );
    
    // Define propriedades de movimento (acima da média)
    this.maxMovementPoints = 5;
    this.movementPoints = this.maxMovementPoints;
    
    // Define propriedades de armas
    this.primaryWeapon = WeaponType.MISSILE;
    this.secondaryWeapon = WeaponType.GUIDED_MISSILE;
    
    // Define propriedades físicas específicas
    this.mass = 0.8; // Mais leve que a média
    
    // Substitui os gráficos padrão por gráficos específicos
    this.initGraphics();
  }
  
  /**
   * Inicializa os gráficos do veículo
   * @private
   */
  protected initGraphics(): void {
    // Limpa o container gráfico existente
    this.graphics.removeChildren();
    
    // Cria um gráfico temporário (placeholder)
    // Em uma implementação real, carregaria texturas
    const body = new PIXI.Graphics();
    body.beginFill(0x3498db); // Azul claro
    body.drawRect(-this.width / 2, -this.height / 2, this.width, this.height);
    body.endFill();
    
    // Detalhes do veículo
    const details = new PIXI.Graphics();
    details.beginFill(0x2980b9); // Azul mais escuro
    details.drawRect(-this.width / 3, -this.height / 2, 10, 15);
    details.endFill();
    
    // Canhão
    const cannon = new PIXI.Graphics();
    cannon.beginFill(0x34495e); // Cinza azulado
    cannon.drawRect(0, -3, 15, 6);
    cannon.endFill();
    
    // Adiciona os componentes ao container
    this.graphics.addChild(body);
    this.graphics.addChild(details);
    this.graphics.addChild(cannon);
    
    // Posiciona o container
    this.graphics.position.set(this.position.x, this.position.y);
    
    // Atualiza a barra de vida
    // Aqui chamamos o método da classe base
    super.update(0);
  }
  
  /**
   * Atualiza o estado do veículo
   * @param deltaTime Delta time em segundos
   */
  public update(deltaTime: number): void {
    super.update(deltaTime);
    
    // Recarrega o míssil guiado gradualmente
    if (this.missileChargeLevel < this.maxMissileCharge) {
      this.missileChargeLevel = Math.min(
        this.missileChargeLevel + this.chargeSpeed * deltaTime,
        this.maxMissileCharge
      );
    }
  }
  
  /**
   * Dispara a arma primária (míssil normal)
   * @param velocityX Componente X da velocidade inicial
   * @param velocityY Componente Y da velocidade inicial
   */
  public firePrimaryWeapon(velocityX: number, velocityY: number): any {
    // Aqui seria implementada a lógica para criar o projétil
    // e adicioná-lo ao gerenciador de projéteis
    console.log(`Interceptor (ID: ${this.id}) disparou míssil normal: vX=${velocityX}, vY=${velocityY}`);
    
    // Retorna dados do projétil (a ser implementado de acordo com o sistema de projéteis)
    return {
      type: this.primaryWeapon,
      x: this.position.x,
      y: this.position.y,
      velocityX,
      velocityY,
      damage: 35,
      sourceId: this.id,
      playerId: this.playerId
    };
  }
  
  /**
   * Dispara a arma secundária (míssil teleguiado)
   * @param velocityX Componente X da velocidade inicial
   * @param velocityY Componente Y da velocidade inicial
   */
  public fireSecondaryWeapon(velocityX: number, velocityY: number): any {
    // Verifica se há carga suficiente para o míssil guiado
    if (this.missileChargeLevel < 75) {
      console.log(`Interceptor (ID: ${this.id}) não possui carga suficiente para o míssil guiado.`);
      return null;
    }
    
    // Consome a carga
    this.missileChargeLevel -= 75;
    
    // Loga a ação
    console.log(`Interceptor (ID: ${this.id}) disparou míssil teleguiado: vX=${velocityX}, vY=${velocityY}`);
    
    // Retorna dados do projétil teleguiado
    return {
      type: this.secondaryWeapon,
      x: this.position.x,
      y: this.position.y,
      velocityX,
      velocityY,
      damage: 25,
      isGuided: true,
      guidanceStrength: 0.2,
      sourceId: this.id,
      playerId: this.playerId
    };
  }
  
  /**
   * Ativa a habilidade especial (Boost de velocidade)
   * @returns True se a habilidade foi usada com sucesso
   */
  public useSpecialAbility(): boolean {
    if (this.specialAbilityCharge < 50) {
      return false;
    }
    
    // Consome a energia da habilidade especial
    this.specialAbilityCharge -= 50;
    
    // Aplica o boost de movimento
    this.movementPoints = Math.min(this.movementPoints + 3, this.maxMovementPoints + 3);
    
    console.log(`Interceptor (ID: ${this.id}) ativou boost de velocidade!`);
    return true;
  }
  
  /**
   * Renderiza o veículo
   */
  public render(): void {
    if (!this.graphics) return;
    
    // Atualiza a posição do gráfico
    this.graphics.position.set(this.position.x, this.position.y);
    
    // Aqui poderia ter lógica adicional de animação
  }
} 