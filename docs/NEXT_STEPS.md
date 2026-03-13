# 🚀 Próximos Passos - Market House

Este documento descreve os próximos passos para colocar o aplicativo em funcionamento e futuras melhorias.

## ✅ O Que Já Está Pronto

- ✅ Estrutura completa do projeto
- ✅ Configuração do tema (cores light/dark)
- ✅ Tipos TypeScript para todas as entidades
- ✅ Integração com Supabase configurada
- ✅ Services para todas as operações de API
- ✅ Hooks React Query para cada feature
- ✅ Componentes UI reutilizáveis
- ✅ 4 telas principais (Despensa, Lista, Carrinho, Compras)
- ✅ Navegação por tabs configurada
- ✅ Suporte a gestos de swipe
- ✅ Schema SQL completo do banco de dados

## 🎯 Próximos Passos Imediatos

### 1. Configurar Supabase (OBRIGATÓRIO)

1. **Criar conta no Supabase**
   - Acesse: https://supabase.com
   - Crie uma conta gratuita
   - Crie um novo projeto

2. **Executar o Schema SQL**
   ```
   - Abra o SQL Editor no Supabase
   - Copie o conteúdo de: src/lib/supabase-schema.sql
   - Execute o script
   - Verifique se todas as tabelas foram criadas
   ```

3. **Configurar Variáveis de Ambiente**
   ```bash
   # Copie o arquivo de exemplo
   cp .env.example .env
   
   # Edite .env e adicione suas credenciais
   EXPO_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=sua-chave-aqui
   ```
   
   Para encontrar suas credenciais:
   - No Supabase: Settings > API
   - Copie a "Project URL" e "anon public" key

### 2. Testar o Aplicativo

```bash
# Instalar dependências (se ainda não instalou)
npm install

# Iniciar o app
npm start

# Escolha a plataforma:
# - Pressione 'a' para Android
# - Pressione 'i' para iOS
# - Pressione 'w' para Web
```

### 3. Implementar Autenticação (IMPORTANTE)

Atualmente, o app não tem autenticação. Você precisa adicionar:

**Opção 1: Autenticação Simples (Recomendado para início)**
```typescript
// Criar src/features/auth/hooks/use-auth.ts
import { supabase } from '@/lib/supabase';

export function useAuth() {
  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    return { data, error };
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  return { signUp, signIn, signOut };
}
```

**Opção 2: Usar um Provider Pronto**
- Considere usar: `@supabase/auth-helpers-react`
- Ou implementar com contexto React

### 4. Criar Telas de Gestão (ESSENCIAL)

Você precisa criar telas para:

#### A. Gerenciar Categorias
```
src/app/categories/
  ├── index.tsx           # Lista de categorias
  ├── create.tsx          # Criar categoria
  └── [id]/edit.tsx       # Editar categoria
```

#### B. Gerenciar Itens
```
src/app/items/
  ├── index.tsx           # Lista de itens
  ├── create.tsx          # Criar item
  └── [id]/edit.tsx       # Editar item
```

#### C. Adicionar Item à Lista
```
src/app/shopping-list/
  └── add.tsx             # Adicionar item à lista
```

#### D. Editar Item do Carrinho
```
src/app/cart/
  └── [id]/edit.tsx       # Editar preço/quantidade
```

### 5. Melhorar Experiência do Usuário

#### A. Adicionar Modal de Preço
Quando o usuário faz swipe para adicionar ao carrinho, mostrar modal para inserir o preço:

```typescript
// Exemplo de implementação
const [selectedItem, setSelectedItem] = useState<ShoppingListItem | null>(null);
const [showPriceModal, setShowPriceModal] = useState(false);

const handleSwipeRight = (item: ShoppingListItem) => {
  setSelectedItem(item);
  setShowPriceModal(true);
};

// Modal com Input de preço
// Ao confirmar, chama useMoveToCart com o preço informado
```

#### B. Adicionar Confirmações
```typescript
import { Alert } from 'react-native';

// Antes de excluir
Alert.alert(
  'Excluir Item',
  'Tem certeza que deseja excluir este item?',
  [
    { text: 'Cancelar', style: 'cancel' },
    { text: 'Excluir', style: 'destructive', onPress: handleDelete }
  ]
);
```

#### C. Adicionar Toast/Feedback
```bash
npm install react-native-toast-message
```

