# 📐 Estrutura Visual do Market House

Este documento apresenta a estrutura visual e o fluxo de dados do aplicativo.

## 🏗️ Arquitetura Geral

```
┌─────────────────────────────────────────────────────────┐
│                      Market House                        │
│                     (React Native)                       │
└─────────────────────────────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
        ▼                 ▼                 ▼
   ┌────────┐       ┌──────────┐     ┌──────────┐
   │  Expo  │       │ Supabase │     │   React  │
   │ Router │       │(PostgreSQL)     │  Query   │
   └────────┘       └──────────┘     └──────────┘
        │                 │                 │
        └─────────────────┼─────────────────┘
                          │
                    ┌─────▼─────┐
                    │ Features  │
                    └───────────┘
```

## 📱 Telas e Navegação

```
┌──────────────────────────────────────────────────────┐
│                    Market House                       │
│  ┌──────────┬──────────┬───────────┬──────────────┐  │
│  │ Despensa │  Lista   │ Carrinho  │   Compras   │  │
│  │   (🏠)   │   (📝)   │   (🛒)    │    (📊)     │  │
│  └──────────┴──────────┴───────────┴──────────────┘  │
└──────────────────────────────────────────────────────┘

Tab 1: DESPENSA (Home)
├── Resumo da Despensa
│   ├── Total de Itens
│   ├── Itens Vencendo
│   └── Itens Vencidos
├── Alertas
│   ├── Estoque Baixo
│   ├── Vencendo em Breve
│   └── Vencidos
└── Lista de Itens
    ├── Nome do Item
    ├── Categoria
    ├── Quantidade
    ├── Localização
    └── Data de Validade

Tab 2: LISTA DE COMPRAS
├── Lista de Itens
│   ├── Swipe ← (Excluir)
│   └── Swipe → (Adicionar ao Carrinho)
└── Footer com Instruções

Tab 3: CARRINHO
├── Itens no Carrinho
│   ├── Nome
│   ├── Quantidade × Preço
│   └── Subtotal
├── Total Geral
└── Botão "Finalizar Compra"

Tab 4: COMPRAS (Histórico)
├── Estatísticas
│   ├── Total de Compras
│   ├── Total Gasto
│   └── Média por Compra
└── Lista de Compras
    ├── Data
    ├── Loja
    ├── Valor Total
    └── Forma de Pagamento
```

## 🔄 Fluxo de Dados

### Fluxo Principal: Da Lista ao Estoque

```
1. CADASTRO
   Categoria → Item
   
2. LISTA DE COMPRAS
   Item → Lista de Compras
   
3. CARRINHO
   Lista → Carrinho (com preço)
   
4. COMPRA
   Carrinho → Compra Registrada
   
5. DESPENSA
   Compra → Itens na Despensa
```

### Fluxo Detalhado

```
┌──────────────┐     ┌──────────────┐
│  CATEGORIA   │────▶│     ITEM     │
└──────────────┘     └──────────────┘
                            │
                            ▼
                     ┌──────────────┐
                     │   LISTA DE   │
         ┌──────────▶│   COMPRAS    │
         │           └──────────────┘
         │                  │
         │          [Swipe Right]
         │                  │
         │                  ▼
    [Excluir]        ┌──────────────┐
         │           │   CARRINHO   │◀─── (Adicionar Preço)
         │           │   + Preço    │
         │           └──────────────┘
         │                  │
         │          [Finalizar Compra]
         │                  │
         │                  ▼
         │           ┌──────────────┐
         │           │    COMPRA    │
         │           │  (Registro)   │
         │           └──────────────┘
         │                  │
         │                  ├──────────┐
         │                  ▼          ▼
         │           ┌──────────┐  ┌──────────┐
         └───────────│ DESPENSA │  │ HISTÓRICO│
                     └──────────┘  └──────────┘
```

## 🗄️ Modelo de Dados (Simplificado)

