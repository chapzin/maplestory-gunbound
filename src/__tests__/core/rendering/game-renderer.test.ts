import { GameRenderer, ContainerType, RendererEventType, IGameRenderer } from '../../../core/rendering/game-renderer';
import * as PIXI from 'pixi.js';

// Mock do PIXI
jest.mock('pixi.js', () => {
  // Mock do Container
  class MockContainer {
    children: any[] = [];
    addChild = jest.fn(child => {
      this.children.push(child);
      return child;
    });
    removeChild = jest.fn(child => {
      const index = this.children.indexOf(child);
      if (index !== -1) {
        this.children.splice(index, 1);
      }
      return child;
    });
    destroy = jest.fn();
  }

  // Mock do Application
  class MockApplication {
    stage = new MockContainer();
  }

  // Mock do DisplayObject
  class MockDisplayObject {
    // Propriedades mínimas para um DisplayObject
    visible = true;
    x = 0;
    y = 0;
  }

  return {
    Container: jest.fn().mockImplementation(() => new MockContainer()),
    Application: jest.fn().mockImplementation(() => new MockApplication()),
    DisplayObject: jest.fn().mockImplementation(() => new MockDisplayObject())
  };
});

describe('GameRenderer', () => {
  let gameRenderer: GameRenderer;
  let pixiApp: PIXI.Application;
  
  beforeEach(() => {
    // Limpa todos os mocks antes de cada teste
    jest.clearAllMocks();
    
    gameRenderer = new GameRenderer();
    pixiApp = new PIXI.Application();
  });
  
  test('deve inicializar corretamente', () => {
    gameRenderer.initialize(pixiApp);
    
    // Verifica que o container principal foi adicionado ao stage
    expect(pixiApp.stage.addChild).toHaveBeenCalledTimes(1);
    
    // Verifica que os containers internos foram adicionados ao container principal
    const mainContainer = (pixiApp.stage.addChild as jest.Mock).mock.results[0].value;
    expect(mainContainer.addChild).toHaveBeenCalledTimes(5); // background, terrain, vehicle, projectile, ui
  });
  
  test('não deve inicializar mais de uma vez', () => {
    gameRenderer.initialize(pixiApp);
    
    // Reset mocks para verificar se são chamados novamente
    (pixiApp.stage.addChild as jest.Mock).mockClear();
    
    // Tenta inicializar novamente
    gameRenderer.initialize(pixiApp);
    
    // Verifica que não foram feitas chamadas adicionais
    expect(pixiApp.stage.addChild).not.toHaveBeenCalled();
  });
  
  test('deve emitir eventos para cada container ao inicializar', () => {
    const mockCallback = jest.fn();
    gameRenderer.on(RendererEventType.CONTAINER_ADDED, mockCallback);
    
    gameRenderer.initialize(pixiApp);
    
    // Verifica que o evento foi emitido para cada container (main, background, terrain, vehicle, projectile, ui)
    expect(mockCallback).toHaveBeenCalledTimes(6);
  });
  
  test('getContainer deve retornar o container correto', () => {
    gameRenderer.initialize(pixiApp);
    
    const container = gameRenderer.getContainer(ContainerType.TERRAIN);
    expect(container).toBeDefined();
  });
  
  test('getContainer deve lançar erro se o renderer não foi inicializado', () => {
    expect(() => {
      gameRenderer.getContainer(ContainerType.MAIN);
    }).toThrow('GameRenderer não foi inicializado');
  });
  
  test('getContainer deve lançar erro se o tipo de container não existe', () => {
    gameRenderer.initialize(pixiApp);
    
    // Força um tipo inválido para testar o erro
    expect(() => {
      gameRenderer.getContainer('invalid_type' as ContainerType);
    }).toThrow('Container do tipo invalid_type não encontrado');
  });
  
  test('addToContainer deve adicionar objeto ao container correto', () => {
    gameRenderer.initialize(pixiApp);
    
    const displayObject = new (PIXI.DisplayObject as any)();
    gameRenderer.addToContainer(ContainerType.VEHICLE, displayObject);
    
    // Recupera o container para verificar se o objeto foi adicionado
    const container = gameRenderer.getContainer(ContainerType.VEHICLE);
    expect(container.addChild).toHaveBeenCalledWith(displayObject);
  });
  
  test('addToContainer deve emitir evento DISPLAY_OBJECT_ADDED', () => {
    gameRenderer.initialize(pixiApp);
    
    const mockCallback = jest.fn();
    gameRenderer.on(RendererEventType.DISPLAY_OBJECT_ADDED, mockCallback);
    
    const displayObject = new (PIXI.DisplayObject as any)();
    gameRenderer.addToContainer(ContainerType.VEHICLE, displayObject);
    
    expect(mockCallback).toHaveBeenCalledWith({
      containerType: ContainerType.VEHICLE,
      displayObject
    });
  });
  
  test('updateLayout deve emitir evento com dimensões corretas', () => {
    gameRenderer.initialize(pixiApp);
    
    const mockCallback = jest.fn();
    gameRenderer.on(RendererEventType.LAYOUT_UPDATED, mockCallback);
    
    gameRenderer.updateLayout(800, 600);
    
    expect(mockCallback).toHaveBeenCalledWith({ width: 800, height: 600 });
  });
  
  test('updateLayout não deve fazer nada se o renderer não foi inicializado', () => {
    const mockCallback = jest.fn();
    gameRenderer.on(RendererEventType.LAYOUT_UPDATED, mockCallback);
    
    gameRenderer.updateLayout(800, 600);
    
    expect(mockCallback).not.toHaveBeenCalled();
  });
  
  test('dispose deve remover e destruir o container principal', () => {
    gameRenderer.initialize(pixiApp);
    
    gameRenderer.dispose();
    
    // Recupera o container principal que foi adicionado ao stage
    const mainContainer = (pixiApp.stage.addChild as jest.Mock).mock.results[0].value;
    
    // Verifica que o container foi removido e destruído
    expect(pixiApp.stage.removeChild).toHaveBeenCalledWith(mainContainer);
    expect(mainContainer.destroy).toHaveBeenCalledWith({children: true});
  });
  
  test('dispose deve limpar todos os listeners de eventos', () => {
    gameRenderer.initialize(pixiApp);
    
    const mockCallback = jest.fn();
    gameRenderer.on(RendererEventType.LAYOUT_UPDATED, mockCallback);
    
    gameRenderer.dispose();
    
    // Tenta emitir um evento após o dispose
    gameRenderer.updateLayout(800, 600);
    
    // Verificar que o callback não foi chamado
    expect(mockCallback).not.toHaveBeenCalled();
  });
  
  test('dispose deve resetar estado de inicialização', () => {
    gameRenderer.initialize(pixiApp);
    gameRenderer.dispose();
    
    // Verifica que chamar getContainer após dispose lança o erro de não inicializado
    expect(() => {
      gameRenderer.getContainer(ContainerType.MAIN);
    }).toThrow('GameRenderer não foi inicializado');
  });
  
  test('dispose não deve fazer nada se o renderer não foi inicializado', () => {
    // Não inicializa
    gameRenderer.dispose();
    
    // Não deve lançar erros
    expect(true).toBe(true);
  });
}); 