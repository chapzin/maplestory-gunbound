/**
 * Tipos de efeitos sonoros disponíveis
 */
export enum SoundEffect {
  SHOT = 'shot',
  EXPLOSION = 'explosion',
  DAMAGE = 'damage',
  BUTTON_CLICK = 'buttonClick',
  TURN_START = 'turnStart',
  TURN_END = 'turnEnd',
  GAME_OVER = 'gameOver',
  GAME_START = 'gameStart'
}

/**
 * Tipos de música de fundo disponíveis
 */
export enum BackgroundMusic {
  MAIN_THEME = 'mainTheme',
  BATTLE = 'battle',
  GAME_OVER = 'gameOver',
  VICTORY = 'victory'
}

/**
 * Interface para um recurso de áudio carregado
 */
interface AudioResource {
  buffer: AudioBuffer;
  volume: number;
  loop: boolean;
}

/**
 * Interface para uma instância de áudio em reprodução
 */
interface AudioInstance {
  source: AudioBufferSourceNode;
  gainNode: GainNode;
  startTime: number;
  isPlaying: boolean;
  loop: boolean;
}

/**
 * Classe responsável por gerenciar áudio do jogo usando a API Web Audio
 */
export class AudioManager {
  private context: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private soundGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  
  private sounds: Map<SoundEffect, AudioResource> = new Map();
  private music: Map<BackgroundMusic, AudioResource> = new Map();
  private currentMusic: AudioInstance | null = null;
  private currentMusicType: BackgroundMusic | null = null;
  
  private soundEnabled: boolean = true;
  private musicEnabled: boolean = true;
  private soundVolume: number = 1.0;
  private musicVolume: number = 0.5;
  private initialized: boolean = false;
  
  /**
   * Cria uma nova instância do gerenciador de áudio
   */
  constructor() {
    // O construtor é vazio pois a inicialização é adiada
  }
  
  /**
   * Carrega e inicializa os recursos de áudio
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }
    
    try {
      // Cria o contexto de áudio
      this.context = new AudioContext();
      
      // Configura os nós de ganho para controle de volume
      this.masterGain = this.context.createGain();
      this.soundGain = this.context.createGain();
      this.musicGain = this.context.createGain();
      
      // Configura a hierarquia dos nós
      this.soundGain.connect(this.masterGain);
      this.musicGain.connect(this.masterGain);
      this.masterGain.connect(this.context.destination);
      
      // Configura os volumes iniciais
      this.soundGain.gain.value = this.soundVolume;
      this.musicGain.gain.value = this.musicVolume;
      
      // Registra os efeitos sonoros e músicas
      await this.loadSoundEffects();
      await this.loadBackgroundMusic();
      
      this.initialized = true;
      console.log('AudioManager inicializado com sucesso');
    } catch (error) {
      console.error('Erro ao inicializar AudioManager:', error);
    }
  }
  
  /**
   * Carrega os efeitos sonoros
   */
  private async loadSoundEffects(): Promise<void> {
    // Em uma implementação real, carregaria os arquivos reais
    const soundEffects: [SoundEffect, string][] = [
      [SoundEffect.SHOT, 'assets/sounds/shot.mp3'],
      [SoundEffect.EXPLOSION, 'assets/sounds/explosion.mp3'],
      [SoundEffect.DAMAGE, 'assets/sounds/damage.mp3'],
      [SoundEffect.BUTTON_CLICK, 'assets/sounds/click.mp3'],
      [SoundEffect.TURN_START, 'assets/sounds/turn_start.mp3'],
      [SoundEffect.TURN_END, 'assets/sounds/turn_end.mp3'],
      [SoundEffect.GAME_OVER, 'assets/sounds/game_over.mp3'],
      [SoundEffect.GAME_START, 'assets/sounds/game_start.mp3']
    ];
    
    // Carrega cada efeito sonoro
    for (const [effect, url] of soundEffects) {
      try {
        if (this.context) {
          // Cria um buffer vazio para testes
          // Em um projeto real, carregaria o arquivo usando fetch
          const buffer = this.context.createBuffer(2, this.context.sampleRate * 0.5, this.context.sampleRate);
          
          this.sounds.set(effect, {
            buffer,
            volume: 1.0,
            loop: false
          });
        }
      } catch (error) {
        console.error(`Erro ao carregar efeito sonoro ${effect}:`, error);
      }
    }
  }
  
