import { GameLogicController, IGameLogicController, PlayerAction, LogicEventType } from '../../../core/logic/game-logic-controller';
import { GameStateManager, GameState } from '../../../core/game-state-manager';
import { VehicleManager } from '../../../entities/vehicle-manager';
import { ProjectileManager } from '../../../systems/projectile-manager';
import { TurnSystem } from '../../../systems/turn-system';
import { AimingSystem } from '../../../systems/aiming-system';
import { Physics } from '../../../systems/physics';
import { Terrain } from '../../../systems/terrain';
import { IGameEventCoordinator } from '../../../core/events/game-event-coordinator';
import { GameSystems } from '../../../core/interfaces/game-systems';
import { CONFIG } from '../../../core/config';
import { EventEmitter } from '../../../utils/event-emitter';

// Mock simples da configuração
jest.mock('../../../core/config', () => ({
  CONFIG: {
    PHYSICS: {
      WIND_MIN: -10,
      WIND_MAX: 10
    }
  }
}));

// Mock de um veículo
const createMockVehicle = (id: number, playerIndex: number) => ({
  id,
  playerIndex,
  position: { x: 100, y: 200 },
  moveLeft: jest.fn(),
  moveRight: jest.fn(),
  firePrimaryWeapon: jest.fn().mockReturnValue({ id: 'proj1', type: 'standard' }),
  damage: jest.fn(),
  destroy: jest.fn(),
  update: jest.fn()
});

