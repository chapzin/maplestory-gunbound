/**
 * Configurações globais do jogo
 */
export const CONFIG = {
  // Configurações de tela
  SCREEN: {
    WIDTH: 800,
    HEIGHT: 600,
    BACKGROUND_COLOR: 0x87CEEB, // Azul céu
  },
  
  // Configurações de física
  PHYSICS: {
    GRAVITY: 0.5,
    WIND_MAX: 10,
    WIND_MIN: -10,
    WIND_STRENGTH: 1.0, // Multiplicador para a força do vento
  },
  
  // Configurações de jogo
  GAME: {
    MAX_PLAYERS: 8,
    TURN_TIME: 30, // segundos
    MAX_POWER: 100,
    MIN_POWER: 10,
    HEALTH_DEFAULT: 100,
  },
  
  // Configurações de debug
  DEBUG: {
    ENABLED: true,
    SHOW_FPS: true,
    LOG_LEVEL: 'debug', // 'debug', 'info', 'warn', 'error'
  },
  
  // Configurações de assets
  ASSETS: {
    BASE_PATH: 'assets/',
    SPRITES: {
      VEHICLES: 'images/vehicles/',
      TERRAIN: 'images/terrain/',
      EFFECTS: 'images/effects/',
      UI: 'images/ui/',
    },
    AUDIO: {
      SFX: 'audio/sfx/',
      MUSIC: 'audio/music/',
    },
  },
}; 