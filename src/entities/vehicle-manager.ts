import * as PIXI from 'pixi.js';
import { Vehicle, BaseVehicle, VehicleType } from './vehicle';
import { Physics } from '../systems/physics';
import { EventEmitter } from 'events';
import { Projectile } from '../systems/projectile';

/**
 * Tipos de eventos emitidos pelo gerenciador de veículos
 */
export enum VehicleEventType {
  VEHICLE_DESTROYED = 'vehicle_destroyed',
  VEHICLE_DAMAGED = 'vehicle_damaged',
  TURN_CHANGED = 'turn_changed',
  VEHICLE_CREATED = 'vehicleCreated',
  VEHICLE_MOVED = 'vehicleMoved'
}

/**
 * Classe responsável por gerenciar os veículos do jogo
 */
export class VehicleManager extends EventEmitter {
  private vehicles: Vehicle[] = [];
  private container: PIXI.Container;
  private physics: Physics;
  private nextId: number = 1;

  /**
   * Cria um novo gerenciador de veículos
   * @param container Container para armazenar os gráficos dos veículos
   * @param physics Sistema de física para interação
   */
  constructor(container: PIXI.Container, physics: Physics) {
    super();
    this.container = container;
    this.physics = physics;
  }

  /**
   * Cria um novo veículo
   * @param type Tipo do veículo
   * @param x Posição X inicial
   * @param y Posição Y inicial
   * @param playerId ID do jogador dono do veículo
   * @returns O veículo criado
   */
  createVehicle(type: VehicleType, x: number, y: number, playerId: number = 0): Vehicle {
    // Cria o veículo baseado no tipo
    let vehicle: Vehicle;

    switch (type) {
      case VehicleType.DRAGON:
        vehicle = new BaseVehicle(
          this.nextId++,
          'Dragão',
          type,
          x,
          y,
          30, // Largura
          30, // Altura
          100, // Vida
          playerId
        );
        break;
      case VehicleType.ROBOT:
        vehicle = new BaseVehicle(
          this.nextId++,
          'Robô',
          type,
          x,
          y,
          30, // Largura
          30, // Altura
          120, // Vida (robôs são mais resistentes)
          playerId
        );
        break;
      default:
        vehicle = new BaseVehicle(
          this.nextId++,
          'Veículo Padrão',
          VehicleType.DEFAULT,
          x,
          y,
          30,
          30,
          100,
          playerId
        );
    }

    // Adiciona o veículo à lista
    this.vehicles.push(vehicle);

    // Adiciona o gráfico do veículo ao container
    this.container.addChild(vehicle.graphics);

    // Adiciona o veículo ao sistema de física (se necessário)
    if (!vehicle.isStatic) {
      this.physics.addObject(vehicle);
    }

    // Emite evento de veículo criado
    this.emit(VehicleEventType.VEHICLE_CREATED, vehicle);

    return vehicle;
  }

  /**
   * Remove um veículo pelo ID
   * @param id ID do veículo para remover
   */
  removeVehicle(id: number): void {
    const index = this.vehicles.findIndex(v => v.id === id);
    
    if (index !== -1) {
      const vehicle = this.vehicles[index];
      
      // Remove do container PIXI
      this.container.removeChild(vehicle.graphics);
      
      // Remove do sistema de física
      this.physics.removeObject(vehicle);
      
      // Remove da lista de veículos
      this.vehicles.splice(index, 1);
      
      // Destrói o veículo para liberar memória
      vehicle.destroy();
    }
  }

  /**
   * Atualiza todos os veículos
   * @param delta Delta time
   */
  update(delta: number): void {
    for (const vehicle of this.vehicles) {
      vehicle.update(delta);
    }
  }

  /**
   * Aplica dano a um veículo
   * @param id ID do veículo
   * @param damage Quantidade de dano
   */
  damageVehicle(id: number, damage: number): void {
    const vehicle = this.getVehicleById(id);
    
    if (vehicle) {
      vehicle.takeDamage(damage);
      
      // Emite evento de dano
      this.emit(VehicleEventType.VEHICLE_DAMAGED, vehicle, damage);
      
      // Verifica se o veículo foi destruído
      if (vehicle.health <= 0) {
        this.emit(VehicleEventType.VEHICLE_DESTROYED, vehicle);
        this.removeVehicle(id);
      }
    }
  }

  /**
   * Verifica colisão entre um projétil e todos os veículos
   * @param projectile Projétil para verificar colisão
   * @returns Verdadeiro se houve colisão
   */
  checkProjectileCollision(projectile: Projectile): boolean {
    for (const vehicle of this.vehicles) {
      // Calcula a distância entre o projétil e o veículo
      const dx = projectile.x - vehicle.position.x;
      const dy = projectile.y - vehicle.position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // Verifica se houve colisão
      if (distance < (projectile.radius + Math.max(vehicle.width, vehicle.height) / 2)) {
        // Calcula o dano baseado na velocidade do projétil
        const speed = Math.sqrt(
          projectile.velocityX * projectile.velocityX + 
          projectile.velocityY * projectile.velocityY
        );
        
        const damage = Math.floor(10 + speed * 0.5);
        
        // Aplica dano ao veículo
        this.damageVehicle(vehicle.id, damage);
        
        return true;
      }
    }
    
    return false;
  }

  /**
   * Obtém um veículo pelo ID
   * @param id ID do veículo
   * @returns O veículo encontrado ou undefined
   */
  getVehicleById(id: number): Vehicle | undefined {
    return this.vehicles.find(v => v.id === id);
  }

  /**
   * Obtém um veículo pelo índice na lista
   * @param index Índice do veículo
   * @returns O veículo encontrado ou undefined
   */
  getVehicleByIndex(index: number): Vehicle | undefined {
    if (index >= 0 && index < this.vehicles.length) {
      return this.vehicles[index];
    }
    return undefined;
  }

  /**
   * Obtém o índice do veículo correspondente a um jogador
   * @param playerId ID do jogador
   * @returns Índice do primeiro veículo do jogador ou -1
   */
  getVehicleIndexByPlayer(playerId: number): number {
    return this.vehicles.findIndex(v => v.playerId === playerId);
  }

  /**
   * Conta quantos veículos um jogador possui
   * @param playerId ID do jogador
   * @returns Número de veículos do jogador
   */
  getVehicleCountByPlayer(playerId: number): number {
    return this.vehicles.filter(v => v.playerId === playerId).length;
  }

  /**
   * Obtém todos os veículos
   * @returns Array com todos os veículos
   */
  getAllVehicles(): Vehicle[] {
    return [...this.vehicles];
  }

  /**
   * Remove todos os veículos
   */
  clearAll(): void {
    // Remove todos os veículos individualmente para garantir que todos os eventos sejam emitidos
    const vehiclesToRemove = [...this.vehicles];
    for (const vehicle of vehiclesToRemove) {
      this.removeVehicle(vehicle.id);
    }
    
    // Garante que a lista esteja vazia
    this.vehicles = [];
  }
} 