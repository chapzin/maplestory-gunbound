import { DragonVehicle, Vehicle, VehicleType } from './vehicles';

/**
 * Factory para criação de veículos
 * Centraliza a criação de diferentes tipos de veículos
 */
export class VehicleFactory {
  // Contador para geração de IDs únicos
  private static nextId: number = 1;
  
  /**
   * Cria um veículo com base no tipo especificado
   * @param type Tipo de veículo a ser criado
   * @param x Posição inicial X
   * @param y Posição inicial Y
   * @param playerId ID do jogador proprietário
   * @returns Nova instância do veículo
   */
  static createVehicle(type: VehicleType, x: number, y: number, playerId: number = 0): Vehicle {
    // Gera um ID único para o veículo
    const id = this.getNextId();
    
    // Cria o veículo com base no tipo
    switch (type) {
      case VehicleType.DRAGON:
        return new DragonVehicle(id, x, y, playerId);
        
      // Outros tipos seriam implementados à medida que foram criados
      // case VehicleType.ROBOT:
      //   return new RobotVehicle(id, x, y, playerId);
        
      // Caso padrão ou tipo não implementado
      default:
        // Poderia retornar um veículo base ou lançar um erro
        console.warn(`Tipo de veículo ${type} não implementado. Criando veículo padrão.`);
        return new DragonVehicle(id, x, y, playerId);
    }
  }
  
  /**
   * Gera um ID único para veículos
   * @returns Próximo ID disponível
   */
  private static getNextId(): number {
    return this.nextId++;
  }
} 