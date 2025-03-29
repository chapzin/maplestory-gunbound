# Game GunBound

Um jogo de artilharia 2D inspirado no clássico GunBound, desenvolvido com TypeScript e Pixi.js.

## Estrutura do Projeto

O projeto está organizado seguindo o princípio da responsabilidade única, com cada componente tendo uma única função bem definida. A estrutura de diretórios é a seguinte:

```
src/
  ├── core/                     # Núcleo do jogo e configurações
  │   ├── game.ts               # Classe principal do jogo
  │   ├── config.ts             # Configurações gerais
  │   └── types.ts              # Tipos e interfaces compartilhados
  │
  ├── scenes/                   # Cenas do jogo
  │   ├── base-scene.ts         # Classe base para todas as cenas
  │   └── game-scene.ts         # Cena de jogo principal
  │
  ├── entities/                 # Entidades jogáveis
  │   ├── projectile.ts         # Projétil disparado
  │   ├── vehicles/             # Veículos do jogo
  │   │   └── tank.ts           # Tipo específico de veículo
  │   ├── vehicle.ts            # Classe base de veículo
  │   └── vehicle-factory.ts    # Fábrica de veículos
  │
  ├── systems/                  # Sistemas do jogo
  │   ├── physics.ts            # Sistema de física base
  │   ├── physics-adapter.ts    # Adaptador do sistema de física
  │   ├── terrain.ts            # Sistema de terreno base
  │   ├── terrain-adapter.ts    # Adaptador do sistema de terreno
  │   ├── input/                # Sistema de entrada
  │   │   └── input-system.ts   # Gerencia inputs do jogo
  │   ├── effects/              # Sistema de efeitos visuais
  │   │   └── explosion.ts      # Efeitos de explosão
  │   └── event-system.ts       # Sistema de eventos
  │
  ├── ui/                       # Interface do usuário
  │   ├── angle-indicator.ts    # Indicador de ângulo
  │   ├── power-indicator.ts    # Indicador de potência
  │   └── wind-display.ts       # Exibição de vento
  │
  └── utils/                    # Funções e classes utilitárias
      └── math.ts               # Funções matemáticas auxiliares
```

## Principais Componentes

### Core

- **Game**: Classe principal que inicializa e executa o jogo
- **Config**: Configurações globais do jogo

### Scenes

- **BaseScene**: Classe base com funcionalidades comuns a todas as cenas
- **GameScene**: Cena principal do jogo

### Entities

- **Projectile**: Representa um projétil disparado
- **Vehicle**: Classe base para veículos do jogo
- **VehicleFactory**: Fábrica para criar diferentes tipos de veículos

### Systems

- **PhysicsSystem**: Gerencia a física do jogo (gravidade, colisões)
- **TerrainSystem**: Gerencia a geração e manipulação do terreno
- **InputSystem**: Processa entradas do usuário (teclado/mouse)
- **EventSystem**: Sistema de eventos para comunicação entre componentes
- **ExplosionEffect**: Cria efeitos visuais de explosão

### UI

- **AngleIndicator**: Mostra o ângulo de disparo
- **PowerIndicator**: Mostra a potência de disparo
- **WindDisplay**: Mostra a força e direção do vento

## Tecnologias Utilizadas

- **TypeScript**: Linguagem de programação
- **Pixi.js**: Biblioteca para renderização 2D
- **Webpack**: Empacotador de módulos

## Como Executar

1. Clone o repositório
2. Instale as dependências: `npm install`
3. Execute o servidor de desenvolvimento: `npm run dev`
4. Abra o navegador em `http://localhost:8080`

## Como Jogar

- Use as setas para ajustar o ângulo e a potência
- Pressione espaço para disparar
- Tente acertar o alvo! 