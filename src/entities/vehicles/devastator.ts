import * as PIXI from 'pixi.js';
import { BaseVehicle } from './base-vehicle';
import { VehicleType, WeaponType } from './types';
import { ProjectileAdapter } from '../projectile-adapter';
import { PhysicsService } from '../../systems/physics-service';

/**
 * Devastator - Veículo com alta resistência e poder de fogo, baixa mobilidade.
 * Arma especial: Bomba de fragmentação
 */
export class DevastatorVehicle extends BaseVehicle {
  private bombChargeLevel: number = 0;
  private maxBombCharge: number = 100;
  private chargeSpeed: number = 2.5; // Carrega mais lentamente que o Interceptor
  private projectileAdapter: ProjectileAdapter;
  private physicsService: PhysicsService;

  /**
   * Cria uma nova instância de Devastador
   * @param id ID único do veículo
   * @param x Posição inicial X
   * @param y Posição inicial Y
   * @param playerId ID do jogador proprietário
   */
  constructor(id: number, x: number, y: number, playerId: number) {
    super(
      id,
      'Devastador',
      VehicleType.DEVASTATOR,
      x,
      y,
      40, // width (maior que o Interceptor)
      30, // height (maior que o Interceptor)
      150, // health (maior que o padrão)
      playerId
    );
    
    // Define propriedades de movimento (abaixo da média)
    this.maxMovementPoints = 3;
    this.movementPoints = this.maxMovementPoints;
    
    // Define propriedades de armas
    this.primaryWeapon = WeaponType.CANNON;
    this.secondaryWeapon = WeaponType.FRAG_BOMB;
    
    // Define propriedades físicas específicas
    this.mass = 1.5; // Mais pesado que a média
    
    // Inicializa o adaptador de projéteis e o serviço de física
    this.projectileAdapter = ProjectileAdapter.getInstance();
    this.physicsService = PhysicsService.getInstance();
    
    // Substitui os gráficos padrão por gráficos específicos
    this.initGraphics();
  }

  /**
   * Inicializa os gráficos do veículo
   */
  protected initGraphics(): void {
    // Limpa o container gráfico existente
    this.graphics.removeChildren();
    
    // Cria o corpo do veículo
    const body = new PIXI.Graphics();
    body.beginFill(0xc0392b); // Vermelho escuro
    body.drawRect(-this.width / 2, -this.height / 2, this.width, this.height);
    body.endFill();
    
    // Detalhes do veículo
    const details = new PIXI.Graphics();
    details.beginFill(0x922b21); // Vermelho mais escuro
    details.drawRect(-this.width / 4, -this.height / 2, 15, 15);
    details.endFill();
    
    // Torre do canhão
    const turret = new PIXI.Graphics();
    turret.beginFill(0x7d3c98); // Roxo escuro
    turret.drawCircle(0, 0, 10);
    turret.endFill();
    
    // Canhão
    const cannon = new PIXI.Graphics();
    cannon.beginFill(0x5b2c6f); // Roxo mais escuro
    cannon.drawRect(0, -4, 25, 8);
    cannon.endFill();
    
    // Esteiras
    const leftTrack = new PIXI.Graphics();
    leftTrack.beginFill(0x333333); // Cinza escuro
    leftTrack.drawRect(-this.width / 2, this.height / 3, this.width, 5);
    leftTrack.endFill();
    
    const rightTrack = new PIXI.Graphics();
    rightTrack.beginFill(0x333333); // Cinza escuro
    rightTrack.drawRect(-this.width / 2, -this.height / 3 - 5, this.width, 5);
    rightTrack.endFill();
    
    // Adiciona os componentes ao container
    this.graphics.addChild(body);
    this.graphics.addChild(details);
    this.graphics.addChild(leftTrack);
    this.graphics.addChild(rightTrack);
    this.graphics.addChild(turret);
    this.graphics.addChild(cannon);
    
    // Posiciona o container
    this.graphics.position.set(this.position.x, this.position.y);
    
    // Atualiza a barra de vida
    super.update(0);
  }

