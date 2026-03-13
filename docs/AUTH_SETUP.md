# Configuração de Autenticação - Market House

## Visão Geral

O Market House utiliza Supabase Authentication para gerenciar login de usuários com duas opções:
1. **Email/Senha** - Autenticação tradicional
2. **Google OAuth** - Login social com conta Google

## 📋 Pré-requisitos

- Conta no [Supabase](https://supabase.com)
- Projeto Supabase criado
- Variáveis de ambiente configuradas (`.env`)

## 🔐 Configuração da Autenticação

### 1. Autenticação por Email (Já Configurado)

A autenticação por email já está habilitada por padrão no Supabase. Funcionalidades incluem:
- ✅ Registro de novos usuários
- ✅ Login com email/senha
- ✅ Recuperação de senha
- ✅ Confirmação de email

### 2. Configuração do Google OAuth

Para habilitar login com Google, siga os passos:

#### Passo 1: Criar Projeto no Google Cloud Console

1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione um existente
3. Vá em **APIs & Services** > **Credentials**
4. Clique em **Create Credentials** > **OAuth 2.0 Client ID**

#### Passo 2: Configurar OAuth Consent Screen

1. No menu lateral, clique em **OAuth consent screen**
2. Escolha **External** (para permitir qualquer conta Google)
3. Preencha as informações necessárias:
   - **App name**: Market House
   - **User support email**: seu email
   - **Developer contact**: seu email
4. Em **Scopes**, adicione:
   - `userinfo.email`
   - `userinfo.profile`
5. Salve e continue

#### Passo 3: Criar OAuth Client ID

1. Volte para **Credentials** > **Create Credentials** > **OAuth 2.0 Client ID**
2. **Application type**: Web application
3. **Name**: Market House Web
4. **Authorized JavaScript origins**: 
   ```
   https://seu-projeto.supabase.co
   ```
5. **Authorized redirect URIs**:
   ```
   https://seu-projeto.supabase.co/auth/v1/callback
   ```
6. Clique em **Create**
7. **Copie o Client ID e Client Secret** (você vai usar no próximo passo)

#### Passo 4: Configurar no Supabase

1. Acesse seu projeto no [Supabase Dashboard](https://app.supabase.com)
2. Vá em **Authentication** > **Providers**
3. Procure por **Google** e clique em **Enable**
4. Cole os valores:
   - **Client ID**: O Client ID do Google Cloud
   - **Client Secret**: O Client Secret do Google Cloud
5. Em **Redirect URL**, copie a URL fornecida pelo Supabase (algo como `https://seu-projeto.supabase.co/auth/v1/callback`)
6. Clique em **Save**

#### Passo 5: Configurar Deep Linking (Mobile)

Para que o OAuth funcione no mobile, você precisa configurar deep linking:

1. Abra o arquivo `app.json` e adicione o scheme:

```json
{
  "expo": {
    "scheme": "markethouse",
    "android": {
      "intentFilters": [
        {
          "action": "VIEW",
          "data": [
            {
              "scheme": "markethouse"
            }
          ],
          "category": ["BROWSABLE", "DEFAULT"]
        }
      ]
    },
    "ios": {
      "bundleIdentifier": "com.yourcompany.markethouse"
    }
  }
}
```

2. No Google Cloud Console, adicione mais uma **Authorized redirect URI**:
   ```
   markethouse://auth/callback
   ```

## 🧪 Testando a Autenticação

### Teste Email/Senha

1. Inicie o app: `npm start`
2. Navegue para a tela de **Criar conta**
3. Preencha email e senha
4. Verifique o email de confirmação na sua caixa de entrada
5. Clique no link de confirmação
6. Faça login com suas credenciais

### Teste Google OAuth

1. Na tela de login, clique em **Continuar com Google**
2. Selecione sua conta Google
3. Autorize o acesso
4. Você será redirecionado de volta para o app autenticado

## 🔒 Segurança

### Row Level Security (RLS)

Todas as tabelas do banco de dados estão protegidas com RLS. As políticas já foram configuradas no arquivo `supabase-schema.sql`:

- **INSERT**: Usuários só podem criar seus próprios registros
- **SELECT**: Usuários só podem ver seus próprios dados
- **UPDATE**: Usuários só podem atualizar seus próprios registros
- **DELETE**: Usuários só podem deletar seus próprios registros

### Proteção de Rotas

O app implementa proteção de rotas no `_layout.tsx`:
- Usuários não autenticados são redirecionados para `/auth/login`
- Usuários autenticados não podem acessar telas de auth
- Todas as telas principais requerem autenticação

## 📱 Fluxo de Autenticação

```
┌─────────────────┐
│   App Inicia    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐      Não        ┌─────────────────┐
│ Está autenticado?│ ────────────► │  Tela de Login  │
└────────┬────────┘                 └────────┬────────┘
         │ Sim                               │
         │                                   │
         ▼                                   ▼
┌─────────────────┐                 ┌─────────────────┐
│  App Principal  │                 │  Login/Register │
│   (Com Drawer)  │◄────────────────┤   Google OAuth  │
└─────────────────┘    Autenticado  └─────────────────┘
```

## 🔧 Troubleshooting

### "Error: Invalid redirect URL"
- Verifique se a URL de redirect no Google Cloud Console está correta
- Confirme se a URL do Supabase está configurada corretamente

### "User not found" ao fazer login
- Certifique-se de que confirmou o email (verifique spam/lixeira)
- Tente fazer logout completo e login novamente

### Google OAuth não abre no mobile
- Verifique se o `expo-web-browser` está instalado
- Confirme se o deep linking está configurado no `app.json`
- Reconstrua o app: `expo prebuild` (se usar bare workflow)

### RLS bloqueando operações
- Verifique se o usuário está autenticado
- Confirme que as políticas RLS permitem a operação
- Use `testSupabase()` no console para debug

## 📚 Recursos Adicionais

- [Documentação Supabase Auth](https://supabase.com/docs/guides/auth)
- [Google OAuth 2.0](https://developers.google.com/identity/protocols/oauth2)
- [Expo Authentication](https://docs.expo.dev/guides/authentication/)
- [Deep Linking no Expo](https://docs.expo.dev/guides/linking/)

## 🆘 Suporte

Se encontrar problemas:
1. Execute `testSupabase()` no console do navegador
2. Verifique os logs do Supabase Dashboard
3. Confirme que todas as variáveis de ambiente estão corretas
4. Teste primeiro no navegador web antes de testar no mobile
