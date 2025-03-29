import { UICoordinator, IUICoordinator, UIEventType } from '../../../core/ui/ui-coordinator';
import { UISystem } from '../../../core/ui';
import { GameUI } from '../../../ui/game-ui';
import { EventEmitter } from '../../../utils/event-emitter';
import * as PIXI from 'pixi.js';

// Mock simplificado do PIXI.Container
jest.mock('pixi.js', () => ({
  Container: jest.fn().mockImplementation(() => ({
    addChild: jest.fn(),
    removeChild: jest.fn()
  }))
}));

// Mock básico das dependências para que possam ser instanciadas
jest.mock('../../../core/ui', () => {
  return {
    UISystem: jest.fn().mockImplementation(() => ({
      addButton: jest.fn(),
      addText: jest.fn(),
      update: jest.fn(),
      clear: jest.fn()
    }))
  };
});

jest.mock('../../../ui/game-ui', () => {
  return {
    GameUI: jest.fn().mockImplementation(() => ({
      updatePlayerTurn: jest.fn(),
      updateWindIndicator: jest.fn(),
      setEndTurnButtonVisible: jest.fn(),
      setEndTurnCallback: jest.fn().mockImplementation(callback => {
        // Armazenar o callback para poder testá-lo depois
        (this as any).storedCallback = callback;
      }),
      showGameOver: jest.fn().mockImplementation((winnerIndex, callback) => {
        // Armazenar o callback para poder testá-lo depois
        (this as any).storedRestartCallback = callback;
      }),
      hideGameOver: jest.fn(),
      showFloatingText: jest.fn()
    }))
  };
});