```
┌─────────────────┐
│   CATEGORIAS    │
├─────────────────┤
│ id              │
│ name            │
│ color           │
│ icon            │
└─────────────────┘
         │
         │ 1:N
         ▼
┌─────────────────┐
│      ITENS      │
├─────────────────┤
│ id              │
│ name            │
│ category_id     │◀─────┐
│ usual_price     │      │
└─────────────────┘      │
         │               │
    ┌────┼────┐          │
    │    │    │          │
    ▼    ▼    ▼          │
┌────────┐ ┌────────┐ ┌────────┐
│ LISTA  │ │CARRINHO│ │DESPENSA│
├────────┤ ├────────┤ ├────────┤
│item_id │ │item_id │ │item_id │─┘
│quantity│ │quantity│ │quantity│
│priority│ │price   │ │expira  │
└────────┘ └────────┘ │location│
                      │min_stock│
                      └────────┘
     │         │
     └────┬────┘
          │
          ▼
    ┌──────────┐
    │  COMPRA  │
    ├──────────┤
    │ id       │
    │ date     │
    │ total    │
    │ store    │
    └──────────┘
```

## 🎨 Componentes UI Reutilizáveis

```
src/components/ui/
│
├── button.tsx
│   ├── variant: 'primary' | 'secondary'
│   ├── loading
│   └── fullWidth
│
├── card.tsx
│   └── Wrapper com estilo base
│
├── input.tsx
│   ├── label
│   └── error
│
├── swipeable-list-item.tsx
│   ├── onSwipeLeft (Excluir)
│   ├── onSwipeRight (Carrinho)
│   └── Animações
│
├── loading-spinner.tsx
│   ├── message
│   └── fullScreen
│
└── empty-state.tsx
    ├── icon
    ├── title
    ├── message
    └── action button
```

## 🔌 Camada de Services

```
Services Layer (API Calls)
│
├── category.service.ts
│   ├── getAll()
│   ├── getById(id)
│   ├── create(data)
│   ├── update(data)
│   └── delete(id)
│
├── item.service.ts
│   ├── getAll()
│   ├── getByCategory(categoryId)
│   ├── search(query)
│   └── CRUD operations
│
├── shopping-list.service.ts
│   ├── getAll()
│   ├── moveToCart(item, price)
│   └── CRUD operations
│
├── cart.service.ts
│   ├── getAll()
│   ├── getSummary()
│   ├── clear()
│   └── CRUD operations
│
├── pantry.service.ts
│   ├── getAll()
│   ├── getAlerts()
│   ├── getLowStockItems()
│   └── CRUD operations
│
└── purchase.service.ts
    ├── getAll()
    ├── getStats(startDate, endDate)
    ├── create(purchaseData)
    └── delete(id)
```

## 🪝 Hooks (React Query)

```
Features Hooks
│
├── use-categories.ts
│   ├── useCategories()
│   ├── useCategory(id)
│   ├── useCreateCategory()
│   ├── useUpdateCategory()
│   └── useDeleteCategory()
│
├── use-items.ts
│   ├── useItems()
│   ├── useItem(id)
│   ├── useItemsByCategory(categoryId)
│   ├── useSearchItems(query)
│   └── CRUD mutations
│
├── use-shopping-list.ts
│   ├── useShoppingList()
│   ├── useMoveToCart()
│   └── CRUD mutations
│
├── use-cart.ts
│   ├── useCart()
│   ├── useCartSummary()
│   ├── useClearCart()
│   └── CRUD mutations
│
├── use-pantry.ts
│   ├── usePantry()
│   ├── usePantryAlerts()
│   ├── usePantrySummary()
│   ├── useLowStockItems()
│   └── CRUD mutations
│
└── use-purchases.ts
    ├── usePurchases()
    ├── usePurchase(id)
    ├── usePurchaseStats(dates)
    ├── useCreatePurchase()
    └── useDeletePurchase()
```

## 🎯 Estado e Cache

