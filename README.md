# Central de Chamados — Como rodar

Projeto com duas partes: **frontend** (React + Vite) e **backend** (Node + Express + Prisma). As duas precisam estar rodando ao mesmo tempo, cada uma no seu próprio terminal.

## Pré-requisito

- **Node.js** instalado (versão 18 ou mais recente). Teste com:
  
  ```
  node -v
  ```
  
  Se não tiver, baixe em https://nodejs.org (versão LTS).

## 1. Organize as pastas

Deve ficar assim:

```
central-chamados/
├── frontend/
└── backend/
```

## 2. Backend (primeiro terminal)

```bash
cd central-chamados/backend
npm install
```

Copie o arquivo de exemplo de variáveis de ambiente:

- **Mac/Linux:** `cp .env.example .env`
- **Windows (PowerShell):** `Copy-Item .env.example .env`
- **Windows (CMD):** `copy .env.example .env`

Depois:

```bash
npx prisma migrate dev --name init
npm run seed
npm run dev
```

Deixe esse terminal aberto — é o servidor rodando em `http://localhost:3333`.

## 3. Frontend (segundo terminal)

```bash
cd central-chamados/frontend
npm install
```

Copie o `.env` (mesmo comando do passo anterior, adaptado à pasta `frontend`).

```bash
npm run dev
```

Abra a URL que aparecer no terminal (geralmente `http://localhost:5173`).

## 4. Testar

Contas de exemplo (senha para ambas: `123456`):

- **Cliente:** `cliente@demo.com`
- **Atendente:** `atendente@demo.com`

Ou crie uma conta nova de cliente pela própria tela de login ("Ainda não tenho conta").

## Erros comuns

- **`npx run dev` dá erro** → o comando certo é `npm run dev` (sem o `x`). `npx` é só para rodar pacotes como o `prisma`.
- **"Não foi possível conectar ao servidor"** na tela de login → o backend não está rodando, ou parou. Confira o terminal do backend.
- **Erro do Prisma sobre OpenSSL/binário** → normalmente só acontece em ambientes sandboxed (StackBlitz). Rodando localmente como este guia descreve, não deve ocorrer.
