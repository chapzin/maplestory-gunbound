import { InputHandler, IInputHandler } from '../../../core/input/input-handler';
import { InputEventType, KeyEventData, MouseEventData } from '../../../systems/input-controller';
import { EventEmitter } from '../../../utils/event-emitter';

// Mock para o getBoundingClientRect do HTMLElement
const mockGetBoundingClientRect = jest.fn().mockReturnValue({
  left: 50,
  top: 50,
  width: 800,
  height: 600
});

// Mock da classe TouchEvent já que não podemos criar TouchEvent diretamente no jsdom
class MockTouchEvent extends Event {
  touches: Touch[];
  changedTouches: Touch[];
  
  constructor(type: string, options: any) {
    super(type);
    this.touches = options.touches || [];
    this.changedTouches = options.changedTouches || [];
  }
  
  preventDefault = jest.fn();
}

describe('InputHandler', () => {
  let inputHandler: InputHandler;
  let mockCanvas: HTMLElement;
  let windowAddEventListenerSpy: jest.SpyInstance;
  let windowRemoveEventListenerSpy: jest.SpyInstance;
  
  beforeEach(() => {
    // Reset mocks e spies
    jest.clearAllMocks();
    
    // Mock do canvas
    mockCanvas = document.createElement('div');
    mockCanvas.getBoundingClientRect = mockGetBoundingClientRect;
    
    // Spies para window event listeners
    windowAddEventListenerSpy = jest.spyOn(window, 'addEventListener');
    windowRemoveEventListenerSpy = jest.spyOn(window, 'removeEventListener');
    
    // Spies para canvas event listeners
    jest.spyOn(mockCanvas, 'addEventListener');
    jest.spyOn(mockCanvas, 'removeEventListener');
    
    inputHandler = new InputHandler();
  });
  
  afterEach(() => {
    // Restaurar mocks e spies
    jest.restoreAllMocks();
  });
  
  test('deve inicializar corretamente', () => {
    inputHandler.initialize(mockCanvas);
    
    // Verifica que os listeners foram adicionados
    expect(windowAddEventListenerSpy).toHaveBeenCalledTimes(1); // keydown
    expect(mockCanvas.addEventListener).toHaveBeenCalledTimes(6); // mousedown, mousemove, mouseup, touchstart, touchmove, touchend
  });
  
  test('não deve inicializar mais de uma vez', () => {
    inputHandler.initialize(mockCanvas);
    
    // Limpar contadores para verificar segunda chamada
    (windowAddEventListenerSpy as jest.Mock).mockClear();
    (mockCanvas.addEventListener as jest.Mock).mockClear();
    
    // Tenta inicializar novamente
    inputHandler.initialize(mockCanvas);
    
    // Verifica que os listeners não foram adicionados novamente
    expect(windowAddEventListenerSpy).not.toHaveBeenCalled();
    expect(mockCanvas.addEventListener).not.toHaveBeenCalled();
  });
  
  test('deve processar evento de tecla', () => {
    inputHandler.initialize(mockCanvas);
    
    const mockCallback = jest.fn();
    inputHandler.on(InputEventType.KEY_DOWN, mockCallback);
    
    // Simula o evento de tecla
    const keyEvent = new KeyboardEvent('keydown', { key: 'ArrowUp' });
    
    // Captura a função que foi registrada para o keydown event
    const keyDownHandler = (windowAddEventListenerSpy.mock.calls[0][1] as EventListener);
    keyDownHandler(keyEvent);
    
    // Verifica que o callback foi chamado com os dados corretos
    expect(mockCallback).toHaveBeenCalledWith(expect.objectContaining({
      key: 'ArrowUp',
      originalEvent: keyEvent
    }));
  });
  
  test('deve processar evento de mouse', () => {
    inputHandler.initialize(mockCanvas);
    
    const mockCallback = jest.fn();
    inputHandler.on(InputEventType.MOUSE_DOWN, mockCallback);
    
    // Simula o evento de mouse
    const mouseEvent = new MouseEvent('mousedown', {
      clientX: 150,
      clientY: 150,
      button: 0
    });
    
    // Encontra o índice correto para o mousedown event
    const mouseDownHandlerIndex = (mockCanvas.addEventListener as jest.Mock).mock.calls.findIndex(
      call => call[0] === 'mousedown'
    );
    
    // Captura a função que foi registrada para o mousedown event
    const mouseDownHandler = (mockCanvas.addEventListener as jest.Mock).mock.calls[mouseDownHandlerIndex][1] as EventListener;
    mouseDownHandler(mouseEvent);
    
    // Verifica que o callback foi chamado com os dados corretos
    expect(mockCallback).toHaveBeenCalledWith(expect.objectContaining({
      x: 100, // 150 - 50 (left offset)
      y: 100, // 150 - 50 (top offset)
      button: 0,
      originalEvent: mouseEvent
    }));
  });
  
  test('deve ignorar eventos quando desativado', () => {
    inputHandler.initialize(mockCanvas);
    
    const mockCallback = jest.fn();
    inputHandler.on(InputEventType.MOUSE_MOVE, mockCallback);
    
    // Desativa o handler
    inputHandler.setEnabled(false);
    
    // Simula o evento de mouse
    const mouseEvent = new MouseEvent('mousemove', {
      clientX: 200,
      clientY: 200,
      button: 0
    });
    
    // Encontra o índice correto para o mousemove event
    const mouseMoveHandlerIndex = (mockCanvas.addEventListener as jest.Mock).mock.calls.findIndex(
      call => call[0] === 'mousemove'
    );
    
    // Captura a função que foi registrada para o mousemove event
    const mouseMoveHandler = (mockCanvas.addEventListener as jest.Mock).mock.calls[mouseMoveHandlerIndex][1] as EventListener;
    mouseMoveHandler(mouseEvent);
    
    // Verifica que o callback não foi chamado
    expect(mockCallback).not.toHaveBeenCalled();
  });
  
  test('deve processar evento de toque como evento de mouse', () => {
    inputHandler.initialize(mockCanvas);
    
    const mockCallback = jest.fn();
    inputHandler.on(InputEventType.MOUSE_DOWN, mockCallback);
    
    // Simula o evento de toque com uma implementação mínima
    // Apenas com as propriedades necessárias para o teste
    const mockTouchEvent = new MockTouchEvent('touchstart', {
      touches: [{
        clientX: 250,
        clientY: 250,
        identifier: 0,
        target: mockCanvas,
        // Propriedades adicionais exigidas por Touch mas não usadas no teste
        pageX: 250,
        pageY: 250,
        screenX: 250,
        screenY: 250,
        radiusX: 10,
        radiusY: 10,
        rotationAngle: 0,
        force: 1
      } as Touch]
    });
    
    // Encontra o índice correto para o touchstart event
    const touchStartHandlerIndex = (mockCanvas.addEventListener as jest.Mock).mock.calls.findIndex(
      call => call[0] === 'touchstart'
    );
    
    // Captura a função que foi registrada para o touchstart event
    const touchStartHandler = (mockCanvas.addEventListener as jest.Mock).mock.calls[touchStartHandlerIndex][1] as EventListener;
    touchStartHandler(mockTouchEvent);
    
    // Verifica que preventDefault foi chamado
    expect(mockTouchEvent.preventDefault).toHaveBeenCalled();
    
    // Verifica que o callback foi chamado com os dados corretos
    expect(mockCallback).toHaveBeenCalledWith(expect.objectContaining({
      x: 200, // 250 - 50 (left offset)
      y: 200, // 250 - 50 (top offset)
      button: 0
      // Não verificamos originalEvent pois ele é criado internamente
    }));
  });
  
  test('deve remover event listeners ao fazer dispose', () => {
    inputHandler.initialize(mockCanvas);
    inputHandler.dispose();
    
    // Verifica que os listeners foram removidos
    expect(windowRemoveEventListenerSpy).toHaveBeenCalledTimes(1); // keydown
    expect(mockCanvas.removeEventListener).toHaveBeenCalledTimes(6); // mousedown, mousemove, mouseup, touchstart, touchmove, touchend
  });
  
  test('deve limpar event listeners ao fazer dispose', () => {
    inputHandler.initialize(mockCanvas);
    
    const mockCallback = jest.fn();
    inputHandler.on(InputEventType.MOUSE_DOWN, mockCallback);
    
    inputHandler.dispose();
    
    // Simula o evento de mouse
    const mouseEvent = new MouseEvent('mousedown', {
      clientX: 150,
      clientY: 150,
      button: 0
    });
    
    // Encontra o índice correto para o mousedown event
    const mouseDownHandlerIndex = (mockCanvas.addEventListener as jest.Mock).mock.calls.findIndex(
      call => call[0] === 'mousedown'
    );
    
    // Captura a função que foi registrada para o mousedown event
    const mouseDownHandler = (mockCanvas.addEventListener as jest.Mock).mock.calls[mouseDownHandlerIndex][1] as EventListener;
    mouseDownHandler(mouseEvent);
    
    // Verifica que o callback não foi chamado após dispose
    expect(mockCallback).not.toHaveBeenCalled();
  });
  
  test('não deve fazer nada em dispose se não estiver inicializado', () => {
    // Não inicializa
    inputHandler.dispose();
    
    // Verifica que nenhum método de remoção foi chamado
    expect(windowRemoveEventListenerSpy).not.toHaveBeenCalled();
    expect(mockCanvas.removeEventListener).not.toHaveBeenCalled();
  });
}); 