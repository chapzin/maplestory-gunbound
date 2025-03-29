import { AudioManager, SoundEffect, BackgroundMusic } from '../audio-manager';
import { EventEmitter, EventCallback } from '../../utils/event-emitter';

/**
 * Tipos de eventos de áudio
 */
export enum AudioEventType {
  SOUND_PLAYED = 'sound_played',
  MUSIC_STARTED = 'music_started',
  AUDIO_PAUSED = 'audio_paused',
  AUDIO_RESUMED = 'audio_resumed'
}

/**
 * Interface para o controlador de áudio
 */
export interface IAudioController {
  /**
   * Inicializa o controlador de áudio
   */
  initialize(): Promise<void>;
  
  /**
   * Reproduz um efeito sonoro
   * @param sound Efeito sonoro a ser reproduzido
   * @param volume Volume opcional (padrão: 1)
   */
  playSound(sound: SoundEffect, volume?: number): void;
  
  /**
   * Reproduz uma música de fundo
   * @param music Música a ser reproduzida
   * @param fadeTime Tempo de fade (padrão: 2)
   */
  playMusic(music: BackgroundMusic, fadeTime?: number): void;
  
  /**
   * Pausa toda a reprodução de áudio
   */
  pause(): void;
  
  /**
   * Retoma a reprodução de áudio pausada
   */
  resume(): void;
  
  /**
   * Registra um callback para um tipo de evento de áudio
   * @param eventType Tipo do evento
   * @param callback Função de callback
   */
  on(eventType: AudioEventType, callback: EventCallback): void;
  
  /**
   * Remove um callback registrado para um tipo de evento de áudio
   * @param eventType Tipo do evento
   * @param callback Função de callback a ser removida
   */
  off(eventType: AudioEventType, callback: EventCallback): void;
  
  /**
   * Libera recursos do controlador de áudio
   */
  dispose(): void;
}

/**
 * Implementação do controlador de áudio
 */
export class AudioController implements IAudioController {
  private audioManager: AudioManager;
  private eventEmitter: EventEmitter = new EventEmitter();
  private initialized: boolean = false;
  
  /**
   * Inicializa o controlador de áudio
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;
    
    this.audioManager = new AudioManager();
    try {
      await this.audioManager.initialize();
      this.initialized = true;
    } catch (error) {
      console.error('Erro ao inicializar áudio:', error);
      throw error;
    }
  }
  
  /**
   * Reproduz um efeito sonoro
   * @param sound Efeito sonoro a ser reproduzido
   * @param volume Volume opcional (padrão: 1)
   */
  playSound(sound: SoundEffect, volume: number = 1): void {
    if (!this.initialized) {
      console.warn('AudioController não foi inicializado');
      return;
    }
    
    this.audioManager.playSound(sound, volume);
    this.eventEmitter.emit(AudioEventType.SOUND_PLAYED, { sound, volume });
  }
  
  /**
   * Reproduz uma música de fundo
   * @param music Música a ser reproduzida
   * @param fadeTime Tempo de fade (padrão: 2)
   */
  playMusic(music: BackgroundMusic, fadeTime: number = 2): void {
    if (!this.initialized) {
      console.warn('AudioController não foi inicializado');
      return;
    }
    
    this.audioManager.playMusic(music, fadeTime);
    this.eventEmitter.emit(AudioEventType.MUSIC_STARTED, { music, fadeTime });
  }
  
  /**
   * Pausa toda a reprodução de áudio
   */
  pause(): void {
    if (!this.initialized) return;
    
    this.audioManager.pause();
    this.eventEmitter.emit(AudioEventType.AUDIO_PAUSED, {});
  }
  
  /**
   * Retoma a reprodução de áudio pausada
   */
  resume(): void {
    if (!this.initialized) return;
    
    this.audioManager.resume();
    this.eventEmitter.emit(AudioEventType.AUDIO_RESUMED, {});
  }
  
  /**
   * Registra um callback para um tipo de evento de áudio
   * @param eventType Tipo do evento
   * @param callback Função de callback
   */
  on(eventType: AudioEventType, callback: EventCallback): void {
    this.eventEmitter.on(eventType, callback);
  }
  
  /**
   * Remove um callback registrado para um tipo de evento de áudio
   * @param eventType Tipo do evento
   * @param callback Função de callback a ser removida
   */
  off(eventType: AudioEventType, callback: EventCallback): void {
    this.eventEmitter.off(eventType, callback);
  }
  
  /**
   * Libera recursos do controlador de áudio
   */
  dispose(): void {
    if (!this.initialized) return;
    
    this.audioManager.dispose();
    this.eventEmitter.removeAllListeners();
    this.initialized = false;
  }
} 