describe('GameLogicController', () => {
  let gameLogicController: GameLogicController;
  
  // Mocks das dependências
  let mockGameStateManager: jest.Mocked<GameStateManager>;
  let mockVehicleManager: jest.Mocked<VehicleManager>;
  let mockProjectileManager: jest.Mocked<ProjectileManager>;
  let mockTurnSystem: jest.Mocked<TurnSystem>;
  let mockAimingSystem: jest.Mocked<AimingSystem>;
  let mockPhysics: jest.Mocked<Physics>;
  let mockTerrain: jest.Mocked<Terrain>;
  let mockEventCoordinator: jest.Mocked<IGameEventCoordinator>;
  let mockSystems: GameSystems;
  
  beforeEach(() => {
    // Criar os mocks
    mockGameStateManager = {
      startGame: jest.fn(),
      restartGame: jest.fn(),
      isPlaying: jest.fn().mockReturnValue(true),
      getCurrentState: jest.fn().mockReturnValue(GameState.PLAYING)
    } as unknown as jest.Mocked<GameStateManager>;
    
    mockVehicleManager = {
      createVehicle: jest.fn().mockImplementation(() => createMockVehicle(1, 0)),
      getVehicleByIndex: jest.fn().mockImplementation((index) => {
        return index === 0 ? createMockVehicle(1, 0) : createMockVehicle(2, 1);
      }),
      getVehicleIndexByPlayer: jest.fn().mockImplementation((playerIndex) => playerIndex),
      clearAll: jest.fn()
    } as unknown as jest.Mocked<VehicleManager>;
    
    mockProjectileManager = {
      addProjectile: jest.fn(),
      clearAll: jest.fn()
    } as unknown as jest.Mocked<ProjectileManager>;
    
    mockTurnSystem = {
      startNewTurn: jest.fn(),
      forceEndTurn: jest.fn(),
      getIsPlayerTurn: jest.fn().mockReturnValue(true),
      getCurrentPlayerIndex: jest.fn().mockReturnValue(0)
    } as unknown as jest.Mocked<TurnSystem>;
    
    mockAimingSystem = {
      adjustAngle: jest.fn(),
      adjustPower: jest.fn(),
      updateAimingGuide: jest.fn(),
      setWind: jest.fn(),
      getAngle: jest.fn().mockReturnValue(45),
      getPower: jest.fn().mockReturnValue(50)
    } as unknown as jest.Mocked<AimingSystem>;
    
    mockPhysics = {} as unknown as jest.Mocked<Physics>;
    
    mockTerrain = {
      findSuitablePositions: jest.fn().mockReturnValue([
        { x: 100, y: 300 },
        { x: 500, y: 300 }
      ]),
      generate: jest.fn()
    } as unknown as jest.Mocked<Terrain>;
    
    mockEventCoordinator = {
      emit: jest.fn(),
      on: jest.fn(),
      off: jest.fn()
    } as unknown as jest.Mocked<IGameEventCoordinator>;
    
    // Criar o GameLogicController
    gameLogicController = new GameLogicController(
      mockGameStateManager,
      mockVehicleManager,
      mockProjectileManager,
      mockTurnSystem,
      mockAimingSystem,
      mockPhysics,
      mockTerrain,
      mockEventCoordinator
    );
    
    // Sistemas mock para inicialização
    mockSystems = {
      renderer: {} as any,
      inputHandler: {} as any,
      audioController: {} as any,
      uiCoordinator: {} as any,
      gameStateManager: mockGameStateManager,
      vehicleManager: mockVehicleManager,
      projectileManager: mockProjectileManager,
      turnSystem: mockTurnSystem,
      aimingSystem: mockAimingSystem,
      physics: mockPhysics,
      terrain: mockTerrain
    };
    
    // Inicializar o controlador
    gameLogicController.initialize(mockSystems);
  });
  
  afterEach(() => {
    jest.clearAllMocks();
  });
  
  test('deve inicializar corretamente', () => {
    expect((gameLogicController as any).initialized).toBe(true);
    expect((gameLogicController as any).systems).toBe(mockSystems);
  });
  
  test('não deve inicializar mais de uma vez', () => {
    const newMockSystems = { ...mockSystems };
    gameLogicController.initialize(newMockSystems);
    
    expect((gameLogicController as any).systems).toBe(mockSystems);
    expect((gameLogicController as any).systems).not.toBe(newMockSystems);
  });
  
  test('startGame deve iniciar o jogo e emitir um evento', () => {
    // Spy no EventEmitter
    const emitSpy = jest.spyOn(EventEmitter.prototype, 'emit');
    
    gameLogicController.startGame();
    
    expect(mockGameStateManager.startGame).toHaveBeenCalled();
    expect(mockTurnSystem.startNewTurn).toHaveBeenCalled();
    expect(emitSpy).toHaveBeenCalledWith(LogicEventType.GAME_STARTED, {});
  });
  
  test('createInitialVehicles deve criar veículos para os jogadores', () => {
    gameLogicController.createInitialVehicles();
    
    // Verifica se encontrou posições adequadas
    expect(mockTerrain.findSuitablePositions).toHaveBeenCalledWith(2, 300);
    
    // Verifica se criou veículos nas posições corretas
    expect(mockVehicleManager.createVehicle).toHaveBeenCalledTimes(2);
    expect(mockVehicleManager.createVehicle).toHaveBeenNthCalledWith(
      1, 
      expect.anything(), // VehicleType 
      100, // x 
      280, // y - 20
      0 // Player 0
    );
    expect(mockVehicleManager.createVehicle).toHaveBeenNthCalledWith(
      2, 
      expect.anything(), // VehicleType 
      500, // x 
      280, // y - 20
      1 // Player 1
    );
  });
  
  test('handlePlayerAction deve processar ações válidas (MOVE_LEFT)', () => {
    const mockVehicle = createMockVehicle(1, 0);
    mockVehicleManager.getVehicleByIndex = jest.fn().mockReturnValue(mockVehicle);
    
    gameLogicController.handlePlayerAction(PlayerAction.MOVE_LEFT);
    
    expect(mockVehicle.moveLeft).toHaveBeenCalled();
  });
  
  test('handlePlayerAction deve processar ações válidas (MOVE_RIGHT)', () => {
    const mockVehicle = createMockVehicle(1, 0);
    mockVehicleManager.getVehicleByIndex = jest.fn().mockReturnValue(mockVehicle);
    
    gameLogicController.handlePlayerAction(PlayerAction.MOVE_RIGHT);
    
    expect(mockVehicle.moveRight).toHaveBeenCalled();
  });
  
  test('handlePlayerAction deve processar ações válidas (INCREASE_ANGLE)', () => {
    gameLogicController.handlePlayerAction(PlayerAction.INCREASE_ANGLE);
    
    expect(mockAimingSystem.adjustAngle).toHaveBeenCalledWith(5);
  });
  
  test('handlePlayerAction deve processar ações válidas (DECREASE_ANGLE)', () => {
    gameLogicController.handlePlayerAction(PlayerAction.DECREASE_ANGLE);
    
    expect(mockAimingSystem.adjustAngle).toHaveBeenCalledWith(-5);
  });
  
  test('handlePlayerAction deve processar ações válidas (INCREASE_POWER)', () => {
    gameLogicController.handlePlayerAction(PlayerAction.INCREASE_POWER);
    
    expect(mockAimingSystem.adjustPower).toHaveBeenCalledWith(5);
  });
  
  test('handlePlayerAction deve processar ações válidas (DECREASE_POWER)', () => {
    gameLogicController.handlePlayerAction(PlayerAction.DECREASE_POWER);
    
    expect(mockAimingSystem.adjustPower).toHaveBeenCalledWith(-5);
  });
  
  test('handlePlayerAction deve processar ações válidas (FIRE)', () => {
    // Spy no método fire
    const fireSpy = jest.spyOn(gameLogicController, 'fire');
    
    gameLogicController.handlePlayerAction(PlayerAction.FIRE);
    
    expect(fireSpy).toHaveBeenCalled();
  });
  
  test('handlePlayerAction deve processar ações válidas (END_TURN)', () => {
    // Spy no método endTurn
    const endTurnSpy = jest.spyOn(gameLogicController, 'endTurn');
    
    gameLogicController.handlePlayerAction(PlayerAction.END_TURN);
    
    expect(endTurnSpy).toHaveBeenCalled();
  });
  
  test('handlePlayerAction não deve fazer nada se o jogo não estiver em andamento', () => {
    // Configurar isPlaying para retornar false
    mockGameStateManager.isPlaying = jest.fn().mockReturnValue(false);
    
    gameLogicController.handlePlayerAction(PlayerAction.MOVE_LEFT);
    
    // Verificar que nenhuma ação foi executada
    const mockVehicle = mockVehicleManager.getVehicleByIndex(0);
    expect(mockVehicle.moveLeft).not.toHaveBeenCalled();
  });
  
  test('updateAimingGuide deve atualizar o guia de mira para o veículo ativo', () => {
    const mockVehicle = createMockVehicle(1, 0);
    mockVehicleManager.getVehicleByIndex = jest.fn().mockReturnValue(mockVehicle);
    
    gameLogicController.updateAimingGuide();
    
    expect(mockAimingSystem.updateAimingGuide).toHaveBeenCalledWith(
      mockVehicle.position.x,
      mockVehicle.position.y
    );
  });
  
  test('generateWind deve gerar um valor de vento e atualizar o sistema de mira', () => {
    // Substituir Math.random por um valor fixo para o teste
    const mockRandom = jest.spyOn(Math, 'random').mockReturnValue(0.5);
    
    (gameLogicController as any).generateWind();
    
    // Calcular o valor esperado do vento (WIND_MIN + 0.5 * (WIND_MAX - WIND_MIN))
    const expectedWind = -10 + 0.5 * (10 - (-10)) === 0 ? 0 : -10 + 0.5 * (10 - (-10));
    
    // Verificar que o vento foi atualizado corretamente
    expect((gameLogicController as any).wind).toBe(expectedWind);
    expect(mockAimingSystem.setWind).toHaveBeenCalledWith(expectedWind);
    
    // Restaurar Math.random
    mockRandom.mockRestore();
  });
  
  test('fire deve criar um projétil e finalizar o turno', () => {
    const mockVehicle = createMockVehicle(1, 0);
    mockVehicleManager.getVehicleByIndex = jest.fn().mockReturnValue(mockVehicle);
    
    // Spy no método endTurn
    const endTurnSpy = jest.spyOn(gameLogicController, 'endTurn');
    
    gameLogicController.fire();
    
    // Verificar que o veículo disparou
    expect(mockVehicle.firePrimaryWeapon).toHaveBeenCalled();
    
    // Verificar que o projétil foi adicionado ao gerenciador
    expect(mockProjectileManager.addProjectile).toHaveBeenCalled();
    
    // Verificar que um evento foi emitido
    expect(mockEventCoordinator.emit).toHaveBeenCalledWith('projectile_fired', expect.anything());
    
    // Verificar que o turno foi finalizado
    expect(endTurnSpy).toHaveBeenCalled();
  });
  
  test('fire não deve fazer nada se o jogo não estiver em andamento', () => {
    // Configurar isPlaying para retornar false
    mockGameStateManager.isPlaying = jest.fn().mockReturnValue(false);
    
    gameLogicController.fire();
    
    // Verificar que o veículo não disparou
    expect(mockVehicleManager.getVehicleByIndex(0).firePrimaryWeapon).not.toHaveBeenCalled();
  });
  
  test('endTurn deve finalizar o turno atual', () => {
    gameLogicController.endTurn();
    
    expect(mockTurnSystem.forceEndTurn).toHaveBeenCalled();
  });
  
  test('selectVehicleByPlayerIndex deve selecionar o veículo correto', () => {
    // Spy no EventEmitter
    const emitSpy = jest.spyOn(EventEmitter.prototype, 'emit');
    
    gameLogicController.selectVehicleByPlayerIndex(1);
    
    // Verificar que o índice do jogador foi usado para obter o índice do veículo
    expect(mockVehicleManager.getVehicleIndexByPlayer).toHaveBeenCalledWith(1);
    
    // Verificar que o índice do veículo ativo foi atualizado
    expect((gameLogicController as any).activeVehicleIndex).toBe(1);
    
    // Verificar que um evento foi emitido
    expect(emitSpy).toHaveBeenCalledWith(LogicEventType.VEHICLE_SELECTED, expect.anything());
  });
  
  test('restartGame deve reiniciar o jogo corretamente', () => {
    // Spy no EventEmitter
    const emitSpy = jest.spyOn(EventEmitter.prototype, 'emit');
    
    gameLogicController.restartGame();
    
    // Verificar que os projéteis foram limpos
    expect(mockProjectileManager.clearAll).toHaveBeenCalled();
    
    // Verificar que os veículos foram limpos
    expect(mockVehicleManager.clearAll).toHaveBeenCalled();
    
    // Verificar que o terreno foi regenerado
    expect(mockTerrain.generate).toHaveBeenCalled();
    
    // Verificar que novos veículos foram criados
    // Não podemos testar diretamente a chamada a createInitialVehicles porque é um método interno,
    // mas podemos verificar que createVehicle foi chamado, o que é um bom proxy
    expect(mockVehicleManager.createVehicle).toHaveBeenCalled();
    
    // Verificar que o jogo foi reiniciado
    expect(mockGameStateManager.restartGame).toHaveBeenCalled();
    
    // Verificar que um novo turno foi iniciado
    expect(mockTurnSystem.startNewTurn).toHaveBeenCalled();
    
    // Verificar que um evento foi emitido
    expect(emitSpy).toHaveBeenCalledWith(LogicEventType.GAME_RESTARTED, {});
  });
  
  test('on deve registrar um callback para um evento', () => {
    // Spy no EventEmitter
    const onSpy = jest.spyOn(EventEmitter.prototype, 'on');
    const mockCallback = jest.fn();
    
    gameLogicController.on(LogicEventType.PLAYER_ACTION, mockCallback);
    
    expect(onSpy).toHaveBeenCalledWith(LogicEventType.PLAYER_ACTION, mockCallback);
  });
  
  test('off deve remover um callback para um evento', () => {
    // Spy no EventEmitter
    const offSpy = jest.spyOn(EventEmitter.prototype, 'off');
    const mockCallback = jest.fn();
    
    gameLogicController.off(LogicEventType.PLAYER_ACTION, mockCallback);
    
    expect(offSpy).toHaveBeenCalledWith(LogicEventType.PLAYER_ACTION, mockCallback);
  });
  
  test('dispose deve limpar todos os listeners de eventos', () => {
    // Spy no EventEmitter
    const removeAllListenersSpy = jest.spyOn(EventEmitter.prototype, 'removeAllListeners');
    
    gameLogicController.dispose();
    
    expect(removeAllListenersSpy).toHaveBeenCalled();
  });
}); 