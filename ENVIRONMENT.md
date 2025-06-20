# Configuração de Variáveis de Ambiente

## Variáveis Necessárias

### POSTGRES_URL (Obrigatória em Produção)
URL de conexão com o banco de dados Neon PostgreSQL.

**Formato:**
```
postgresql://username:password@host:port/database
```

**Exemplo:**
```
postgresql://user123:pass456@ep-cool-name-123456.us-east-1.aws.neon.tech/neondb
```

## Configuração Local

1. Crie um arquivo `.env.local` na raiz do projeto
2. Adicione a variável `POSTGRES_URL` com sua URL do Neon

```bash
# .env.local
POSTGRES_URL=postgresql://seu_usuario:sua_senha@seu_host/seu_banco
```

## Configuração no Vercel

1. Acesse o painel do Vercel
2. Vá para seu projeto
3. Clique em "Settings" > "Environment Variables"
4. Adicione a variável `POSTGRES_URL` com a URL do seu banco Neon
5. Selecione todos os ambientes (Production, Preview, Development)
6. Clique em "Save"

## Como Obter a URL do Neon

1. Acesse o [Neon Console](https://console.neon.tech)
2. Selecione seu projeto
3. Clique em "Connection Details"
4. Copie a "Connection string"
5. Use essa string como valor da variável `POSTGRES_URL`

## Verificação

Para verificar se a configuração está correta:

1. **Localmente:** Execute `npm run dev` e verifique os logs
2. **Em Produção:** Use o botão "🧪 Testar Atualização no Banco" na interface
3. **Via API:** Acesse `/api/debug/data` para ver o status do banco

## Troubleshooting

### Erro: "missing_connection_string"
- Verifique se a variável `POSTGRES_URL` está definida
- Confirme se a URL está no formato correto
- Teste a conexão diretamente no Neon Console

### Erro: "connection refused"
- Verifique se o banco Neon está ativo
- Confirme se a URL está correta
- Verifique se o IP está liberado (se necessário) 