  /**
   * Carrega as músicas de fundo
   */
  private async loadBackgroundMusic(): Promise<void> {
    // Em uma implementação real, carregaria os arquivos reais
    const backgroundMusic: [BackgroundMusic, string, boolean][] = [
      [BackgroundMusic.MAIN_THEME, 'assets/music/main_theme.mp3', true],
      [BackgroundMusic.BATTLE, 'assets/music/battle.mp3', true],
      [BackgroundMusic.GAME_OVER, 'assets/music/game_over.mp3', false],
      [BackgroundMusic.VICTORY, 'assets/music/victory.mp3', false]
    ];
    
    // Carrega cada música
    for (const [music, url, loop] of backgroundMusic) {
      try {
        if (this.context) {
          // Cria um buffer vazio para testes
          // Em um projeto real, carregaria o arquivo usando fetch
          const buffer = this.context.createBuffer(2, this.context.sampleRate * 5, this.context.sampleRate);
          
          this.music.set(music, {
            buffer,
            volume: 1.0,
            loop
          });
        }
      } catch (error) {
        console.error(`Erro ao carregar música ${music}:`, error);
      }
    }
  }
  
  /**
   * Cria uma nova instância de áudio
   * @param buffer Buffer de áudio
   * @param volume Volume (0 a 1)
   * @param loop Se o áudio deve ser repetido
   * @param gainNode Nó de ganho para conectar
   * @returns Instância de áudio criada
   */
  private createAudioInstance(
    buffer: AudioBuffer,
    volume: number,
    loop: boolean,
    gainNode: GainNode
  ): AudioInstance | null {
    if (!this.context) {
      return null;
    }
    
    // Cria a fonte de áudio
    const source = this.context.createBufferSource();
    source.buffer = buffer;
    source.loop = loop;
    
    // Cria um nó de ganho para controlar o volume específico
    const instanceGain = this.context.createGain();
    instanceGain.gain.value = volume;
    
    // Conecta a fonte ao ganho e o ganho ao nó de saída
    source.connect(instanceGain);
    instanceGain.connect(gainNode);
    
    return {
      source,
      gainNode: instanceGain,
      startTime: this.context.currentTime,
      isPlaying: false,
      loop
    };
  }
  
  /**
   * Reproduz um efeito sonoro
   * @param effect Efeito sonoro a reproduzir
   * @param volume Volume opcional (de 0 a 1)
   */
  playSound(effect: SoundEffect, volume?: number): void {
    if (!this.initialized || !this.soundEnabled || !this.context || !this.soundGain) {
      return;
    }
    
    const sound = this.sounds.get(effect);
    if (sound) {
      const vol = volume !== undefined ? volume : 1.0;
      
      const instance = this.createAudioInstance(
        sound.buffer,
        vol,
        sound.loop,
        this.soundGain
      );
      
      if (instance) {
        instance.isPlaying = true;
        instance.source.start();
        
        // Adiciona um listener para quando o som terminar
        instance.source.onended = () => {
          instance.isPlaying = false;
        };
      }
    } else {
      console.warn(`Efeito sonoro ${effect} não encontrado`);
    }
  }
  
  /**
   * Reproduz uma música de fundo
   * @param music Música a reproduzir
   * @param fadeIn Duração do fade in em segundos
   */
  playMusic(music: BackgroundMusic, fadeIn: number = 1): void {
    if (!this.initialized || !this.musicEnabled || !this.context || !this.musicGain) {
      return;
    }
    
    // Se já estiver tocando a mesma música, não faz nada
    if (this.currentMusicType === music && this.currentMusic?.isPlaying) {
      return;
    }
    
    // Para a música atual se houver
    this.stopCurrentMusic(0.5);
    
    // Encontra a música no mapa
    const musicResource = this.music.get(music);
    if (!musicResource) {
      console.warn(`Música ${music} não encontrada`);
      return;
    }
    
    // Cria uma nova instância
    const instance = this.createAudioInstance(
      musicResource.buffer,
      0, // Começa com volume 0 para fade in
      musicResource.loop,
      this.musicGain
    );
    
    if (!instance) {
      return;
    }
    
    // Inicia a reprodução
    instance.isPlaying = true;
    instance.source.start();
    
    // Aplica o fade in
    if (fadeIn > 0 && this.context) {
      instance.gainNode.gain.setValueAtTime(0, this.context.currentTime);
      instance.gainNode.gain.linearRampToValueAtTime(
        1.0,
        this.context.currentTime + fadeIn
      );
    } else {
      instance.gainNode.gain.value = 1.0;
    }
    
    // Armazena a música atual
    this.currentMusic = instance;
    this.currentMusicType = music;
    
    // Adiciona um listener para quando a música terminar (se não for em loop)
    instance.source.onended = () => {
      if (this.currentMusic === instance) {
        this.currentMusic.isPlaying = false;
        this.currentMusic = null;
        this.currentMusicType = null;
      }
    };
  }
  
