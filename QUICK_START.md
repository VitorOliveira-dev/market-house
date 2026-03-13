# ⚡ Quick Start - Market House

## 🚀 Comandos Rápidos

### Desenvolvimento
\`\`\`bash
# Instalar dependências
npm install

# Iniciar desenvolvimento
npm start

# Plataformas específicas
npm run android    # Android
npm run ios        # iOS  
npm run web        # Web

# Lint
npm run lint
\`\`\`

### Build
\`\`\`bash
# Android
eas build --platform android

# iOS
eas build --platform ios

# Ambos
eas build --platform all
\`\`\`

## ✅ Checklist de Setup

### [ ] 1. Configuração Inicial
- [x] Projeto inicializado
- [x] Dependências instaladas
- [ ] Copiar \`.env.example\` para \`.env\`
- [ ] Configurar variáveis de ambiente

### [ ] 2. Supabase
- [ ] Criar conta no Supabase
- [ ] Criar novo projeto
- [ ] Executar SQL do arquivo \`src/lib/supabase-schema.sql\`
- [ ] Copiar URL e Anon Key para \`.env\`
- [ ] Testar conexão

### [ ] 3. Autenticação
- [ ] Implementar telas de login/registro
- [ ] Configurar Auth no Supabase
- [ ] Testar fluxo de autenticação

### [ ] 4. CRUD Básico
- [ ] Tela de categorias (listar/criar/editar/deletar)
- [ ] Tela de itens (listar/criar/editar/deletar)
- [ ] Adicionar item à lista de compras
- [ ] Testar fluxo completo

### [ ] 5. Funcionalidades Core
- [x] Lista de compras com swipe
- [x] Carrinho com preços
- [x] Finalização de compra
- [x] Visualização da despensa
- [ ] Modal de input de preço
- [ ] Busca de itens

### [ ] 6. Melhorias UX
- [ ] Loading states
- [ ] Error handling
- [ ] Toast notifications
- [ ] Confirmações de exclusão
- [ ] Tutorial inicial

## 📋 Comandos Git

\`\`\`bash
# Inicializar repositório
git init

# Adicionar arquivos
git add .

# Commit inicial
git commit -m "Initial commit: Market House project structure"

# Conectar com repositório remoto
git remote add origin YOUR_REPO_URL
git branch -M main
git push -u origin main
\`\`\`

## 🔧 Troubleshooting

### Erro: "Cannot find module '@/...'"
\`\`\`bash
# Limpar cache e reinstalar
rm -rf node_modules
npm install
npx expo start -c
\`\`\`

### Erro: Supabase não conecta
1. Verifique se o \`.env\` existe
2. Confirme as variáveis de ambiente
3. Reinicie o servidor: \`npx expo start -c\`

### Erro: Gesture Handler não funciona
\`\`\`bash
# Reinstalar dependências
npm install react-native-gesture-handler react-native-reanimated
npx expo start -c
\`\`\`

### Erro de TypeScript
\`\`\`bash
# Limpar cache do TypeScript
rm -rf .expo
rm -rf node_modules/.cache
npx expo start -c
\`\`\`

## 📱 Testando no Dispositivo

### Expo Go
1. Instale Expo Go no seu celular
2. Execute \`npm start\`
3. Escaneie o QR code

### Desenvolvimento
- Android: Precisa de Android Studio
- iOS: Precisa de Xcode (apenas no Mac)

## 🎯 Ordem Recomendada de Implementação

1. **Configure o Supabase** ⬅️ COMECE AQUI
   - Criar projeto
   - Executar SQL
   - Configurar .env

2. **Implemente Autenticação**
   - Login/Registro
   - Persistência de sessão

3. **CRUD de Categorias**
   - Listar
   - Criar
   - Editar
   - Deletar

4. **CRUD de Itens**
   - Listar
   - Criar (com categoria)
   - Editar
   - Deletar

5. **Fluxo de Compras**
   - Adicionar item à lista
   - Modal de preço ao mover para carrinho
   - Finalizar compra
   - Ver na despensa

6. **Melhorias e Polish**
   - Busca
   - Filtros
   - Estatísticas
   - Notificações

## 📚 Arquivos Importantes

\`\`\`
market-house/
├── PROJECT_GUIDE.md      ⭐ Documentação completa
├── NEXT_STEPS.md         ⭐ Próximos passos detalhados
├── STRUCTURE.md          ⭐ Estrutura visual
├── CODE_EXAMPLES.md      ⭐ Exemplos de código
├── QUICK_START.md        ⭐ Este arquivo
│
├── .env.example          📄 Copie para .env
├── src/
│   ├── lib/
│   │   └── supabase-schema.sql  📄 Execute no Supabase
│   ├── app/(tabs)/              📱 Telas principais
│   ├── components/ui/           🎨 Componentes UI
│   ├── features/                🔧 Hooks e lógica
│   ├── services/                🌐 API calls
│   └── types/                   📝 TypeScript types
\`\`\`

## 🆘 Precisa de Ajuda?

1. Leia \`PROJECT_GUIDE.md\` para visão geral
2. Consulte \`CODE_EXAMPLES.md\` para exemplos
3. Veja \`STRUCTURE.md\` para entender a arquitetura
4. Siga \`NEXT_STEPS.md\` para próximos passos

## 🎉 Primeiros Passos (5 minutos)

\`\`\`bash
# 1. Configure o ambiente
cp .env.example .env
# Edite .env com suas credenciais do Supabase

# 2. Inicie o app
npm start

# 3. Abra no Expo Go ou simulador
# Pressione 'a' para Android, 'i' para iOS, 'w' para Web
\`\`\`

## 📊 Status do Projeto

✅ **Pronto:**
- Estrutura completa do projeto
- Configuração de tema
- Tipos TypeScript
- Services e hooks
- Componentes UI
- 4 telas principais
- Schema SQL do banco

⚠️ **Pendente:**
- Configurar Supabase (você precisa fazer)
- Implementar autenticação
- Criar telas CRUD
- Ajustar UX (modais, confirmações)

🔮 **Futuro:**
- Scanner de código de barras
- Gráficos de gastos
- Notificações
- Modo offline
- Compartilhamento de listas

---

**Dica:** Comece configurando o Supabase e testando a conexão! 🚀
