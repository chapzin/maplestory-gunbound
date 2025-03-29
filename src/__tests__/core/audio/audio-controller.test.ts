import { AudioController, AudioEventType, IAudioController } from '../../../core/audio/audio-controller';
import { AudioManager, SoundEffect, BackgroundMusic } from '../../../core/audio-manager';

// Mock do AudioManager
jest.mock('../../../core/audio-manager', () => {
  return {
    AudioManager: jest.fn().mockImplementation(() => {
      return {
        initialize: jest.fn().mockResolvedValue(undefined),
        playSound: jest.fn(),
        playMusic: jest.fn(),
        pause: jest.fn(),
        resume: jest.fn(),
        dispose: jest.fn()
      };
    }),
    SoundEffect: {
      SHOT: 'shot',
      EXPLOSION: 'explosion',
      DAMAGE: 'damage',
      BUTTON_CLICK: 'buttonClick',
      TURN_START: 'turnStart',
      TURN_END: 'turnEnd',
      GAME_OVER: 'gameOver',
      GAME_START: 'gameStart'
    },
    BackgroundMusic: {
      MAIN_THEME: 'mainTheme',
      BATTLE: 'battle',
      GAME_OVER: 'gameOver',
      VICTORY: 'victory'
    }
  };
});

describe('AudioController', () => {
  let audioController: AudioController;
  
  beforeEach(() => {
    // Limpa todos os mocks antes de cada teste
    jest.clearAllMocks();
    audioController = new AudioController();
  });
  
  test('deve inicializar corretamente', async () => {
    await audioController.initialize();
    expect(audioController['audioManager'].initialize).toHaveBeenCalled();
    expect(audioController['initialized']).toBe(true);
  });
  
  test('não deve inicializar mais de uma vez', async () => {
    await audioController.initialize();
    await audioController.initialize();
    expect(audioController['audioManager'].initialize).toHaveBeenCalledTimes(1);
  });
  
  test('deve propagar erro se inicialização falhar', async () => {
    const mockError = new Error('Erro de inicialização');
    const mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    (AudioManager as jest.Mock).mockImplementationOnce(() => {
      return {
        initialize: jest.fn().mockRejectedValue(mockError)
      };
    });
    
    audioController = new AudioController();
    await expect(audioController.initialize()).rejects.toThrow(mockError);
    expect(audioController['initialized']).toBe(false);
    
    mockConsoleError.mockRestore();
  });
  
  test('deve reproduzir som com volume correto', async () => {
    await audioController.initialize();
    audioController.playSound(SoundEffect.SHOT, 0.5);
    expect(audioController['audioManager'].playSound).toHaveBeenCalledWith(SoundEffect.SHOT, 0.5);
  });
  
  test('deve usar volume padrão se não for especificado', async () => {
    await audioController.initialize();
    audioController.playSound(SoundEffect.EXPLOSION);
    expect(audioController['audioManager'].playSound).toHaveBeenCalledWith(SoundEffect.EXPLOSION, 1);
  });
  
  test('não deve reproduzir som se não estiver inicializado', () => {
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    audioController.playSound(SoundEffect.SHOT);
    expect(consoleSpy).toHaveBeenCalled();
    // O audioManager ainda não foi criado neste ponto
    expect(audioController['audioManager']).toBeUndefined();
    consoleSpy.mockRestore();
  });
  
  test('deve emitir evento quando reproduzir som', async () => {
    await audioController.initialize();
    const mockCallback = jest.fn();
    audioController.on(AudioEventType.SOUND_PLAYED, mockCallback);
    audioController.playSound(SoundEffect.SHOT, 0.7);
    expect(mockCallback).toHaveBeenCalledWith({ sound: SoundEffect.SHOT, volume: 0.7 });
  });
  
  test('deve reproduzir música com tempo de fade correto', async () => {
    await audioController.initialize();
    audioController.playMusic(BackgroundMusic.MAIN_THEME, 3);
    expect(audioController['audioManager'].playMusic).toHaveBeenCalledWith(BackgroundMusic.MAIN_THEME, 3);
  });
  
  test('deve usar tempo de fade padrão se não for especificado', async () => {
    await audioController.initialize();
    audioController.playMusic(BackgroundMusic.BATTLE);
    expect(audioController['audioManager'].playMusic).toHaveBeenCalledWith(BackgroundMusic.BATTLE, 2);
  });
  
  test('não deve reproduzir música se não estiver inicializado', () => {
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    audioController.playMusic(BackgroundMusic.MAIN_THEME);
    expect(consoleSpy).toHaveBeenCalled();
    // O audioManager ainda não foi criado neste ponto
    expect(audioController['audioManager']).toBeUndefined();
    consoleSpy.mockRestore();
  });
  
  test('deve emitir evento quando reproduzir música', async () => {
    await audioController.initialize();
    const mockCallback = jest.fn();
    audioController.on(AudioEventType.MUSIC_STARTED, mockCallback);
    audioController.playMusic(BackgroundMusic.MAIN_THEME, 3);
    expect(mockCallback).toHaveBeenCalledWith({ music: BackgroundMusic.MAIN_THEME, fadeTime: 3 });
  });
  
  test('deve pausar a reprodução de áudio', async () => {
    await audioController.initialize();
    audioController.pause();
    expect(audioController['audioManager'].pause).toHaveBeenCalled();
  });
  
  test('deve emitir evento quando pausar', async () => {
    await audioController.initialize();
    const mockCallback = jest.fn();
    audioController.on(AudioEventType.AUDIO_PAUSED, mockCallback);
    audioController.pause();
    expect(mockCallback).toHaveBeenCalled();
  });
  
  test('não deve pausar se não estiver inicializado', () => {
    audioController.pause();
    // O audioManager ainda não foi criado neste ponto
    expect(audioController['audioManager']).toBeUndefined();
  });
  
  test('deve retomar a reprodução de áudio', async () => {
    await audioController.initialize();
    audioController.resume();
    expect(audioController['audioManager'].resume).toHaveBeenCalled();
  });
  
  test('deve emitir evento quando retomar', async () => {
    await audioController.initialize();
    const mockCallback = jest.fn();
    audioController.on(AudioEventType.AUDIO_RESUMED, mockCallback);
    audioController.resume();
    expect(mockCallback).toHaveBeenCalled();
  });
  
  test('não deve retomar se não estiver inicializado', () => {
    audioController.resume();
    // O audioManager ainda não foi criado neste ponto
    expect(audioController['audioManager']).toBeUndefined();
  });
  
  test('deve liberar recursos ao fazer dispose', async () => {
    await audioController.initialize();
    audioController.dispose();
    expect(audioController['audioManager'].dispose).toHaveBeenCalled();
    expect(audioController['initialized']).toBe(false);
  });
  
  test('deve remover todos os listeners ao fazer dispose', async () => {
    await audioController.initialize();
    const mockCallback = jest.fn();
    audioController.on(AudioEventType.SOUND_PLAYED, mockCallback);
    audioController.dispose();
    audioController.playSound(SoundEffect.SHOT);
    expect(mockCallback).not.toHaveBeenCalled();
  });
  
  test('não deve fazer nada em dispose se não estiver inicializado', () => {
    audioController.dispose();
    // O audioManager ainda não foi criado neste ponto
    expect(audioController['audioManager']).toBeUndefined();
  });
}); 