import { PhysicsSystem } from './physics-adapter';

/**
 * Serviço global para acesso ao sistema de física
 * Implementa o padrão Singleton para garantir uma única instância do sistema
 */
export class PhysicsService {
  private static instance: PhysicsService;
  private physicsSystem: PhysicsSystem;
  
  /**
   * Obtém a instância única do serviço
   */
  public static getInstance(): PhysicsService {
    if (!PhysicsService.instance) {
      PhysicsService.instance = new PhysicsService();
    }
    return PhysicsService.instance;
  }
  
  /**
   * Construtor privado (singleton)
   */
  private constructor() {
    this.physicsSystem = new PhysicsSystem();
  }
  
  /**
   * Obtém o sistema de física
   */
  public getPhysicsSystem(): PhysicsSystem {
    return this.physicsSystem;
  }
  
  /**
   * Atualiza o sistema de física
   * @param deltaTime Delta time em segundos
   */
  public update(deltaTime: number): void {
    this.physicsSystem.update(deltaTime);
  }
  
  /**
   * Limpa o sistema de física
   */
  public clear(): void {
    this.physicsSystem.clear();
  }
  
  /**
   * Obtém a força atual do vento
   */
  public getWind(): number {
    return this.physicsSystem.getWind();
  }
  
  /**
   * Obtém a força da gravidade
   */
  public getGravity(): number {
    return this.physicsSystem.getGravity();
  }
} 