# Configuração do Supabase Auth

## Problema: Não consegue fazer login no site em produção

### Solução: Desabilitar confirmação de email

1. Acesse o [Supabase Dashboard](https://supabase.com/dashboard/project/tebnibuhffarhhcarwyt)
2. Vá em **Authentication** > **Settings** > **Email Auth**
3. Desabilite a opção **"Enable email confirmations"**
4. Clique em **Save**

### Configurações Recomendadas para Produção:

#### Site URL
- Adicione a URL do seu site Vercel em **Authentication** > **URL Configuration**
- Exemplo: `https://seu-app.vercel.app`

#### Redirect URLs
Adicione as seguintes URLs permitidas:
- `https://seu-app.vercel.app/**`
- `http://localhost:3000/**` (para desenvolvimento)

### Testando Localmente

Se quiser testar com confirmação de email habilitada:
1. Configure um provedor de email (SMTP) no Supabase
2. Ou use o Inbucket (email de teste) disponível no Supabase

### Comandos Úteis

Confirmar email de um usuário manualmente:
```sql
UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE email = 'seu@email.com';
```

Listar usuários não confirmados:
```sql
SELECT email, created_at, email_confirmed_at 
FROM auth.users 
WHERE email_confirmed_at IS NULL;
```
