import { Vehicle, VehicleType } from '../entities/vehicles';
import { VehicleFactory } from '../entities/vehicle-factory';

/**
 * Gerenciador de veículos do jogo
 * Responsável por criar, atualizar e gerenciar todos os veículos
 */
export class VehicleManager {
  // Mapa de todos os veículos ativos, indexados por ID
  private vehicles: Map<number, Vehicle> = new Map();
  
  // Agrupamentos úteis para consultas rápidas
  private vehiclesByPlayer: Map<number, Vehicle[]> = new Map();
  private vehiclesByType: Map<VehicleType, Vehicle[]> = new Map();
  
  constructor() {
    // Inicializa os mapas de agrupamento para todos os tipos de veículos
    Object.values(VehicleType).forEach(type => {
      this.vehiclesByType.set(type as VehicleType, []);
    });
  }
  
  /**
   * Adiciona um veículo ao gerenciador
   * @param vehicle Veículo a ser adicionado
   */
  addVehicle(vehicle: Vehicle): void {
    // Adiciona ao mapa principal
    this.vehicles.set(vehicle.id, vehicle);
    
    // Adiciona ao agrupamento por jogador
    if (!this.vehiclesByPlayer.has(vehicle.playerId)) {
      this.vehiclesByPlayer.set(vehicle.playerId, []);
    }
    this.vehiclesByPlayer.get(vehicle.playerId)?.push(vehicle);
    
    // Adiciona ao agrupamento por tipo
    this.vehiclesByType.get(vehicle.type)?.push(vehicle);
  }
  
  /**
   * Cria e adiciona um novo veículo ao gerenciador
   * @param type Tipo de veículo a ser criado
   * @param x Posição inicial X
   * @param y Posição inicial Y
   * @param playerId ID do jogador proprietário
   * @returns O veículo criado
   */
  createVehicle(type: VehicleType, x: number, y: number, playerId: number = 0): Vehicle {
    // Usa a factory para criar o veículo
    const vehicle = VehicleFactory.createVehicle(type, x, y, playerId);
    
    // Adiciona ao gerenciador
    this.addVehicle(vehicle);
    
    return vehicle;
  }
  
  /**
   * Remove um veículo do gerenciador
   * @param vehicleId ID do veículo a ser removido
   * @returns Verdadeiro se o veículo foi removido com sucesso
   */
  removeVehicle(vehicleId: number): boolean {
    const vehicle = this.vehicles.get(vehicleId);
    
    if (!vehicle) {
      return false;
    }
    
    // Remove do mapa principal
    this.vehicles.delete(vehicleId);
    
    // Remove do agrupamento por jogador
    const playerVehicles = this.vehiclesByPlayer.get(vehicle.playerId);
    if (playerVehicles) {
      const index = playerVehicles.indexOf(vehicle);
      if (index !== -1) {
        playerVehicles.splice(index, 1);
      }
    }
    
    // Remove do agrupamento por tipo
    const typeVehicles = this.vehiclesByType.get(vehicle.type);
    if (typeVehicles) {
      const index = typeVehicles.indexOf(vehicle);
      if (index !== -1) {
        typeVehicles.splice(index, 1);
      }
    }
    
    // Libera os recursos do veículo
    vehicle.destroy();
    
    return true;
  }
  
  /**
   * Obtém um veículo pelo ID
   * @param vehicleId ID do veículo
   * @returns O veículo ou undefined se não encontrado
   */
  getVehicle(vehicleId: number): Vehicle | undefined {
    return this.vehicles.get(vehicleId);
  }
  
  /**
   * Obtém todos os veículos de um jogador
   * @param playerId ID do jogador
   * @returns Array de veículos do jogador
   */
  getPlayerVehicles(playerId: number): Vehicle[] {
    return this.vehiclesByPlayer.get(playerId) || [];
  }
  
  /**
   * Obtém todos os veículos de um determinado tipo
   * @param type Tipo de veículo
   * @returns Array de veículos do tipo especificado
   */
  getVehiclesByType(type: VehicleType): Vehicle[] {
    return this.vehiclesByType.get(type) || [];
  }
  
  /**
   * Obtém todos os veículos
   * @returns Array com todos os veículos
   */
  getAllVehicles(): Vehicle[] {
    return Array.from(this.vehicles.values());
  }
  
  /**
   * Atualiza todos os veículos
   * @param deltaTime Tempo desde o último frame
   */
  update(deltaTime: number): void {
    // Atualiza todos os veículos
    for (const vehicle of this.vehicles.values()) {
      vehicle.update(deltaTime);
      
      // Remove veículos destruídos
      if (vehicle.isDestroyed()) {
        this.removeVehicle(vehicle.id);
      }
    }
  }
  
  /**
   * Limpa todos os veículos
   */
  clear(): void {
    // Destrói todos os veículos
    for (const vehicle of this.vehicles.values()) {
      vehicle.destroy();
    }
    
    // Limpa todas as coleções
    this.vehicles.clear();
    this.vehiclesByPlayer.clear();
    
    // Reinicia as coleções por tipo
    Object.values(VehicleType).forEach(type => {
      this.vehiclesByType.set(type as VehicleType, []);
    });
  }
} 