# Documentação da Arquitetura do Game Gunbound

## Visão Geral

Este documento descreve a arquitetura do jogo Gunbound após a refatoração realizada aplicando o princípio da responsabilidade única (SRP). O jogo foi refatorado para uma estrutura modular em que cada componente tem uma responsabilidade bem definida, facilitando a manutenção, teste e extensão do código.

## Estrutura de Pastas

```
src/
├── core/
│   ├── entity-interfaces.ts      # Interfaces de entidades
│   ├── entity-adapters.ts        # Adaptadores para entidades existentes
│   ├── entity-manager.ts         # Gerenciador de entidades
│   ├── collision-manager.ts      # Gerenciador de colisões
│   ├── input-manager.ts          # Gerenciador de entrada do usuário
│   ├── audio-manager.ts          # Gerenciador de áudio
│   ├── game-state-manager.ts     # Gerenciador de estado do jogo
│   ├── game-scene.ts             # Cena principal do jogo
│   ├── game.ts                   # Classe principal do jogo
│   └── config.ts                 # Configurações do jogo
├── entities/                     # Implementações de entidades
├── managers/                     # Gerenciadores específicos
├── network/                      # Componentes de rede
├── scenes/                       # Implementações de cenas
├── systems/                      # Sistemas do jogo (física, terreno, etc.)
├── ui/                           # Componentes de interface do usuário
├── utils/                        # Utilitários
└── main.ts                       # Ponto de entrada da aplicação
```

## Componentes Principais

### 1. Interfaces de Entidade (entity-interfaces.ts)

Implementa uma hierarquia de interfaces que definem comportamentos para diferentes tipos de entidades:

- **Entity**: Interface base para todas as entidades
- **PhysicsEntity**: Entidades com propriedades físicas
- **DamageableEntity**: Entidades que podem receber dano
- **OffensiveEntity**: Entidades que podem causar dano
- **PlayerOwnedEntity**: Entidades que pertencem a um jogador
- **IVehicle**: Interface completa para veículos
- **IProjectile**: Interface completa para projéteis

### 2. Adaptadores de Entidade (entity-adapters.ts)

Implementa o padrão Adapter para adaptar classes existentes às novas interfaces:

- **EntityFactory**: Fábrica que cria entidades do jogo
- **OriginalVehicleAdapter**: Adapta veículos existentes à interface IVehicle
- **OriginalProjectileAdapter**: Adapta projéteis existentes à interface IProjectile

### 3. Gerenciador de Entidades (entity-manager.ts)

Responsável por:
- Criar, atualizar e remover entidades
- Manter referências para entidades ativas
- Emitir eventos relacionados a entidades
- Gerenciar o ciclo de vida das entidades

### 4. Gerenciador de Colisões (collision-manager.ts)

Responsável por:
- Detectar colisões entre entidades
- Emitir eventos de colisão
- Verificar limites do mundo
- Verificar colisões com o terreno

### 5. Gerenciador de Entrada (input-manager.ts)

Responsável por:
- Capturar eventos de teclado, mouse e toque
- Mapear entradas para ações do jogo
- Gerenciar o estado de entrada
- Emitir eventos de entrada

### 6. Gerenciador de Estado do Jogo (game-state-manager.ts)

Responsável por:
- Gerenciar o estado atual do jogo (menu, jogando, pausado, etc.)
- Controlar transições entre estados
- Salvar e carregar o estado do jogo
- Emitir eventos de mudança de estado

### 7. Gerenciador de Áudio (audio-manager.ts)

Responsável por:
- Carregar e gerenciar recursos de áudio
- Reproduzir efeitos sonoros e música
- Controlar volume e estado de áudio
- Implementar funcionalidades de áudio posicional

### 8. Cena de Jogo (game-scene.ts)

Responsável por:
- Coordenar os diferentes sistemas do jogo
- Inicializar e atualizar os componentes
- Renderizar a cena do jogo
- Gerenciar o loop de jogo

## Fluxo de Dados e Comunicação

A comunicação entre componentes ocorre principalmente através de:

1. **Interfaces bem definidas**: Componentes interagem através de interfaces claras
2. **Sistema de eventos**: Usando EventEmitter para comunicação desacoplada
3. **Referências diretas**: Quando necessário, componentes mantêm referências a outros

## Padrões de Design Utilizados

- **Princípio da Responsabilidade Única (SRP)**: Cada classe tem uma única responsabilidade
- **Padrão Adapter**: Para compatibilidade com código existente
- **Padrão Factory**: Para criação de objetos com interfaces padrão
- **Composition over Inheritance**: Uso de composição em vez de herança
- **Type Guards**: Para verificação de tipos em tempo de execução
- **Event-based Communication**: Para desacoplamento de componentes

## Benefícios da Nova Arquitetura

1. **Modularidade**: Componentes podem ser desenvolvidos e testados isoladamente
2. **Manutenibilidade**: Mudanças em um componente têm impacto mínimo em outros
3. **Testabilidade**: Interfaces claras facilitam a criação de mocks para testes
4. **Extensibilidade**: Novas funcionalidades podem ser adicionadas com facilidade
5. **Reusabilidade**: Componentes podem ser reutilizados em diferentes contextos
6. **Legibilidade**: Código mais organizado e com responsabilidades claras

## Fluxo de Execução

1. **Inicialização**:
   - main.ts cria uma instância de Game
   - Game inicializa o PIXI.Application e carrega recursos
   - Game cria GameScene e inicia o loop de jogo

2. **Loop de Jogo**:
   - GameScene coordena a atualização de todos os gerenciadores
   - InputManager processa entradas e emite eventos
   - EntityManager atualiza todas as entidades
   - CollisionManager verifica colisões e emite eventos
   - GameStateManager atualiza o estado do jogo
   - AudioManager reproduz sons baseados em eventos

3. **Interações de Gameplay**:
   - Veículos são controlados pelo jogador via InputManager
   - Projéteis são criados e gerenciados pelo EntityManager
   - Colisões são detectadas pelo CollisionManager
   - Dano é aplicado via métodos da interface DamageableEntity
   - Estados de jogo são alterados via GameStateManager 