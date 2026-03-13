# Market House 🏠🛒

Aplicativo mobile para gestão pessoal de compras e despensa. Desenvolvido com React Native, Expo e Supabase.

## 📋 Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Funcionalidades](#funcionalidades)
- [Tecnologias](#tecnologias)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Configuração Inicial](#configuração-inicial)
- [Configuração do Supabase](#configuração-do-supabase)
- [Como Usar](#como-usar)
- [Paleta de Cores](#paleta-de-cores)

## 🎯 Sobre o Projeto

Market House é um aplicativo para uso pessoal que facilita o gerenciamento de compras e controle de despensa. Com ele você pode:

- Manter uma lista de compras organizada
- Adicionar itens ao carrinho com preços
- Registrar compras finalizadas
- Acompanhar itens na despensa
- Receber alertas de produtos vencendo ou com estoque baixo
- Visualizar relatórios de gastos

## ✨ Funcionalidades

### Lista de Compras
- Adicionar itens com quantidade e prioridade
- **Swipe para esquerda**: Excluir item
- **Swipe para direita**: Adicionar ao carrinho
- Organização por prioridade

### Carrinho
- Visualizar itens com preços
- Editar quantidades e valores
- Ver total da compra
- Finalizar compra

### Despensa
- Visualizar todos os itens em estoque
- Alertas de produtos vencendo
- Alertas de estoque baixo
- Organização por localização
- Sugestões de recompra

### Histórico de Compras
- Ver todas as compras realizadas
- Estatísticas de gastos
- Detalhes por compra
- Filtros por período

## 🚀 Tecnologias

- **React Native** - Framework mobile
- **Expo** - Plataforma de desenvolvimento
- **TypeScript** - Linguagem tipada
- **Supabase** - Backend as a Service (PostgreSQL)
- **React Query** - Gerenciamento de estado assíncrono
- **Zustand** - Gerenciamento de estado global
- **React Navigation** - Navegação
- **React Native Gesture Handler** - Gestos (swipe)
- **React Native Reanimated** - Animações

## 📁 Estrutura do Projeto

\`\`\`
market-house/
├── src/
│   ├── app/                      # Rotas do Expo Router
│   │   ├── (tabs)/              # Navegação por tabs
│   │   │   ├── index.tsx        # Despensa (Home)
│   │   │   ├── shopping-list.tsx # Lista de Compras
│   │   │   ├── cart.tsx         # Carrinho
│   │   │   └── purchases.tsx    # Histórico
│   │   └── _layout.tsx          # Layout raiz
│   │
│   ├── components/              # Componentes reutilizáveis
│   │   └── ui/                  # Componentes de UI
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── input.tsx
│   │       ├── swipeable-list-item.tsx
│   │       ├── loading-spinner.tsx
│   │       └── empty-state.tsx
│   │
│   ├── features/                # Funcionalidades por domínio
│   │   ├── categories/
│   │   │   └── hooks/           # React Query hooks
│   │   ├── items/
│   │   ├── shopping-list/
│   │   ├── cart/
│   │   ├── pantry/
│   │   └── purchases/
│   │
│   ├── services/                # API calls para Supabase
│   │   ├── category.service.ts
│   │   ├── item.service.ts
│   │   ├── shopping-list.service.ts
│   │   ├── cart.service.ts
│   │   ├── pantry.service.ts
│   │   └── purchase.service.ts
│   │
│   ├── types/                   # Definições TypeScript
│   │   ├── database.ts
│   │   ├── category.ts
│   │   ├── item.ts
│   │   ├── shopping-list.ts
│   │   ├── cart.ts
│   │   ├── pantry.ts
│   │   └── purchase.ts
│   │
│   ├── lib/                     # Configurações
│   │   ├── supabase.ts          # Cliente Supabase
│   │   ├── supabase-schema.sql  # Schema do banco
│   │   └── react-query.ts       # Config React Query
│   │
│   ├── utils/                   # Funções utilitárias
│   │   ├── format.ts            # Formatação
│   │   └── validation.ts        # Validações
│   │
│   ├── constants/               # Constantes
│   │   └── theme.ts             # Tema e cores
│   │
│   ├── hooks/                   # Hooks customizados
│   └── store/                   # Estado global (Zustand)
│
├── .env                         # Variáveis de ambiente
├── .env.example                 # Exemplo de .env
└── package.json
\`\`\`

## ⚙️ Configuração Inicial

### 1. Pré-requisitos

- Node.js (v18 ou superior)
- npm ou yarn
- Expo CLI (\`npm install -g expo-cli\`)
- Conta no Supabase (gratuita)

### 2. Instalação

\`\`\`bash
# Clonar o repositório
cd market-house

# Instalar dependências
npm install

# Copiar arquivo de ambiente
cp .env.example .env
\`\`\`

### 3. Configurar Variáveis de Ambiente

Edite o arquivo \`.env\` com suas credenciais do Supabase:

\`\`\`env
EXPO_PUBLIC_SUPABASE_URL=sua-url-do-supabase
EXPO_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima
\`\`\`

## 🗄️ Configuração do Supabase

### 1. Criar Projeto

1. Acesse [supabase.com](https://supabase.com)
2. Crie uma nova conta ou faça login
3. Crie um novo projeto
4. Anote a URL e Anon Key (Settings > API)

### 2. Executar Schema

1. Acesse o SQL Editor no Supabase
2. Copie o conteúdo de \`src/lib/supabase-schema.sql\`
3. Execute o script SQL
4. Verifique se todas as tabelas foram criadas

### 3. Estrutura do Banco

O schema cria as seguintes tabelas:

- **categories** - Categorias de produtos
- **items** - Produtos/itens
- **shopping_list_items** - Itens da lista de compras
- **cart_items** - Itens no carrinho
- **purchases** - Compras registradas
- **purchase_items** - Itens de cada compra
- **pantry_items** - Itens na despensa

Todas as tabelas incluem:
- Row Level Security (RLS) habilitado
- Políticas de segurança por usuário
- Triggers para atualização automática de \`updated_at\`
- Índices para performance

## 🎨 Paleta de Cores

### Tema Light
- **Botão Principal**: #E6C77A (fundo) / #FFFFFF ou #3A3835 (texto)
- **Botão Secundário**: #F2E3B3 (fundo) / #9C7A2B (texto)
- **Fundo**: #FFFFFF
- **Cards**: #FAF7F2 (fundo) / #E8E6E1 (bordas)
- **Texto**: #3A3835 (principal) / #8A857D (secundário)

### Tema Dark
- **Botão Principal**: #E6C77A (fundo) / #12110F (texto)
- **Botão Secundário**: #23201C (fundo) / #E6C77A (texto/borda)
- **Fundo**: #12110F
- **Cards**: #23201C (fundo) / #3A352F (bordas)
- **Input**: #1A1815 (fundo) / #E6C77A (borda em foco)

## 🎯 Como Usar

### Iniciar o Aplicativo

\`\`\`bash
# Iniciar servidor de desenvolvimento
npm start

# Ou especificar plataforma
npm run android  # Para Android
npm run ios      # Para iOS
npm run web      # Para Web
\`\`\`

### Fluxo Básico

1. **Cadastrar Categorias e Itens**
   - Crie categorias para organizar seus produtos
   - Cadastre itens vinculados às categorias

2. **Criar Lista de Compras**
   - Adicione itens à lista de compras
   - Defina quantidade e prioridade
   - Swipe para gerenciar itens

3. **Adicionar ao Carrinho**
   - Swipe para direita nos itens da lista
   - Defina o preço de cada item
   - Acompanhe o total

4. **Finalizar Compra**
   - Revise os itens no carrinho
   - Finalize a compra
   - Itens vão automaticamente para a despensa

5. **Gerenciar Despensa**
   - Visualize alertas de vencimento
   - Monitore estoque baixo
   - Receba sugestões de recompra

## 📱 Funcionalidades Futuras

- [ ] Autenticação de usuários
- [ ] Scanner de código de barras
- [ ] Compartilhamento de listas
- [ ] Modo offline
- [ ] Sincronização em múltiplos dispositivos
- [ ] Gráficos avançados de gastos
- [ ] Receitas baseadas nos itens da despensa
- [ ] Notificações push para alertas
- [ ] Integração com calendário

## 🤝 Contribuindo

Este é um projeto pessoal, mas sugestões são bem-vindas! Sinta-se livre para abrir issues ou pull requests.

## 📝 Licença

Este projeto é para uso pessoal.

## 👨‍💻 Autor

Desenvolvido com ❤️ para facilitar o gerenciamento de compras e despensa.

---

**Dica**: Comece cadastrando algumas categorias básicas como "Alimentos", "Higiene", "Limpeza" para organizar melhor seus itens!