```
┌──────────────────────────────────────────┐
│         React Query Cache                 │
│  ┌────────────────────────────────────┐  │
│  │  Query Keys Organization            │  │
│  ├────────────────────────────────────┤  │
│  │  ['categories']                     │  │
│  │  ['items']                          │  │
│  │  ['shopping-list']                  │  │
│  │  ['cart']                           │  │
│  │  ['pantry']                         │  │
│  │  ['purchases']                      │  │
│  └────────────────────────────────────┘  │
│                                           │
│  Stale Time: 5 minutos                   │
│  Cache Time: 10 minutos                  │
│  Retry: 2 tentativas                     │
└──────────────────────────────────────────┘

┌──────────────────────────────────────────┐
│         Zustand Store (opcional)          │
│  ┌────────────────────────────────────┐  │
│  │  Estado Global                      │  │
│  ├────────────────────────────────────┤  │
│  │  - User preferences                 │  │
│  │  - Theme settings                   │  │
│  │  - Temporary UI state               │  │
│  └────────────────────────────────────┘  │
└──────────────────────────────────────────┘
```

## 🔐 Segurança (RLS - Row Level Security)

```
Supabase RLS Policies
│
├── Todas as tabelas têm RLS habilitado
│
├── Políticas por tabela:
│   ├── SELECT: WHERE user_id = auth.uid()
│   ├── INSERT: WITH CHECK user_id = auth.uid()
│   ├── UPDATE: WHERE user_id = auth.uid()
│   └── DELETE: WHERE user_id = auth.uid()
│
└── Resultado: Cada usuário vê apenas seus dados
```

## 📊 Performance e Otimizações

```
Otimizações Implementadas
│
├── React Query
│   ├── Cache automático
│   ├── Deduplicação de requests
│   ├── Background refetch
│   └── Optimistic updates
│
├── Supabase
│   ├── Índices em colunas frequentemente consultadas
│   ├── Queries otimizadas com joins
│   └── RLS para segurança e filtro automático
│
└── React Native
    ├── FlatList com windowSize otimizado
    ├── Lazy loading de telas
    └── Image caching (expo-image)
```

## 🎨 Temas (Light/Dark)

```
Theme System
│
├── Colors Object
│   ├── light
│   │   ├── primary: #E6C77A
│   │   ├── background: #FFFFFF
│   │   ├── card: #FAF7F2
│   │   └── text: #3A3835
│   │
│   └── dark
│       ├── primary: #E6C77A
│       ├── background: #12110F
│       ├── card: #23201C
│       └── text: #FFFFFF
│
└── useColorScheme()
    └── Retorna 'light' ou 'dark'
```

## 🔄 Ciclo de Vida Completo de um Item

```
1. [Admin] Criar Categoria
   └─▶ POST /categories

2. [Admin] Criar Item
   └─▶ POST /items
       └─▶ {name, category_id, ...}

3. [User] Adicionar à Lista
   └─▶ POST /shopping_list_items
       └─▶ {item_id, quantity, priority}

4. [User] Swipe Right (Adicionar ao Carrinho)
   └─▶ POST /cart_items
       └─▶ {item_id, quantity, price}
   └─▶ DELETE /shopping_list_items/{id}

5. [User] Finalizar Compra
   └─▶ POST /purchases
       └─▶ {total_value, store_name}
   └─▶ POST /purchase_items (bulk)
       └─▶ Para cada item do carrinho
   └─▶ POST /pantry_items (bulk)
       └─▶ Para cada item comprado
   └─▶ DELETE /cart_items (bulk)
       └─▶ Limpar carrinho

6. [System] Item agora está na Despensa
   └─▶ Monitoramento automático:
       ├─▶ Validade
       ├─▶ Estoque mínimo
       └─▶ Alertas automáticos

7. [System] Sugestões Inteligentes
   └─▶ Se quantidade < minimum_stock
       └─▶ Sugerir adicionar à lista
```

Esta estrutura oferece uma visão completa de como o aplicativo está organizado! 🎉
