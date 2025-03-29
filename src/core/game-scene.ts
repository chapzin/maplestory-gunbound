import * as PIXI from 'pixi.js';
import { Terrain } from '../systems/terrain';
import { Physics } from '../systems/physics';
import { VehicleManager } from '../entities/vehicle-manager';
import { TurnSystem } from '../systems/turn-system';
import { ProjectileManager } from '../systems/projectile-manager';
import { AimingSystem } from '../systems/aiming-system';
import { GameStateManager } from './game-state-manager';
import { AudioManager, BackgroundMusic } from './audio-manager';
import { BaseScene } from '../scenes/base-scene';

// Importando os novos componentes refatorados
import { GameRenderer, ContainerType, IGameRenderer } from './rendering/game-renderer';
import { InputHandler, IInputHandler } from './input/input-handler';
import { GameEventCoordinator, IGameEventCoordinator } from './events/game-event-coordinator';
import { GameLogicController, IGameLogicController } from './logic/game-logic-controller';
import { AudioController, IAudioController } from './audio/audio-controller';
import { UICoordinator, IUICoordinator } from './ui/ui-coordinator';
import { GameSystems } from './interfaces/game-systems';

/**
 * Interface para o sistema de log de erros
 */
interface ErrorLogEntry {
  component: string;
  message: string;
  error?: Error;
  timestamp: Date;
}

/**
 * Classe principal da cena do jogo, responsável por orquestrar
 * os diferentes componentes e sistemas do jogo
 */
export class GameScene extends BaseScene {
  // Componentes refatorados
  private renderer: IGameRenderer;
  private inputHandler: IInputHandler;
  private eventCoordinator: IGameEventCoordinator;
  private logicController: IGameLogicController;
  private audioController: IAudioController;
  private uiCoordinator: IUICoordinator;
  
  // Sistemas existentes que ainda são gerenciados pela GameScene
  private gameStateManager: GameStateManager;
  private physics: Physics;
  private terrain: Terrain;
  private vehicleManager: VehicleManager;
  private projectileManager: ProjectileManager;
  private aimingSystem: AimingSystem;
  private turnSystem: TurnSystem;
  
  // Sistema de log de erros
  private errorLog: ErrorLogEntry[] = [];
  private maxErrorLogSize: number = 50;
  
  /**
   * Inicializa uma nova cena de jogo
   * @param app Aplicação PIXI
   */
  constructor(app: PIXI.Application) {
    super(app);
    
    try {
      // Inicializar os componentes
      this.initializeComponents()
        .then(() => {
          // Inicializar os sistemas após componentes estarem prontos
          this.initializeSystems();
          
          // Iniciar o jogo
          this.startGame();
        })
        .catch(error => {
          this.logError('GameScene', 'Falha na inicialização dos componentes', error);
          console.error('Erro na inicialização dos componentes:', error);
        });
    } catch (error) {
      this.logError('GameScene', 'Erro fatal na inicialização da cena', error as Error);
      console.error('Erro fatal na inicialização da cena:', error);
    }
  }
  
  /**
   * Registra um erro no log de erros
   * @param component Componente que gerou o erro
   * @param message Mensagem descritiva do erro
   * @param error Objeto de erro (opcional)
   */
  private logError(component: string, message: string, error?: Error): void {
    // Adiciona o erro ao log
    this.errorLog.push({
      component,
      message,
      error,
      timestamp: new Date()
    });
    
    // Limita o tamanho do log
    if (this.errorLog.length > this.maxErrorLogSize) {
      this.errorLog.shift(); // Remove o erro mais antigo
    }
    
    // Aqui poderíamos implementar lógica adicional como:
    // - Enviar o erro para um serviço de telemetria
    // - Mostrar uma interface de erro para o usuário
    // - Pausar o jogo em caso de erros críticos
  }
  
