import { Game } from './core/game';

// Função principal para iniciar o jogo
function init() {
  const game = new Game();
  game.init();
}

// Inicializa o jogo quando o DOM estiver carregado
window.addEventListener('DOMContentLoaded', init); 