  /**
   * Atualiza o estado do veículo
   * @param deltaTime Delta time em segundos
   */
  public update(deltaTime: number): void {
    super.update(deltaTime);
    
    // Recarrega a bomba de fragmentação gradualmente
    if (this.bombChargeLevel < this.maxBombCharge) {
      this.bombChargeLevel = Math.min(
        this.bombChargeLevel + this.chargeSpeed * deltaTime,
        this.maxBombCharge
      );
    }
  }

  /**
   * Dispara a arma primária (canhão de alta potência)
   * @param velocityX Componente X da velocidade inicial
   * @param velocityY Componente Y da velocidade inicial
   */
  public firePrimaryWeapon(velocityX: number, velocityY: number): any {
    // Aqui seria implementada a lógica para criar o projétil
    // e adicioná-lo ao gerenciador de projéteis
    console.log(`Devastador (ID: ${this.id}) disparou canhão: vX=${velocityX}, vY=${velocityY}`);
    
    // Obtém o sistema de física do serviço
    const physicsSystem = this.physicsService.getPhysicsSystem();
    
    // Usa o adaptador para criar o projétil
    const projectile = this.projectileAdapter.createProjectile(
      this.graphics,
      this.position.x,
      this.position.y,
      velocityX,
      velocityY,
      this.primaryWeapon,
      physicsSystem
    );
    
    // Retorna dados do projétil (a ser implementado de acordo com o sistema de projéteis)
    return {
      type: this.primaryWeapon,
      x: this.position.x,
      y: this.position.y,
      velocityX,
      velocityY,
      damage: 50, // Dano maior que o normal
      sourceId: this.id,
      playerId: this.playerId,
      physicsSystem,
      projectile
    };
  }

  /**
   * Dispara a arma secundária (bomba de fragmentação)
   * @param velocityX Componente X da velocidade inicial
   * @param velocityY Componente Y da velocidade inicial
   */
  public fireSecondaryWeapon(velocityX: number, velocityY: number): any {
    // Verifica se há carga suficiente para a bomba de fragmentação
    if (this.bombChargeLevel < 50) {
      console.log(`Devastador (ID: ${this.id}) não possui carga suficiente para a bomba de fragmentação.`);
      return null;
    }
    
    // Consome a carga
    const chargeUsed = 50;
    this.bombChargeLevel -= chargeUsed;
    
    // Obtém o sistema de física do serviço
    const physicsSystem = this.physicsService.getPhysicsSystem();
    
    // Cria o projétil usando o adaptador especializado
    const projectile = this.projectileAdapter.createFragBombProjectile(
      this.graphics,
      this.position.x,
      this.position.y,
      velocityX,
      velocityY,
      physicsSystem,
      this.bombChargeLevel + chargeUsed // Passa o nível de carga original
    );
    
    // Loga a ação
    console.log(`Devastador (ID: ${this.id}) disparou bomba de fragmentação: vX=${velocityX}, vY=${velocityY}`);
    
    // Retorna dados do projétil da bomba de fragmentação
    return {
      type: this.secondaryWeapon,
      x: this.position.x,
      y: this.position.y,
      velocityX,
      velocityY,
      damage: 30, // Dano base
      explosionRadius: 50, // Raio da explosão
      fragmentCount: 8, // Número de fragmentos
      fragmentDamage: 15, // Dano de cada fragmento
      fragmentSpread: 120, // Ângulo de espalhamento dos fragmentos em graus
      sourceId: this.id,
      playerId: this.playerId,
      physicsSystem,
      projectile
    };
  }
  
  /**
   * Ativa a habilidade especial (Escudo temporário)
   * @returns True se a habilidade foi usada com sucesso
   */
  public useSpecialAbility(): boolean {
    if (this.specialAbilityCharge < 60) {
      return false;
    }
    
    // Consome a energia da habilidade especial
    this.specialAbilityCharge -= 60;
    
    // Aplica um escudo temporário (regeneração de vida)
    const healAmount = this.maxHealth * 0.2; // Recupera 20% da vida máxima
    this.heal(healAmount);
    
    console.log(`Devastador (ID: ${this.id}) ativou escudo reparador! Curou ${healAmount.toFixed(1)} pontos.`);
    return true;
  }
} 