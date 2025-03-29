# Game Gunbound: Regras e Padrões para o Desenvolvimento

## Fluxo de Trabalho
- Analisar completamente os arquivos existentes antes de propor mudanças
- Dividir componentes grandes em unidades menores com responsabilidade única
- Manter a compatibilidade com a funcionalidade existente
- Documentar todas as mudanças significativas
- Implementar testes para novos componentes
- Organizar commits por funcionalidade ou tipo de mudança

## Padrões de Código
- Seguir o princípio da responsabilidade única (SRP)
- Utilizar TypeScript com tipagem estrita
- Limitar arquivos a menos de 200 linhas quando possível
- Seguir convenções de nomenclatura existentes:
  - Classes: PascalCase
  - Interfaces: Prefixo "I" + PascalCase
  - Métodos/Funções: camelCase
  - Variáveis: camelCase
  - Constantes: UPPER_SNAKE_CASE
- Documentar classes e métodos públicos com JSDoc
- Utilizar o sistema de eventos para comunicação entre componentes

## Padrão de Commits
- Commits devem ser descritivos e específicos
- Usar prefixos para indicar o tipo de mudança:
  - feat: Novas funcionalidades
  - fix: Correções de bugs
  - refactor: Refatorações sem mudança de funcionalidade
  - docs: Atualizações de documentação
  - test: Adição ou modificação de testes
  - chore: Mudanças em build, configurações, etc.
- Organizar commits logicamente por funcionalidade
- Manter commits relativamente pequenos e focados

## Estrutura de Diretórios
- Manter a organização modular por funcionalidade
```
src/
├── core/               # Núcleo da aplicação e gerenciadores principais
├── entities/           # Implementações de entidades (veículos, projéteis)
├── managers/           # Gerenciadores específicos
├── network/            # Componentes de rede para multiplayer
├── scenes/             # Implementações de cenas do jogo
├── systems/            # Sistemas do jogo (física, terreno, etc.)
│   ├── physics/        # Sistema de física modularizado
│   ├── terrain/        # Sistema de terreno modularizado
│   ├── input/          # Sistema de entrada modularizado
│   ├── ui/             # Sistema de UI modularizado
│   └── effects/        # Sistema de efeitos visuais
├── ui/                 # Componentes de interface do usuário legados
├── utils/              # Funções utilitárias
└── main.ts             # Ponto de entrada da aplicação
```
- Novas classes devem ser colocadas no diretório apropriado
- Arquivos de teste devem ficar junto aos arquivos que estão testando

## Decisões Específicas
- Usar sistema de eventos para desacoplar componentes
- Preferir composição sobre herança
- Implementar interfaces claras para cada componente
- Utilizar TypeGuards para checagem de tipos em runtime
- Usar o padrão Factory para criação de objetos complexos
- Usar Adapters para manter compatibilidade com código legado durante refatorações

## Convenções de Refatoração
- Identificar grupos de funcionalidades relacionadas
- Extrair em classes separadas com responsabilidades únicas
- Manter interfaces consistentes
- Introduzir testes para verificar comportamento após refatoração
- Atualizar documentação para refletir nova estrutura
- Usar adaptadores para manter compatibilidade com código existente

## Criação de UI
- Sempre usar o UISystem e UIFactory refatorados para criar novos elementos
- Seguir o padrão de abstração estabelecido para novos elementos de UI
- Implementar o método update() para lógica específica do elemento
- Implementar o método destroy() para limpeza de recursos
- Utilizar o data binding para sincronização de dados quando apropriado
- Para customizações avançadas, estender BaseUIElement
