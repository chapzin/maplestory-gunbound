import { GameEventCoordinator, IGameEventCoordinator } from '../../../core/events/game-event-coordinator';
import { GameSystems } from '../../../core/interfaces/game-systems';
import { EventEmitter } from '../../../utils/event-emitter';

// Usamos type assertion para contornar os problemas de tipagem nos mocks
// Isso é aceitável para testes unitários onde estamos apenas testando a funcionalidade 
// do GameEventCoordinator, não suas dependências reais
const createMockSystems = (): GameSystems => {
  // Versão simplificada usando type assertions para todos os componentes
  return {
    renderer: {
      initialize: jest.fn(),
      getContainer: jest.fn(),
      addToContainer: jest.fn(),
      updateLayout: jest.fn(),
      on: jest.fn(),
      off: jest.fn(),
      dispose: jest.fn()
    } as any,
    inputHandler: {
      initialize: jest.fn(),
      setEnabled: jest.fn(),
      on: jest.fn(),
      off: jest.fn(),
      update: jest.fn(),
      dispose: jest.fn()
    } as any,
    audioController: {
      initialize: jest.fn(),
      playSound: jest.fn(),
      playMusic: jest.fn(),
      on: jest.fn(),
      off: jest.fn(),
      dispose: jest.fn()
    } as any,
    uiCoordinator: {
      initialize: jest.fn(),
      updatePlayerTurn: jest.fn(),
      updateWindIndicator: jest.fn(),
      on: jest.fn(),
      off: jest.fn(),
      update: jest.fn(),
      dispose: jest.fn()
    } as any,
    gameStateManager: {} as any,
    vehicleManager: {} as any,
    projectileManager: {} as any,
    turnSystem: {} as any,
    aimingSystem: {} as any,
    physics: {} as any,
    terrain: {} as any
  };
};

describe('GameEventCoordinator', () => {
  let gameEventCoordinator: GameEventCoordinator;
  let mockSystems: GameSystems;
  
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Spy no console para testar warnings
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    
    gameEventCoordinator = new GameEventCoordinator();
    mockSystems = createMockSystems();
  });
  
  afterEach(() => {
    jest.restoreAllMocks();
  });
  
  test('deve inicializar corretamente', () => {
    gameEventCoordinator.initialize(mockSystems);
    
    // Verifica que sistemas foram armazenados e o estado de inicialização foi atualizado
    expect((gameEventCoordinator as any).systems).toBe(mockSystems);
    expect((gameEventCoordinator as any).initialized).toBe(true);
  });
  
  test('não deve inicializar mais de uma vez', () => {
    gameEventCoordinator.initialize(mockSystems);
    
    // Cria novos sistemas mock para verificar se serão substituídos
    const newMockSystems = createMockSystems();
    gameEventCoordinator.initialize(newMockSystems);
    
    // Verifica que os sistemas originais foram mantidos
    expect((gameEventCoordinator as any).systems).toBe(mockSystems);
    expect((gameEventCoordinator as any).systems).not.toBe(newMockSystems);
  });
  
  test('setupEvents deve mostrar warning se não inicializado', () => {
    // Não inicializa
    gameEventCoordinator.setupEvents();
    
    // Verifica que o warning foi mostrado
    expect(console.warn).toHaveBeenCalledWith('GameEventCoordinator não foi inicializado');
  });
  
  test('setupEvents deve configurar todos os eventos necessários', () => {
    gameEventCoordinator.initialize(mockSystems);
    
    // Spy nos métodos privados de setup
    const setupInputEventsSpy = jest.spyOn(gameEventCoordinator as any, 'setupInputEvents');
    const setupVehicleEventsSpy = jest.spyOn(gameEventCoordinator as any, 'setupVehicleEvents');
    const setupTurnEventsSpy = jest.spyOn(gameEventCoordinator as any, 'setupTurnEvents');
    const setupProjectileEventsSpy = jest.spyOn(gameEventCoordinator as any, 'setupProjectileEvents');
    const setupAimingEventsSpy = jest.spyOn(gameEventCoordinator as any, 'setupAimingEvents');
    const setupGameStateEventsSpy = jest.spyOn(gameEventCoordinator as any, 'setupGameStateEvents');
    const setupAudioEventsSpy = jest.spyOn(gameEventCoordinator as any, 'setupAudioEvents');
    
    gameEventCoordinator.setupEvents();
    
    // Verifica que todos os métodos de setup foram chamados
    expect(setupInputEventsSpy).toHaveBeenCalled();
    expect(setupVehicleEventsSpy).toHaveBeenCalled();
    expect(setupTurnEventsSpy).toHaveBeenCalled();
    expect(setupProjectileEventsSpy).toHaveBeenCalled();
    expect(setupAimingEventsSpy).toHaveBeenCalled();
    expect(setupGameStateEventsSpy).toHaveBeenCalled();
    expect(setupAudioEventsSpy).toHaveBeenCalled();
  });
  
  test('on deve registrar um callback para um evento', () => {
    const eventEmitterOnSpy = jest.spyOn(EventEmitter.prototype, 'on');
    const mockCallback = jest.fn();
    
    gameEventCoordinator.on('test_event', mockCallback);
    
    expect(eventEmitterOnSpy).toHaveBeenCalledWith('test_event', mockCallback);
  });
  
  test('emit deve emitir um evento com dados', () => {
    const eventEmitterEmitSpy = jest.spyOn(EventEmitter.prototype, 'emit');
    const testData = { value: 123 };
    
    gameEventCoordinator.emit('test_event', testData);
    
    expect(eventEmitterEmitSpy).toHaveBeenCalledWith('test_event', testData);
  });
  
  test('dispose deve limpar event listeners', () => {
    const eventEmitterRemoveAllListenersSpy = jest.spyOn(EventEmitter.prototype, 'removeAllListeners');
    
    gameEventCoordinator.initialize(mockSystems);
    gameEventCoordinator.dispose();
    
    expect(eventEmitterRemoveAllListenersSpy).toHaveBeenCalled();
    expect((gameEventCoordinator as any).initialized).toBe(false);
  });
  
  test('dispose não deve fazer nada se não estiver inicializado', () => {
    const eventEmitterRemoveAllListenersSpy = jest.spyOn(EventEmitter.prototype, 'removeAllListeners');
    
    // Não inicializa
    gameEventCoordinator.dispose();
    
    expect(eventEmitterRemoveAllListenersSpy).not.toHaveBeenCalled();
  });
  
  test('eventos registrados devem ser acionados quando emitidos', () => {
    const mockCallback = jest.fn();
    const testData = { value: 456 };
    
    gameEventCoordinator.on('test_event', mockCallback);
    gameEventCoordinator.emit('test_event', testData);
    
    expect(mockCallback).toHaveBeenCalledWith(testData);
  });
}); 