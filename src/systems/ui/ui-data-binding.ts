import EventEmitter from 'eventemitter3';
import { UIElement, UIValueChangedEventData } from './ui-types';

/**
 * Tipo de evento do sistema de binding
 */
export enum BindingEventType {
  MODEL_CHANGED = 'modelChanged',
  UI_CHANGED = 'uiChanged'
}

/**
 * Interface para dados de evento de binding
 */
export interface BindingEventData<T> {
  path: string;
  oldValue: T;
  newValue: T;
}

/**
 * Classe de binding que conecta elementos UI a um modelo de dados
 */
export class UIDataBinding {
  private static instance: UIDataBinding;
  private eventEmitter: EventEmitter;
  private dataModel: Record<string, any>;
  private bindings: Map<string, Set<UIElement>>;
  private reverseBindings: Map<UIElement, Set<string>>;
  
  /**
   * Construtor privado para implementar Singleton
   */
  private constructor() {
    this.eventEmitter = new EventEmitter();
    this.dataModel = {};
    this.bindings = new Map();
    this.reverseBindings = new Map();
  }
  
  /**
   * Obtém instância única
   */
  public static getInstance(): UIDataBinding {
    if (!UIDataBinding.instance) {
      UIDataBinding.instance = new UIDataBinding();
    }
    return UIDataBinding.instance;
  }
  
  /**
   * Define um valor no modelo de dados
   * @param path Caminho no modelo de dados
   * @param value Valor a ser definido
   */
  public setValue<T>(path: string, value: T): void {
    const oldValue = this.getValue<T>(path);
    if (oldValue !== value) {
      this.setModelValue(path, value);
      this.notifyUIElements(path, oldValue, value);
      this.eventEmitter.emit(BindingEventType.MODEL_CHANGED, {
        path,
        oldValue,
        newValue: value
      } as BindingEventData<T>);
    }
  }
  
  /**
   * Obtém um valor do modelo de dados
   * @param path Caminho no modelo de dados
   * @returns Valor no caminho especificado
   */
  public getValue<T>(path: string): T {
    return this.getModelValue(path) as T;
  }
  
  /**
   * Cria binding de um elemento UI a um caminho no modelo
   * @param element Elemento UI
   * @param path Caminho no modelo
   * @param setter Função para definir o valor no elemento
   * @param getter Função para obter o valor do elemento
   */
  public bind<T>(
    element: UIElement, 
    path: string,
    setter: (element: UIElement, value: T) => void,
    getter?: (element: UIElement) => T
  ): void {
    // Adiciona ao mapa de bindings
    if (!this.bindings.has(path)) {
      this.bindings.set(path, new Set());
    }
    this.bindings.get(path)?.add(element);
    
    // Adiciona ao mapa reverso
    if (!this.reverseBindings.has(element)) {
      this.reverseBindings.set(element, new Set());
    }
    this.reverseBindings.get(element)?.add(path);
    
    // Configura o elemento com o valor atual
    const value = this.getValue<T>(path);
    if (value !== undefined) {
      setter(element, value);
    }
    
    // Se tiver getter, configura para atualizar o modelo quando a UI mudar
    if (getter) {
      if ('onValueChanged' in element && typeof (element as any).onValueChanged === 'function') {
        (element as any).onValueChanged((data: UIValueChangedEventData) => {
          const newValue = getter(element);
          this.setValue(path, newValue);
          this.eventEmitter.emit(BindingEventType.UI_CHANGED, {
            path,
            oldValue: data.oldValue,
            newValue: data.newValue
          });
        });
      }
    }
  }
  
  /**
   * Remove binding de um elemento UI
   * @param element Elemento UI a ser desvinculado
   * @param path Caminho opcional (se não for fornecido, remove todos os bindings do elemento)
   */
  public unbind(element: UIElement, path?: string): void {
    if (path) {
      // Remove binding específico
      this.bindings.get(path)?.delete(element);
      this.reverseBindings.get(element)?.delete(path);
    } else {
      // Remove todos os bindings do elemento
      const paths = this.reverseBindings.get(element);
      if (paths) {
        for (const p of paths) {
          this.bindings.get(p)?.delete(element);
        }
        this.reverseBindings.delete(element);
      }
    }
  }
  
  /**
   * Registra callback para evento de alteração no modelo
   * @param listener Função callback
   */
  public onModelChanged<T>(listener: (data: BindingEventData<T>) => void): void {
    this.eventEmitter.on(BindingEventType.MODEL_CHANGED, listener);
  }
  
  /**
   * Remove callback de evento de alteração no modelo
   * @param listener Função callback
   */
  public offModelChanged<T>(listener: (data: BindingEventData<T>) => void): void {
    this.eventEmitter.off(BindingEventType.MODEL_CHANGED, listener);
  }
  
  /**
   * Registra callback para evento de alteração na UI
   * @param listener Função callback
   */
  public onUIChanged<T>(listener: (data: BindingEventData<T>) => void): void {
    this.eventEmitter.on(BindingEventType.UI_CHANGED, listener);
  }
  
  /**
   * Remove callback de evento de alteração na UI
   * @param listener Função callback
   */
  public offUIChanged<T>(listener: (data: BindingEventData<T>) => void): void {
    this.eventEmitter.off(BindingEventType.UI_CHANGED, listener);
  }
  
  /**
   * Limpa todos os bindings
   */
  public clearBindings(): void {
    this.bindings.clear();
    this.reverseBindings.clear();
  }
  
  /**
   * Notifica elementos UI sobre alteração no modelo
   * @param path Caminho alterado
   * @param oldValue Valor antigo
   * @param newValue Novo valor
   */
  private notifyUIElements<T>(path: string, oldValue: T, newValue: T): void {
    const elements = this.bindings.get(path);
    if (elements) {
      for (const element of elements) {
        if ('update' in element && typeof element.update === 'function') {
          element.update(0, newValue);
        }
      }
    }
  }
  
  /**
   * Define valor no modelo de dados
   * @param path Caminho no modelo
   * @param value Valor a ser definido
   */
  private setModelValue<T>(path: string, value: T): void {
    const parts = path.split('.');
    let current = this.dataModel;
    
    // Navega pelo caminho até o penúltimo elemento
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!current[part] || typeof current[part] !== 'object') {
        current[part] = {};
      }
      current = current[part];
    }
    
    // Define o valor no último elemento
    const lastPart = parts[parts.length - 1];
    current[lastPart] = value;
  }
  
  /**
   * Obtém valor do modelo de dados
   * @param path Caminho no modelo
   * @returns Valor no caminho especificado
   */
  private getModelValue(path: string): any {
    const parts = path.split('.');
    let current = this.dataModel;
    
    // Navega pelo caminho
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (current[part] === undefined) {
        return undefined;
      }
      current = current[part];
    }
    
    return current;
  }
  
  /**
   * Limpa todos os recursos
   */
  public dispose(): void {
    this.eventEmitter.removeAllListeners();
    this.clearBindings();
    this.dataModel = {};
  }
} 