  /**
   * Inicializa todos os componentes necessários
   */
  private async initializeComponents(): Promise<void> {
    try {
      // Criar o gerenciador de estado
      this.gameStateManager = new GameStateManager();
      
      // Criar e inicializar o renderer
      this.renderer = new GameRenderer();
      this.renderer.initialize(this.app);
      
      // Usar o container da classe base para o container principal do jogo
      // Isso garante compatibilidade com a implementação original do BaseScene
      const mainContainer = this.renderer.getContainer(ContainerType.MAIN);
      this.container.addChild(mainContainer);
      
      // Criar e inicializar o controlador de áudio
      this.audioController = new AudioController();
      await this.audioController.initialize();
      // Nota: Não reproduzimos a música aqui ainda, apenas após todos os sistemas estarem inicializados
      
      // Criar e inicializar o sistema de física
      this.physics = new Physics();
      
      // Criar e inicializar o sistema de terreno
      this.terrain = new Terrain(
        this.renderer.getContainer(ContainerType.TERRAIN),
        this.app.renderer
      );
      
      // Criar e inicializar o gerenciador de veículos
      this.vehicleManager = new VehicleManager(
        this.renderer.getContainer(ContainerType.VEHICLE),
        this.physics
      );
      
      // Criar e inicializar o gerenciador de projéteis
      this.projectileManager = new ProjectileManager(
        this.renderer.getContainer(ContainerType.PROJECTILE),
        this.physics,
        this.terrain,
        this.app.screen.width,
        this.app.screen.height
      );
      
      // Criar e inicializar o sistema de mira
      this.aimingSystem = new AimingSystem(
        this.renderer.getContainer(ContainerType.UI),
        this.projectileManager,
        this.terrain
      );
      
      // Criar e inicializar o sistema de turnos
      this.turnSystem = new TurnSystem(
        this.renderer.getContainer(ContainerType.UI),
        2
      );
      
      // Inicializar o controlador de input
      this.inputHandler = new InputHandler();
      if (this.app && this.app.view) {
        this.inputHandler.initialize(this.app.view as unknown as HTMLElement);
      } else {
        throw new Error('Não foi possível acessar o canvas da aplicação PIXI');
      }
      
      // Inicializar o coordenador de UI
      this.uiCoordinator = new UICoordinator();
      this.uiCoordinator.initialize(
        this.app.screen.width,
        this.app.screen.height,
        this.renderer.getContainer(ContainerType.UI)
      );
      
      // Construir o objeto de sistemas para o coordenador de eventos
      const systems: GameSystems = {
        renderer: this.renderer,
        inputHandler: this.inputHandler,
        audioController: this.audioController,
        uiCoordinator: this.uiCoordinator,
        gameStateManager: this.gameStateManager,
        vehicleManager: this.vehicleManager,
        projectileManager: this.projectileManager,
        turnSystem: this.turnSystem,
        aimingSystem: this.aimingSystem,
        physics: this.physics,
        terrain: this.terrain
      };
      
      // Inicializar o coordenador de eventos
      this.eventCoordinator = new GameEventCoordinator();
      this.eventCoordinator.initialize(systems);
      
      // Atualizar o objeto de sistemas com o coordenador de eventos
      systems.eventCoordinator = this.eventCoordinator;
      
      // Inicializar o controlador de lógica
      this.logicController = new GameLogicController(
        this.gameStateManager,
        this.vehicleManager,
        this.projectileManager,
        this.turnSystem,
        this.aimingSystem,
        this.physics,
        this.terrain,
        this.eventCoordinator
      );
      
      // Atualizar o objeto de sistemas com o controlador de lógica
      systems.logicController = this.logicController;
      
      // Configurar tratamento de erros global para eventos
      this.setupErrorHandling();
    } catch (error) {
      this.logError('initializeComponents', 'Erro ao inicializar componentes', error as Error);
      throw error; // Re-lança o erro para ser tratado no nível superior
    }
  }
  
  /**
   * Configura o tratamento de erros para eventos e componentes
   */
  private setupErrorHandling(): void {
    // Configurar tratamento de erros para o event emitter do eventCoordinator
    if (this.eventCoordinator) {
      // Este é um exemplo conceitual - o EventEmitter real precisaria suportar isso
      // ou teríamos que estender sua implementação
      /*
      this.eventCoordinator.on('error', (error) => {
        this.logError('EventCoordinator', 'Erro em um manipulador de evento', error);
      });
      */
    }
    
    // Adicionar tratamento de erros global para promises não tratadas
    window.addEventListener('unhandledrejection', (event) => {
      this.logError(
        'Promise',
        'Rejeição de Promise não tratada',
        new Error(event.reason?.message || 'Erro desconhecido')
      );
    });
    
    // Tratamento de erros globais
    window.addEventListener('error', (event) => {
      this.logError(
        'Window',
        'Erro global não capturado',
        new Error(event.message)
      );
    });
  }
  
  /**
   * Inicializa os sistemas e configura eventos
   */
  private initializeSystems(): void {
    try {
      // Configurar eventos
      this.eventCoordinator.setupEvents();
      
      // Gerar o terreno
      this.terrain.generate();
      
      // Criar veículos iniciais
      this.logicController.createInitialVehicles();
      
      // Configurar callback do botão de fim de turno
      this.uiCoordinator.setEndTurnCallback(() => {
        if (this.turnSystem.getIsPlayerTurn()) {
          this.logicController.endTurn();
        }
      });
    } catch (error) {
      this.logError('initializeSystems', 'Erro ao inicializar sistemas', error as Error);
      console.error('Erro ao inicializar sistemas:', error);
    }
  }
  