describe('UICoordinator', () => {
  let uiCoordinator: UICoordinator;
  let mockContainer: PIXI.Container;
  
  // Spies para os métodos do EventEmitter
  let emitSpy: jest.SpyInstance;
  let onSpy: jest.SpyInstance;
  let offSpy: jest.SpyInstance;
  let removeAllListenersSpy: jest.SpyInstance;
  
  beforeEach(() => {
    // Reset mocks e spies
    jest.clearAllMocks();
    
    // Criar container
    mockContainer = new PIXI.Container();
    
    // Criar instância do UICoordinator
    uiCoordinator = new UICoordinator();
    
    // Configurar spies para EventEmitter
    emitSpy = jest.spyOn(EventEmitter.prototype, 'emit');
    onSpy = jest.spyOn(EventEmitter.prototype, 'on');
    offSpy = jest.spyOn(EventEmitter.prototype, 'off');
    removeAllListenersSpy = jest.spyOn(EventEmitter.prototype, 'removeAllListeners');
    
    // Inicializar o UICoordinator
    uiCoordinator.initialize(800, 600, mockContainer);
  });
  
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('deve inicializar corretamente', () => {
    // Verificar que as dependências foram inicializadas
    expect(UISystem).toHaveBeenCalledWith(mockContainer);
    expect(GameUI).toHaveBeenCalledWith(expect.anything(), 800, 600);
    
    // Verificar estado interno
    expect((uiCoordinator as any).initialized).toBe(true);
  });
  
  test('não deve inicializar mais de uma vez', () => {
    // Reset das chamadas aos construtores
    (UISystem as jest.Mock).mockClear();
    (GameUI as jest.Mock).mockClear();
    
    // Tentar inicializar novamente
    const newContainer = new PIXI.Container();
    uiCoordinator.initialize(1024, 768, newContainer);
    
    // Verificar que não foi chamado novamente
    expect(UISystem).not.toHaveBeenCalled();
    expect(GameUI).not.toHaveBeenCalled();
  });
  
  test('updatePlayerTurn deve atualizar o turno do jogador e emitir evento', () => {
    // Acessar a instância real do GameUI dentro do UICoordinator
    const gameUI = (uiCoordinator as any).gameUI;
    
    // Spy no método updatePlayerTurn do GameUI
    const updatePlayerTurnSpy = jest.spyOn(gameUI, 'updatePlayerTurn');
    
    uiCoordinator.updatePlayerTurn(1);
    
    // Verificar chamada ao GameUI
    expect(updatePlayerTurnSpy).toHaveBeenCalledWith(1);
    
    // Verificar emissão de evento
    expect(emitSpy).toHaveBeenCalledWith(UIEventType.UI_ELEMENT_UPDATED, {
      element: 'player_turn',
      playerIndex: 1
    });
  });
  
  test('updateWindIndicator deve atualizar o indicador de vento e emitir evento', () => {
    // Acessar a instância real do GameUI
    const gameUI = (uiCoordinator as any).gameUI;
    
    // Spy no método
    const updateWindIndicatorSpy = jest.spyOn(gameUI, 'updateWindIndicator');
    
    const windValue = 5.5;
    uiCoordinator.updateWindIndicator(windValue);
    
    // Verificar chamada ao GameUI
    expect(updateWindIndicatorSpy).toHaveBeenCalledWith(windValue);
    
    // Verificar emissão de evento
    expect(emitSpy).toHaveBeenCalledWith(UIEventType.UI_ELEMENT_UPDATED, {
      element: 'wind_indicator',
      wind: windValue
    });
  });
  
  test('setEndTurnButtonVisible deve definir a visibilidade do botão e emitir evento', () => {
    // Acessar a instância real do GameUI
    const gameUI = (uiCoordinator as any).gameUI;
    
    // Spy no método
    const setEndTurnButtonVisibleSpy = jest.spyOn(gameUI, 'setEndTurnButtonVisible');
    
    uiCoordinator.setEndTurnButtonVisible(true);
    
    // Verificar chamada ao GameUI
    expect(setEndTurnButtonVisibleSpy).toHaveBeenCalledWith(true);
    
    // Verificar emissão de evento
    expect(emitSpy).toHaveBeenCalledWith(UIEventType.UI_ELEMENT_UPDATED, {
      element: 'end_turn_button',
      visible: true
    });
  });
  
  test('setEndTurnCallback deve configurar o callback e garantir que o evento seja emitido ao clicar', () => {
    // Mock para o callback
    const mockCallback = jest.fn();
    
    // Configurar o callback
    uiCoordinator.setEndTurnCallback(mockCallback);
    
    // Não temos acesso direto ao callback configurado, mas podemos verificar o método do GameUI
    const gameUI = (uiCoordinator as any).gameUI;
    expect(gameUI.setEndTurnCallback).toHaveBeenCalled();
    
    // Simular a execução do callback que seria chamado quando o botão é clicado
    // Isso é feito diretamente executando a implementação do método no UICoordinator
    const callbackGiven = gameUI.setEndTurnCallback.mock.calls[0][0];
    
    // Executar o callback
    callbackGiven();
    
    // Verificar que tanto o callback original foi chamado quanto o evento foi emitido
    expect(mockCallback).toHaveBeenCalled();
    expect(emitSpy).toHaveBeenCalledWith(UIEventType.BUTTON_CLICKED, {
      button: 'end_turn_button'
    });
  });
  
  test('showGameOver deve mostrar a tela de game over e emitir evento', () => {
    // Mock para o callback de reinício
    const mockRestartCallback = jest.fn();
    const winnerIndex = 0;
    
    uiCoordinator.showGameOver(winnerIndex, mockRestartCallback);
    
    // Verificar chamada ao GameUI
    const gameUI = (uiCoordinator as any).gameUI;
    expect(gameUI.showGameOver).toHaveBeenCalledWith(winnerIndex, expect.any(Function));
    
    // Executar o callback passado para showGameOver
    const callbackGiven = gameUI.showGameOver.mock.calls[0][1];
    callbackGiven();
    
    // Verificar que tanto o callback original foi chamado quanto o evento foi emitido
    expect(mockRestartCallback).toHaveBeenCalled();
    expect(emitSpy).toHaveBeenCalledWith(UIEventType.BUTTON_CLICKED, {
      button: 'restart_button'
    });
    expect(emitSpy).toHaveBeenCalledWith(UIEventType.UI_ELEMENT_CREATED, {
      element: 'game_over_screen',
      winnerIndex
    });
  });
  
  test('hideGameOver deve esconder a tela de game over e emitir evento', () => {
    // Acessar a instância real do GameUI
    const gameUI = (uiCoordinator as any).gameUI;
    
    // Spy no método
    const hideGameOverSpy = jest.spyOn(gameUI, 'hideGameOver');
    
    uiCoordinator.hideGameOver();
    
    // Verificar chamada ao GameUI
    expect(hideGameOverSpy).toHaveBeenCalled();
    
    // Verificar emissão de evento
    expect(emitSpy).toHaveBeenCalledWith(UIEventType.UI_ELEMENT_REMOVED, {
      element: 'game_over_screen'
    });
  });
  
  test('showFloatingText deve mostrar um texto flutuante e emitir evento', () => {
    // Acessar a instância real do GameUI
    const gameUI = (uiCoordinator as any).gameUI;
    
    // Spy no método
    const showFloatingTextSpy = jest.spyOn(gameUI, 'showFloatingText');
    
    const text = 'Dano: 25';
    const x = 100;
    const y = 200;
    const color = 0xFF0000;
    
    uiCoordinator.showFloatingText(text, x, y, color);
    
    // Verificar chamada ao GameUI
    expect(showFloatingTextSpy).toHaveBeenCalledWith(text, x, y, color);
    
    // Verificar emissão de evento
    expect(emitSpy).toHaveBeenCalledWith(UIEventType.UI_ELEMENT_CREATED, {
      element: 'floating_text',
      text,
      position: { x, y },
      color
    });
  });
  
  test('on deve registrar um callback para um evento', () => {
    const mockCallback = jest.fn();
    
    uiCoordinator.on(UIEventType.BUTTON_CLICKED, mockCallback);
    
    expect(onSpy).toHaveBeenCalledWith(UIEventType.BUTTON_CLICKED, mockCallback);
  });
  
  test('off deve remover um callback para um evento', () => {
    const mockCallback = jest.fn();
    
    uiCoordinator.off(UIEventType.BUTTON_CLICKED, mockCallback);
    
    expect(offSpy).toHaveBeenCalledWith(UIEventType.BUTTON_CLICKED, mockCallback);
  });
  
  test('update deve atualizar o sistema de UI', () => {
    // Acessar a instância real do UISystem
    const uiSystem = (uiCoordinator as any).uiSystem;
    
    // Spy no método
    const updateSpy = jest.spyOn(uiSystem, 'update');
    
    const delta = 0.16;
    uiCoordinator.update(delta);
    
    expect(updateSpy).toHaveBeenCalledWith(delta);
  });
  
  test('dispose deve limpar recursos e resetar o estado', () => {
    // Acessar a instância real do UISystem
    const uiSystem = (uiCoordinator as any).uiSystem;
    
    // Spy no método
    const clearSpy = jest.spyOn(uiSystem, 'clear');
    
    uiCoordinator.dispose();
    
    // Verificar chamadas
    expect(clearSpy).toHaveBeenCalled();
    expect(removeAllListenersSpy).toHaveBeenCalled();
    
    // Verificar estado
    expect((uiCoordinator as any).initialized).toBe(false);
  });
  
  test('métodos não devem fazer nada se o coordenador não estiver inicializado', () => {
    // Criar uma nova instância não inicializada
    const uninitializedCoordinator = new UICoordinator();
    
    // Spy no console para warning
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    
    // Chamar métodos
    uninitializedCoordinator.updatePlayerTurn(1);
    uninitializedCoordinator.updateWindIndicator(5);
    uninitializedCoordinator.setEndTurnButtonVisible(true);
    uninitializedCoordinator.setEndTurnCallback(() => {});
    uninitializedCoordinator.showGameOver(0, () => {});
    uninitializedCoordinator.hideGameOver();
    uninitializedCoordinator.showFloatingText('text', 0, 0, 0);
    uninitializedCoordinator.update(0.16);
    uninitializedCoordinator.dispose();
    
    // Verificar warning
    expect(warnSpy).toHaveBeenCalledWith('UICoordinator não foi inicializado');
    
    // Restaurar mock
    warnSpy.mockRestore();
  });
}); 