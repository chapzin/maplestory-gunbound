import * as PIXI from 'pixi.js';
import { UISystem, TextElement, ButtonElement, ProgressBarElement } from '../core/ui';
import { CONFIG } from '../core/config';

/**
 * Classe responsável por gerenciar a UI específica do jogo
 */
export class GameUI {
  private uiSystem: UISystem;
  private screenWidth: number;
  private screenHeight: number;
  private overlay: PIXI.Graphics | null = null;

  /**
   * Inicializa a UI do jogo
   * @param uiSystem Sistema de UI base
   * @param screenWidth Largura da tela
   * @param screenHeight Altura da tela
   */
  constructor(uiSystem: UISystem, screenWidth: number, screenHeight: number) {
    this.uiSystem = uiSystem;
    this.screenWidth = screenWidth;
    this.screenHeight = screenHeight;
    
    // Inicializa a UI básica
    this.setupBaseUI();
  }

  /**
   * Configura os elementos básicos da UI
   */
  private setupBaseUI(): void {
    // Cria o indicador de vento
    this.uiSystem.addElement(new TextElement(
      'windIndicator',
      'Vento: 0',
      {
        fontFamily: 'Arial',
        fontSize: 16,
        fill: 0xFFFFFF
      },
      10,
      10
    ));
    
    // Cria o texto de jogador atual
    this.uiSystem.addElement(new TextElement(
      'playerTurn',
      'Turno: Jogador 1',
      {
        fontFamily: 'Arial',
        fontSize: 16,
        fill: 0xFFFFFF
      },
      this.screenWidth - 150,
      10
    ));
    
    // Cria o botão de finalizar turno (inicialmente oculto)
    const endTurnButton = new ButtonElement(
      'endTurnButton',
      'Finalizar Turno',
      this.screenWidth - 120,
      40,
      100,
      30,
      () => {} // O callback será definido externamente
    );
    endTurnButton.setVisible(false);
    this.uiSystem.addElement(endTurnButton);
  }

  /**
   * Atualiza o indicador de vento
   * @param wind Valor do vento
   */
  updateWindIndicator(wind: number): void {
    // Normaliza o vento para uma escala de -5 a 5
    const normalizedWind = Math.floor(wind / ((CONFIG.PHYSICS.WIND_MAX - CONFIG.PHYSICS.WIND_MIN) / 10)) - 5;
    
    // Cria uma representação visual
    let windText = 'Vento: ';
    
    if (normalizedWind > 0) {
      windText += '→'.repeat(normalizedWind);
    } else if (normalizedWind < 0) {
      windText += '←'.repeat(Math.abs(normalizedWind));
    } else {
      windText += '0';
    }
    
    // Atualiza o texto na UI
    const windIndicator = this.uiSystem.getElement<TextElement>('windIndicator');
    if (windIndicator) {
      windIndicator.setText(windText);
    }
  }

  /**
   * Atualiza o texto do turno do jogador
   * @param playerIndex Índice do jogador atual
   */
  updatePlayerTurn(playerIndex: number): void {
    const playerTurnText = this.uiSystem.getElement<TextElement>('playerTurn');
    if (playerTurnText) {
      playerTurnText.setText(`Turno: Jogador ${playerIndex + 1}`);
    }
  }

  /**
   * Define o callback do botão de finalizar turno
   * @param callback Função a ser chamada quando o botão for clicado
   */
  setEndTurnCallback(callback: () => void): void {
    const endTurnButton = this.uiSystem.getElement<ButtonElement>('endTurnButton');
    if (endTurnButton) {
      // Substitui o elemento atual por um novo com o mesmo ID mas callback diferente
      const position = endTurnButton.displayObject.position;
      const visible = endTurnButton.visible;
      
      this.uiSystem.removeElement('endTurnButton');
      
      const newButton = new ButtonElement(
        'endTurnButton',
        'Finalizar Turno',
        position.x,
        position.y,
        100,
        30,
        callback
      );
      newButton.setVisible(visible);
      this.uiSystem.addElement(newButton);
    }
  }

  /**
   * Mostra ou esconde o botão de finalizar turno
   * @param visible Visibilidade desejada
   */
  setEndTurnButtonVisible(visible: boolean): void {
    const endTurnButton = this.uiSystem.getElement<ButtonElement>('endTurnButton');
    if (endTurnButton) {
      endTurnButton.setVisible(visible);
    }
  }

