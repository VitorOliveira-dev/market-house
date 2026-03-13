# 🏠🛒 Market House

> Aplicativo mobile para gestão pessoal de compras e despensa

Um app simples, funcional e intuitivo para gerenciar suas compras e controlar o estoque da sua casa. Desenvolvido com React Native, Expo e Supabase.

[![React Native](https://img.shields.io/badge/React%20Native-0.81-blue.svg)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-54-black.svg)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Latest-green.svg)](https://supabase.com/)

## ⚡ Quick Start

```bash
# 1. Instalar dependências
npm install

# 2. Configurar ambiente
cp .env.example .env
# Edite .env com suas credenciais do Supabase

# 3. Iniciar o app
npm start
```

📖 **[Leia o Guia Completo →](QUICK_START.md)**

## ✨ Funcionalidades

### 🛒 Lista de Compras
- ✅ Adicionar itens com quantidade e prioridade
- ✅ **Swipe ←** para excluir
- ✅ **Swipe →** para adicionar ao carrinho
- ✅ Organização visual clara

### 💰 Carrinho
- ✅ Itens com preços e quantidades
- ✅ Cálculo automático de totais
- ✅ Finalização de compra
- ✅ Registro de histórico

### 🏠 Despensa
- ✅ Visualização de estoque
- ✅ Alertas de produtos vencendo
- ✅ Alertas de estoque baixo
- ✅ Sugestões de recompra

### 📊 Relatórios
- ✅ Histórico de compras
- ✅ Estatísticas de gastos
- ✅ Análise por período
- ✅ Total gasto e média

## 📚 Documentação

| Documento | Descrição |
|-----------|-----------|
| **[QUICK_START.md](QUICK_START.md)** | Início rápido e comandos essenciais |
| **[PROJECT_GUIDE.md](PROJECT_GUIDE.md)** | Documentação completa do projeto |
| **[NEXT_STEPS.md](NEXT_STEPS.md)** | Próximos passos e melhorias |
| **[STRUCTURE.md](STRUCTURE.md)** | Arquitetura e estrutura visual |
| **[CODE_EXAMPLES.md](CODE_EXAMPLES.md)** | Exemplos de código prontos |

## 🛠️ Stack Tecnológica

- **[React Native](https://reactnative.dev/)** - Framework mobile
- **[Expo](https://expo.dev/)** - Plataforma de desenvolvimento
- **[TypeScript](https://www.typescriptlang.org/)** - Linguagem tipada
- **[Supabase](https://supabase.com/)** - Backend (PostgreSQL)
- **[React Query](https://tanstack.com/query)** - Estado assíncrono
- **[Zustand](https://github.com/pmndrs/zustand)** - Estado global
- **[React Native Gesture Handler](https://docs.swmansion.com/react-native-gesture-handler/)** - Gestos
- **[React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/)** - Animações

## 📱 Screenshots

```
┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│  Despensa   │  │    Lista    │  │  Carrinho   │  │   Compras   │
│             │  │             │  │             │  │             │
│  📊 Resumo  │  │  📝 Itens   │  │  🛒 Itens   │  │  📈 Stats   │
│  ⚠️ Alertas │  │  ← Excluir  │  │  💰 Total   │  │  📜 Lista   │
│  📦 Itens   │  │  → Carrinho │  │  ✅ Comprar │  │  🏪 Lojas   │
└─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘
```

## 🎨 Tema

### Light Mode
- **Primário:** `#E6C77A` (Dourado suave)
- **Fundo:** `#FFFFFF`
- **Cards:** `#FAF7F2`
- **Texto:** `#3A3835`

### Dark Mode
- **Primário:** `#E6C77A` (Dourado suave)
- **Fundo:** `#12110F`
- **Cards:** `#23201C`
- **Texto:** `#FFFFFF`

## 📁 Estrutura do Projeto

```
market-house/
├── src/
│   ├── app/              # Rotas (Expo Router)
│   ├── components/       # Componentes reutilizáveis
│   ├── features/         # Features por domínio
│   ├── services/         # API calls
│   ├── types/            # TypeScript types
│   ├── lib/              # Configurações
│   ├── utils/            # Utilitários
│   ├── constants/        # Constantes e tema
│   └── hooks/            # Hooks customizados
├── assets/               # Imagens e recursos
└── docs/                 # Documentação
```

## 🚀 Próximos Passos

1. **Configure o Supabase** (obrigatório)
   - Criar projeto
   - Executar schema SQL
   - Configurar .env

2. **Implemente Autenticação**
   - Login/Registro
   - Proteção de rotas

3. **Crie Telas CRUD**
   - Categorias
   - Itens

4. **Melhore a UX**
   - Modal de preço
   - Confirmações
   - Feedback visual

📖 **[Ver Todos os Próximos Passos →](NEXT_STEPS.md)**

## 🔧 Desenvolvimento

```bash
# Desenvolvimento
npm start              # Iniciar servidor
npm run android        # Abrir no Android
npm run ios            # Abrir no iOS
npm run web            # Abrir no navegador

# Qualidade de Código
npm run lint           # Verificar código
npm run type-check     # Verificar tipos (se configurado)

# Build
eas build --platform android
eas build --platform ios
```

## 📊 Status do Projeto

| Componente | Status |
|------------|--------|
| Estrutura Base | ✅ Completo |
| Tema e Cores | ✅ Completo |
| Tipos TypeScript | ✅ Completo |
| Services API | ✅ Completo |
| Hooks React Query | ✅ Completo |
| Componentes UI | ✅ Completo |
| Telas Principais | ✅ Completo |
| Schema SQL | ✅ Completo |
| Autenticação | ⚠️ Pendente |
| CRUD Categorias | ⚠️ Pendente |
| CRUD Itens | ⚠️ Pendente |
| Modal de Preço | ⚠️ Pendente |

## 🤝 Contribuindo

Este é um projeto pessoal, mas sugestões e melhorias são bem-vindas!

## 📝 Licença

Projeto de uso pessoal.

## 🆘 Suporte

Encontrou um problema ou tem dúvidas?

1. Consulte a [documentação](PROJECT_GUIDE.md)
2. Veja os [exemplos de código](CODE_EXAMPLES.md)
3. Leia o [guia de estrutura](STRUCTURE.md)

## 🎯 Recursos Úteis

- [Documentação do Expo](https://docs.expo.dev/)
- [Documentação do Supabase](https://supabase.com/docs)
- [React Query Docs](https://tanstack.com/query/latest)
- [React Navigation](https://reactnavigation.org/)

---

**Desenvolvido com ❤️ para facilitar o gerenciamento de compras e despensa**

⭐ Se este projeto foi útil para você, considere dar uma estrela!