  /**
   * Para a música atualmente em execução
   * @param fadeOut Duração do fade out em segundos
   */
  stopCurrentMusic(fadeOut: number = 1): void {
    if (!this.currentMusic || !this.context) {
      return;
    }
    
    const instance = this.currentMusic;
    
    // Aplica o fade out
    if (fadeOut > 0) {
      const currentVolume = instance.gainNode.gain.value;
      instance.gainNode.gain.setValueAtTime(currentVolume, this.context.currentTime);
      instance.gainNode.gain.linearRampToValueAtTime(
        0,
        this.context.currentTime + fadeOut
      );
      
      // Agenda o fim da reprodução após o fade out
      setTimeout(() => {
        if (instance.isPlaying) {
          instance.source.stop();
          instance.isPlaying = false;
        }
      }, fadeOut * 1000);
    } else {
      // Para imediatamente
      if (instance.isPlaying) {
        instance.source.stop();
        instance.isPlaying = false;
      }
    }
    
    this.currentMusic = null;
    this.currentMusicType = null;
  }
  
  /**
   * Pausa toda a reprodução de áudio
   */
  pause(): void {
    if (this.context && this.context.state === 'running') {
      this.context.suspend();
    }
  }
  
  /**
   * Continua toda a reprodução de áudio
   */
  resume(): void {
    if (this.context && this.context.state === 'suspended') {
      this.context.resume();
    }
  }
  
  /**
   * Define se os efeitos sonoros estão habilitados
   * @param enabled Estado de habilitação dos efeitos
   */
  setSoundEnabled(enabled: boolean): void {
    this.soundEnabled = enabled;
    
    // Atualiza o ganho dos efeitos sonoros
    if (this.soundGain) {
      this.soundGain.gain.value = enabled ? this.soundVolume : 0;
    }
  }
  
  /**
   * Define se a música está habilitada
   * @param enabled Estado de habilitação da música
   */
  setMusicEnabled(enabled: boolean): void {
    this.musicEnabled = enabled;
    
    // Atualiza o ganho da música
    if (this.musicGain) {
      this.musicGain.gain.value = enabled ? this.musicVolume : 0;
    }
    
    // Para a música completamente se desabilitada
    if (!enabled && this.currentMusic) {
      this.stopCurrentMusic(0.3);
    }
  }
  
  /**
   * Define o volume dos efeitos sonoros
   * @param volume Volume (0 a 1)
   */
  setSoundVolume(volume: number): void {
    this.soundVolume = Math.max(0, Math.min(1, volume));
    
    // Atualiza o ganho dos efeitos sonoros se estiverem habilitados
    if (this.soundGain && this.soundEnabled) {
      this.soundGain.gain.value = this.soundVolume;
    }
  }
  
  /**
   * Define o volume da música
   * @param volume Volume (0 a 1)
   */
  setMusicVolume(volume: number): void {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    
    // Atualiza o ganho da música se estiver habilitada
    if (this.musicGain && this.musicEnabled) {
      this.musicGain.gain.value = this.musicVolume;
    }
  }
  
  /**
   * Libera recursos e para todas as reproduções
   */
  dispose(): void {
    // Para a música atual
    this.stopCurrentMusic(0);
    
    // Limpa os estados
    this.currentMusic = null;
    this.currentMusicType = null;
    
    // Fecha o contexto de áudio
    if (this.context) {
      this.context.close();
      this.context = null;
    }
    
    this.masterGain = null;
    this.soundGain = null;
    this.musicGain = null;
    
    this.sounds.clear();
    this.music.clear();
    
    this.initialized = false;
  }
} 