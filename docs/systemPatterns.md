# Padrões do Sistema

## Princípios Arquiteturais

### Princípio da Responsabilidade Única (SRP)
Cada classe no projeto tem uma única responsabilidade bem definida. Por exemplo:
- `GameScene`: Coordenação geral da cena de jogo
- `EntityManager`: Gerenciamento de entidades
- `CollisionManager`: Detecção e tratamento de colisões
- `InputManager`: Gestão de entrada do usuário
- `AudioManager`: Reprodução e gerenciamento de áudio
- `UISystem`: Gerenciamento de elementos de UI
- `UIFactory`: Criação de elementos de UI
- `UIDataBinding`: Sincronização de dados com UI

### Comunicação entre Componentes
O projeto utiliza principalmente dois métodos de comunicação entre componentes:

1. **Sistema de Eventos**: Componentes emitem eventos que podem ser observados por outros componentes, permitindo acoplamento fraco.
   ```typescript
   // Exemplo de sistema de eventos
   this.turnSystem.on(TurnEventType.TURN_STARTED, this.onTurnStarted.bind(this));
   ```

2. **Interfaces Definidas**: Componentes interagem através de interfaces bem definidas, não de implementações concretas.
   ```typescript
   // Exemplo de interface
   interface IVehicle extends PhysicsEntity, DamageableEntity, PlayerOwnedEntity {
     // ...
   }
   ```

### Design Patterns Implementados

#### Padrão Factory
Utilizado para criar objetos complexos com uma interface simplificada.
```typescript
// Exemplo de Factory
class VehicleFactory {
  createVehicle(type: VehicleType, position: PIXI.Point, player: number): Vehicle {
    // Lógica de criação...
  }
}

// Exemplo de UIFactory
class UIFactory {
  createButton(id: string, x: number, y: number, options: ButtonOptions): ButtonElement {
    // Lógica de criação de botão...
  }
}
```

#### Padrão Adapter
Utilizado para adaptar interfaces existentes para novas interfaces.
```typescript
// Exemplo de Adapter
class OriginalVehicleAdapter implements IVehicle {
  constructor(private originalVehicle: Vehicle) {}
  // Implementa a interface IVehicle
}

// Exemplo de UIAdapter
class UIAdapter {
  constructor(private container: PIXI.Container) {
    this.uiSystem = new UISystem(container);
  }
  
  // Métodos que mantêm a compatibilidade com a API antiga
  createText(id: string, text: string, x: number, y: number) {
    return this.uiSystem.createText(id, text, x, y);
  }
}
```

#### Padrão Observer
Implementado através do sistema de eventos para desacoplar componentes.
```typescript
// Exemplo de Observer
this.projectileManager.on(ProjectileEventType.PROJECTILE_IMPACT, this.onProjectileImpact.bind(this));
```

#### Padrão Singleton
Utilizado para gerenciadores globais que devem ter apenas uma instância.
```typescript
// Exemplo de Singleton-like pattern para GameStateManager
export class GameStateManager {
  private static instance: GameStateManager;
  
  public static getInstance(): GameStateManager {
    if (!GameStateManager.instance) {
      GameStateManager.instance = new GameStateManager();
    }
    return GameStateManager.instance;
  }
}

// Exemplo para UIDataBinding
export class UIDataBinding {
  private static instance: UIDataBinding;
  
  public static getInstance(): UIDataBinding {
    if (!UIDataBinding.instance) {
      UIDataBinding.instance = new UIDataBinding();
    }
    return UIDataBinding.instance;
  }
}
```

#### Padrão Command
Utilizado para encapsular uma solicitação como um objeto.
```typescript
// Exemplo conceitual do padrão Command para ações de jogo
interface GameCommand {
  execute(): void;
  undo(): void;
}

class FireCommand implements GameCommand {
  constructor(private vehicle: Vehicle, private angle: number, private power: number) {}
  
  execute(): void {
    // Lógica para disparar
  }
  
  undo(): void {
    // Lógica para desfazer o disparo (para replay/rewind)
  }
}
```

## Convenções de Código

### Nomenclatura
- **Classes**: PascalCase (ex.: `VehicleManager`, `ButtonElement`)
- **Interfaces**: Prefixo "I" + PascalCase (ex.: `IVehicle`, `IUISystem`)
- **Tipos**: PascalCase (ex.: `VehicleType`, `ButtonOptions`)
- **Métodos/Funções**: camelCase (ex.: `createVehicle()`, `updatePosition()`)
- **Variáveis**: camelCase (ex.: `activeVehicle`, `buttonWidth`)
- **Constantes**: UPPER_SNAKE_CASE (ex.: `MAX_POWER`, `DEFAULT_BUTTON_COLOR`)
- **Eventos**: Enums com nomes descritivos (ex.: `TurnEventType.TURN_STARTED`, `UIEventType.ELEMENT_CLICKED`)

### Organização de Arquivos
- Um arquivo por classe/tipo principal
- Naming consistente com o conteúdo
- Estrutura de diretórios reflete função no sistema
- Componentes relacionados agrupados em diretórios específicos

### Estilo de Código
- Uso consistente de tipos TypeScript
- Evitar o uso de `any`
- Documentação JSDoc para classes e métodos públicos
- Preferência por funções puras quando possível
- Imutabilidade de dados quando apropriado

## Padrões de Gerenciamento de Estado

### Estado do Jogo
O estado do jogo é gerenciado principalmente pelo `GameStateManager`, que controla os estados:
- `LOADING` - Carregando recursos
- `MENU` - No menu principal
- `PLAYING` - Jogo em andamento
- `PAUSED` - Jogo pausado
- `GAME_OVER` - Jogo terminado

### Estado de Turno
O `TurnSystem` gerencia o estado dos turnos do jogo:
- Controle de turno atual
- Tempo restante
- Estado de ações do jogador
- Transições entre jogadores

### Estado das Entidades
As entidades mantêm seu próprio estado interno:
- Posição, velocidade, aceleração
- Vida/dano
- Estado de animação
- Propriedades específicas (ângulo, potência, etc.)

### Estado da UI
O sistema de UI modular gerencia seu próprio estado:
- Visibilidade e posição de elementos
- Estado de interação (hover, press, etc.)
- Vinculação com modelo de dados através do UIDataBinding

## Padrões de Tratamento de Erros
- Uso de exceções para erros críticos
- Logging detalhado (console.error/warn/log)
- Fallbacks para recursos que falharem ao carregar
- Verificações de null/undefined com operadores de coalescência

## Padrões de Otimização
- Object pooling para objetos temporários
- Lazy loading de recursos
- Caching de cálculos caros
- Reutilização de objetos PIXI (Sprites, Containers)
- Minimização de mudanças de estado de renderização
- Gerenciamento eficiente de elementos de UI (atualizar apenas quando necessário)