  /**
   * Exibe a tela de fim de jogo
   * @param winnerIndex Índice do jogador vencedor
   * @param onRestart Callback para reiniciar o jogo
   */
  showGameOver(winnerIndex: number, onRestart: () => void): void {
    // Cria um painel semi-transparente
    this.overlay = new PIXI.Graphics();
    this.overlay.beginFill(0x000000, 0.7);
    this.overlay.drawRect(0, 0, this.screenWidth, this.screenHeight);
    this.overlay.endFill();
    
    // Agora podemos acessar o container diretamente já que é público
    this.uiSystem.container.addChildAt(this.overlay, 0);
    
    // Cria texto de Game Over
    const gameOverText = new TextElement(
      'gameOverText',
      `GAME OVER\nJogador ${winnerIndex + 1} VENCEU!`,
      {
        fontFamily: 'Arial',
        fontSize: 36,
        fill: 0xFFFFFF,
        align: 'center',
        fontWeight: 'bold'
      },
      this.screenWidth / 2,
      this.screenHeight / 2 - 50
    );
    
    // Centraliza o texto
    const textObj = gameOverText.displayObject as PIXI.Text;
    textObj.anchor.set(0.5);
    
    this.uiSystem.addElement(gameOverText);
    
    // Cria botão para reiniciar
    const restartButton = new ButtonElement(
      'restartButton',
      'Reiniciar Jogo',
      this.screenWidth / 2 - 75,
      this.screenHeight / 2 + 50,
      150,
      40,
      onRestart
    );
    
    this.uiSystem.addElement(restartButton);
  }

  /**
   * Remove a tela de game over
   */
  hideGameOver(): void {
    // Remove elementos da UI de Game Over
    this.uiSystem.removeElement('gameOverText');
    this.uiSystem.removeElement('restartButton');
    
    // Remove o overlay
    if (this.overlay) {
      this.uiSystem.container.removeChild(this.overlay);
      this.overlay = null;
    }
  }

  /**
   * Exibe um texto flutuante que desaparece gradualmente
   * @param text Texto a exibir
   * @param x Posição X
   * @param y Posição Y
   * @param color Cor do texto
   * @param duration Duração em segundos
   */
  showFloatingText(text: string, x: number, y: number, color: number = 0xFFFFFF, duration: number = 2): void {
    // Cria um ID único baseado na posição e texto
    const id = `floating_${x}_${y}_${Date.now()}`;
    
    // Cria o elemento de texto
    const textElement = new TextElement(
      id,
      text,
      {
        fontFamily: 'Arial',
        fontSize: 24,
        fill: color,
        fontWeight: 'bold'
      },
      x,
      y
    );
    
    // Centraliza o texto
    const textObj = textElement.displayObject as PIXI.Text;
    textObj.anchor.set(0.5);
    
    this.uiSystem.addElement(textElement);
    
    // Animação de desaparecimento
    let timePassed = 0;
    
    const originalUpdate = textElement.update;
    
    // Sobrescreve o método update para adicionar a animação
    textElement.update = (delta: number, ...args: any[]): void => {
      // Chama o método original
      originalUpdate.call(textElement, delta, ...args);
      
      timePassed += delta;
      
      // Move o texto para cima lentamente
      textObj.y -= 0.5;
      
      // Fade out gradual
      textObj.alpha = 1 - (timePassed / (duration * 60));
      
      // Remove o texto quando completamente transparente
      if (textObj.alpha <= 0) {
        this.uiSystem.removeElement(id);
      }
    };
  }

  /**
   * Limpa todos os elementos da UI específica do jogo
   */
  clear(): void {
    // Remove overlay se existir
    if (this.overlay) {
      this.uiSystem.container.removeChild(this.overlay);
      this.overlay = null;
    }
    
    // Lista de IDs de elementos básicos para manter
    const baseElementIds = ['windIndicator', 'playerTurn', 'endTurnButton'];
    
    // Obtém todos os IDs de elementos
    const allElements = this.uiSystem.getElementIds();
    
    // Remove todos os elementos exceto os básicos
    for (const id of allElements) {
      if (!baseElementIds.includes(id)) {
        this.uiSystem.removeElement(id);
      }
    }
  }
} 