### 6. Adicionar Funcionalidades Úteis

#### A. Scanner de Código de Barras
```bash
npm install expo-barcode-scanner
```

#### B. Busca de Itens
Já tem o hook `useSearchItems`, só precisa criar a UI.

#### C. Filtros e Ordenação
- Filtrar itens por categoria
- Ordenar por nome, preço, data
- Filtrar compras por período

## 🎨 Melhorias de UI/UX Sugeridas

### 1. Loading States
- Adicionar skeletons durante carregamento
- Feedback visual em ações

### 2. Animações
```bash
npm install react-native-animatable
```

### 3. Ícones das Categorias
- Permitir escolher ícone ao criar categoria
- Usar Ionicons para representar cada categoria

### 4. Imagens dos Produtos
- Permitir upload de fotos
- Usar Supabase Storage

### 5. Tutorial Inicial
- Mostrar tutorial na primeira vez
- Explicar os gestos de swipe

## 📊 Funcionalidades Avançadas

### 1. Relatórios e Gráficos
```bash
npm install react-native-chart-kit
```

Implementar:
- Gráfico de gastos por mês
- Gráfico de gastos por categoria
- Comparação com mês anterior

### 2. Notificações
```bash
npm install expo-notifications
```

Notificar sobre:
- Produtos vencendo
- Estoque baixo
- Lembrete de compras

### 3. Compartilhamento
- Compartilhar lista de compras
- Colaboração em tempo real
- Sincronização entre dispositivos

### 4. Modo Offline
```bash
npm install @tanstack/react-query-persist-client
npm install @react-native-async-storage/async-storage
```

### 5. Sugestões Inteligentes
- Produtos frequentemente comprados juntos
- Sugestão baseada em histórico
- Previsão de quando comprar novamente

## 🔧 Ajustes Técnicos Recomendados

### 1. Validação de Formulários
```bash
npm install react-hook-form zod @hookform/resolvers
```

### 2. Tratamento de Erros
- Criar error boundary
- Melhorar mensagens de erro
- Log de erros (Sentry)

### 3. Testes
```bash
npm install --save-dev @testing-library/react-native jest
```

### 4. CI/CD
- Configurar GitHub Actions
- Automatizar build
- Testes automáticos

### 5. Performance
- Implementar React.memo onde necessário
- Lazy loading de telas
- Otimizar queries do Supabase

## 📱 Deployment

### Android
```bash
# Build de produção
eas build --platform android

# Ou build local
npm run android --variant=release
```

### iOS
```bash
# Build de produção
eas build --platform ios
```

### Web
```bash
npm run web
npx expo export:web
```

## 🐛 Bugs Conhecidos / TODO

- [ ] Adicionar autenticação
- [ ] Criar telas de CRUD para categorias
- [ ] Criar telas de CRUD para itens
- [ ] Implementar modal de preço ao mover para carrinho
- [ ] Adicionar pesquisa de itens
- [ ] Melhorar tratamento de erros
- [ ] Adicionar feedback visual (toast)
- [ ] Implementar filtros nas listas
- [ ] Adicionar suporte a imagens
- [ ] Implementar modo offline

## 💡 Dicas de Desenvolvimento

1. **Comece Simples**: Primeiro faça funcionar, depois melhore
2. **Teste Frequentemente**: Teste cada funcionalidade antes de prosseguir
3. **Use o Expo Go**: Mais rápido para desenvolvimento inicial
4. **Console do Supabase**: Use para verificar se os dados estão sendo salvos
5. **React Query Devtools**: Útil para debug (disponível apenas no web)

## 📚 Recursos Úteis

- [Documentação Expo](https://docs.expo.dev/)
- [Documentação Supabase](https://supabase.com/docs)
- [React Query Docs](https://tanstack.com/query/latest)
- [React Navigation](https://reactnavigation.org/)
- [Expo Icons](https://icons.expo.fyi/)

## 🎯 Próxima Tarefa Recomendada

**COMECE POR AQUI:**

1. Configure o Supabase e teste a conexão
2. Implemente autenticação básica (sign up / sign in)
3. Crie telas para cadastrar categorias e itens
4. Teste o fluxo completo:
   - Criar categoria → Criar item → Adicionar à lista → Mover para carrinho → Finalizar compra
5. Ajuste e melhore a UX conforme necessário

Boa sorte! 🚀
