import * as PIXI from 'pixi.js';
import { EventEmitter, EventCallback } from '../../utils/event-emitter';

/**
 * Tipos de containers do jogo
 */
export enum ContainerType {
  MAIN = 'main',
  BACKGROUND = 'background',
  TERRAIN = 'terrain',
  VEHICLE = 'vehicle',
  PROJECTILE = 'projectile',
  UI = 'ui'
}

/**
 * Eventos do renderer
 */
export enum RendererEventType {
  CONTAINER_ADDED = 'container_added',
  DISPLAY_OBJECT_ADDED = 'display_object_added',
  LAYOUT_UPDATED = 'layout_updated'
}

/**
 * Interface para o renderer do jogo
 */
export interface IGameRenderer {
  /**
   * Inicializa o renderer
   * @param app Aplicação PIXI
   */
  initialize(app: PIXI.Application): void;
  
  /**
   * Obtém um container pelo tipo
   * @param containerType Tipo do container
   */
  getContainer(containerType: ContainerType): PIXI.Container;
  
  /**
   * Adiciona um objeto de exibição a um container
   * @param containerType Tipo do container
   * @param displayObject Objeto a ser adicionado
   */
  addToContainer(containerType: ContainerType, displayObject: PIXI.DisplayObject): void;
  
  /**
   * Atualiza o layout dos containers
   * @param width Largura da tela
   * @param height Altura da tela
   */
  updateLayout(width: number, height: number): void;
  
  /**
   * Registra um callback para um tipo de evento do renderer
   * @param eventType Tipo do evento
   * @param callback Função de callback
   */
  on(eventType: RendererEventType, callback: EventCallback): void;
  
  /**
   * Remove um callback registrado para um tipo de evento do renderer
   * @param eventType Tipo do evento
   * @param callback Função de callback a ser removida
   */
  off(eventType: RendererEventType, callback: EventCallback): void;
  
  /**
   * Libera recursos do renderer
   */
  dispose(): void;
}

/**
 * Implementação do renderer do jogo
 */
export class GameRenderer implements IGameRenderer {
  private app: PIXI.Application;
  private containers: Map<ContainerType, PIXI.Container> = new Map();
  private eventEmitter: EventEmitter = new EventEmitter();
  private initialized: boolean = false;
  
  /**
   * Inicializa o renderer
   * @param app Aplicação PIXI
   */
  initialize(app: PIXI.Application): void {
    if (this.initialized) return;
    
    this.app = app;
    
    // Criar containers
    const mainContainer = new PIXI.Container();
    const backgroundContainer = new PIXI.Container();
    const terrainContainer = new PIXI.Container();
    const vehicleContainer = new PIXI.Container();
    const projectileContainer = new PIXI.Container();
    const uiContainer = new PIXI.Container();
    
    // Adicionar containers na ordem correta
    mainContainer.addChild(backgroundContainer);
    mainContainer.addChild(terrainContainer);
    mainContainer.addChild(vehicleContainer);
    mainContainer.addChild(projectileContainer);
    mainContainer.addChild(uiContainer);
    
    // Adicionar o container principal ao app
    this.app.stage.addChild(mainContainer);
    
    // Armazenar referências
    this.containers.set(ContainerType.MAIN, mainContainer);
    this.containers.set(ContainerType.BACKGROUND, backgroundContainer);
    this.containers.set(ContainerType.TERRAIN, terrainContainer);
    this.containers.set(ContainerType.VEHICLE, vehicleContainer);
    this.containers.set(ContainerType.PROJECTILE, projectileContainer);
    this.containers.set(ContainerType.UI, uiContainer);
    
    this.initialized = true;
    
    // Emitir eventos para cada container criado
    for (const [type, container] of this.containers.entries()) {
      this.eventEmitter.emit(RendererEventType.CONTAINER_ADDED, { type, container });
    }
  }
  
  /**
   * Obtém um container pelo tipo
   * @param containerType Tipo do container
   */
  getContainer(containerType: ContainerType): PIXI.Container {
    if (!this.initialized) {
      throw new Error('GameRenderer não foi inicializado');
    }
    
    const container = this.containers.get(containerType);
    if (!container) {
      throw new Error(`Container do tipo ${containerType} não encontrado`);
    }
    return container;
  }
  
  /**
   * Adiciona um objeto de exibição a um container
   * @param containerType Tipo do container
   * @param displayObject Objeto a ser adicionado
   */
  addToContainer(containerType: ContainerType, displayObject: PIXI.DisplayObject): void {
    const container = this.getContainer(containerType);
    container.addChild(displayObject);
    
    this.eventEmitter.emit(RendererEventType.DISPLAY_OBJECT_ADDED, {
      containerType,
      displayObject
    });
  }
  
  /**
   * Atualiza o layout dos containers
   * @param width Largura da tela
   * @param height Altura da tela
   */
  updateLayout(width: number, height: number): void {
    if (!this.initialized) return;
    
    // Atualizar layout dos containers se necessário
    // Por exemplo, redimensionar containers de UI
    
    this.eventEmitter.emit(RendererEventType.LAYOUT_UPDATED, { width, height });
  }
  
  /**
   * Registra um callback para um tipo de evento do renderer
   * @param eventType Tipo do evento
   * @param callback Função de callback
   */
  on(eventType: RendererEventType, callback: EventCallback): void {
    this.eventEmitter.on(eventType, callback);
  }
  
  /**
   * Remove um callback registrado para um tipo de evento do renderer
   * @param eventType Tipo do evento
   * @param callback Função de callback a ser removida
   */
  off(eventType: RendererEventType, callback: EventCallback): void {
    this.eventEmitter.off(eventType, callback);
  }
  
  /**
   * Libera recursos do renderer
   */
  dispose(): void {
    if (!this.initialized) return;
    
    // Remover containers
    if (this.app && this.app.stage) {
      const mainContainer = this.containers.get(ContainerType.MAIN);
      if (mainContainer) {
        this.app.stage.removeChild(mainContainer);
        mainContainer.destroy({children: true});
      }
    }
    
    // Limpar mapa de containers
    this.containers.clear();
    
    // Remover todos os event listeners
    this.eventEmitter.removeAllListeners();
    
    this.initialized = false;
  }
} 