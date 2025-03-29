import { EventEmitter, EventCallback } from '../../utils/event-emitter';

describe('EventEmitter', () => {
  let eventEmitter: EventEmitter;
  
  beforeEach(() => {
    eventEmitter = new EventEmitter();
  });
  
  test('deve registrar e acionar callbacks', () => {
    const mockCallback = jest.fn();
    eventEmitter.on('test_event', mockCallback);
    eventEmitter.emit('test_event', { data: 'test' });
    expect(mockCallback).toHaveBeenCalledWith({ data: 'test' });
  });
  
  test('não deve acionar callbacks removidos', () => {
    const mockCallback = jest.fn();
    eventEmitter.on('test_event', mockCallback);
    eventEmitter.off('test_event', mockCallback);
    eventEmitter.emit('test_event', { data: 'test' });
    expect(mockCallback).not.toHaveBeenCalled();
  });
  
  test('deve acionar múltiplos callbacks para o mesmo evento', () => {
    const mockCallback1 = jest.fn();
    const mockCallback2 = jest.fn();
    eventEmitter.on('test_event', mockCallback1);
    eventEmitter.on('test_event', mockCallback2);
    eventEmitter.emit('test_event', { data: 'test' });
    expect(mockCallback1).toHaveBeenCalledWith({ data: 'test' });
    expect(mockCallback2).toHaveBeenCalledWith({ data: 'test' });
  });
  
  test('deve remover todos os listeners quando limpo', () => {
    const mockCallback = jest.fn();
    eventEmitter.on('test_event', mockCallback);
    eventEmitter.removeAllListeners();
    eventEmitter.emit('test_event', { data: 'test' });
    expect(mockCallback).not.toHaveBeenCalled();
  });
  
  test('deve remover apenas listeners do evento especificado', () => {
    const mockCallback1 = jest.fn();
    const mockCallback2 = jest.fn();
    eventEmitter.on('test_event1', mockCallback1);
    eventEmitter.on('test_event2', mockCallback2);
    eventEmitter.removeAllListeners('test_event1');
    
    eventEmitter.emit('test_event1', { data: 'test1' });
    eventEmitter.emit('test_event2', { data: 'test2' });
    
    expect(mockCallback1).not.toHaveBeenCalled();
    expect(mockCallback2).toHaveBeenCalledWith({ data: 'test2' });
  });
  
  test('método clear deve funcionar como alias para removeAllListeners', () => {
    const mockCallback = jest.fn();
    eventEmitter.on('test_event', mockCallback);
    eventEmitter.clear();
    eventEmitter.emit('test_event', { data: 'test' });
    expect(mockCallback).not.toHaveBeenCalled();
  });
  
  test('deve tratar erros de callback sem quebrar', () => {
    const mockCallback = jest.fn().mockImplementation(() => {
      throw new Error('Erro de teste');
    });
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    eventEmitter.on('test_event', mockCallback);
    // Não deve lançar exceção
    eventEmitter.emit('test_event');
    
    expect(mockCallback).toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalled();
    
    consoleSpy.mockRestore();
  });
  
  test('hasListeners deve retornar true quando há listeners para um evento', () => {
    const mockCallback = jest.fn();
    eventEmitter.on('test_event', mockCallback);
    expect(eventEmitter.hasListeners('test_event')).toBe(true);
  });
  
  test('hasListeners deve retornar false quando não há listeners para um evento', () => {
    expect(eventEmitter.hasListeners('test_event')).toBe(false);
  });
  
  test('hasListeners deve retornar false após remover todos os listeners', () => {
    const mockCallback = jest.fn();
    eventEmitter.on('test_event', mockCallback);
    eventEmitter.removeAllListeners('test_event');
    expect(eventEmitter.hasListeners('test_event')).toBe(false);
  });
}); 