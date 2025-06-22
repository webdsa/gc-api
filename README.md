# JSON Generator

Uma aplicação web simples para gerar JSON no formato específico para ACF (Advanced Custom Fields).

## Estrutura do JSON

O JSON gerado segue a seguinte estrutura:

```json
{
  "acf": {
    "year": 2022,
    "live": {
      "enabled": false,
      "title": "#GCSession 2022 - St. Louis | Sábado - Tarde",
      "videoID": "wmjJlFI1cWM",
      "description": "Descrição do evento"
    }
  }
}
```

## Como usar

1. Clone o repositório
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Execute o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
4. Abra [http://localhost:3000](http://localhost:3000) no seu navegador
5. Preencha o formulário com os dados desejados
6. Clique em "Generate JSON" para ver o JSON formatado

## Tecnologias utilizadas

- Next.js 14
- TypeScript
- Tailwind CSS
- @tailwindcss/forms

## Deploy na Vercel

Para fazer deploy desta aplicação na Vercel:

1. Faça fork deste repositório
2. Acesse [Vercel](https://vercel.com)
3. Crie um novo projeto
4. Importe o repositório
5. A Vercel detectará automaticamente as configurações do Next.js e fará o deploy