  /**
   * Inicia o jogo
   */
  private startGame(): void {
    try {
      // Iniciar o jogo através do controlador de lógica
      this.logicController.startGame();
      
      // Configurar o callback do botão de benchmark para abrir a interface de benchmark
      this.uiCoordinator.setBenchmarkButtonCallback(() => {
        this.uiCoordinator.toggleBenchmarkUI();
      });
      
      // Agora que todos os sistemas foram inicializados e o jogo começou,
      // podemos reproduzir a música de fundo
      this.audioController.playMusic(BackgroundMusic.MAIN_THEME, 0.5);
    } catch (error) {
      this.logError('startGame', 'Erro ao iniciar o jogo', error as Error);
      console.error('Erro ao iniciar o jogo:', error);
    }
  }
  
  /**
   * Ativa a cena
   */
  public activate(): void {
    super.activate();
    this.gameStateManager.startGame();
  }
  
  /**
   * Desativa a cena
   */
  public deactivate(): void {
    super.deactivate();
    this.gameStateManager.pauseGame();
  }
  
  /**
   * Redimensiona a cena quando a janela é redimensionada
   * @param width Nova largura
   * @param height Nova altura
   */
  public resize(width: number, height: number): void {
    try {
      super.resize(width, height);
      
      // Atualizar o tamanho do renderer e elementos da interface
      this.renderer.updateLayout(width, height);
      
      // Atualizar o coordenador de UI
      this.uiCoordinator.initialize(width, height, this.renderer.getContainer(ContainerType.UI));
    } catch (error) {
      this.logError('resize', 'Erro ao redimensionar a cena', error as Error);
      console.error('Erro ao redimensionar a cena:', error);
    }
  }
  
  /**
   * Atualiza a cena do jogo
   * @param deltaTime Delta time
   */
  public update(deltaTime: number): void {
    try {
      // Se o jogo não estiver em andamento, não atualiza
      if (!this.gameStateManager.isPlaying()) {
        return;
      }
      
      // Atualizar os sistemas principais
      this.physics.update(deltaTime);
      this.inputHandler.update(deltaTime);
      this.projectileManager.update(deltaTime);
      this.vehicleManager.update(deltaTime);
      this.turnSystem.update(deltaTime);
      this.uiCoordinator.update(deltaTime);
      
      // Atualizar o guia de mira
      this.logicController.updateAimingGuide();
    } catch (error) {
      this.logError('update', 'Erro ao atualizar a cena', error as Error);
      console.error('Erro ao atualizar a cena:', error);
      
      // Em caso de erro crítico durante a atualização, podemos pausar o jogo
      // para evitar loops de erro contínuos
      this.gameStateManager.pauseGame();
    }
  }
  
  /**
   * Renderiza a cena
   */
  protected render(): void {
    // A renderização é gerenciada pelo PIXI automaticamente
    // Não precisamos fazer nada aqui já que o renderer
    // do PIXI vai renderizar todos os elementos no stage
  }
  
  /**
   * Limpa todos os recursos quando a cena é destruída
   * Este método garante compatibilidade com a interface BaseScene
   */
  public destroy(): void {
    try {
      // Liberar recursos de todos os componentes
      this.dispose();
      
      // Chamar o método destroy da classe pai para limpar o container
      super.destroy();
    } catch (error) {
      this.logError('destroy', 'Erro ao destruir a cena', error as Error);
      console.error('Erro ao destruir a cena:', error);
    }
  }
  
  /**
   * Libera todos os recursos dos componentes refatorados
   * Este método é usado internamente por destroy()
   */
  public dispose(): void {
    try {
      // Liberar recursos de todos os componentes
      if (this.renderer) this.renderer.dispose();
      if (this.inputHandler) this.inputHandler.dispose();
      if (this.eventCoordinator) this.eventCoordinator.dispose();
      if (this.logicController) this.logicController.dispose();
      if (this.audioController) this.audioController.dispose();
      if (this.uiCoordinator) this.uiCoordinator.dispose();
    } catch (error) {
      this.logError('dispose', 'Erro ao liberar recursos dos componentes', error as Error);
      console.error('Erro ao liberar recursos dos componentes:', error);
    }
  }
  
  /**
   * Recupera o log de erros
   * @returns Array com os últimos erros registrados
   */
  public getErrorLog(): ErrorLogEntry[] {
    return [...this.errorLog]; // Retorna uma cópia para evitar modificação externa
  }
} 