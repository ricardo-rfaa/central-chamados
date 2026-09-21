# Central de Chamados — Como rodar

Este projeto tem 3 partes:

- **backend**: API em Node.js + Express + Prisma
- **frontend**: painel web em React + Vite
- **mobile-app**: aplicativo em React Native + Expo

Para funcionar corretamente, o backend precisa estar rodando antes de abrir o frontend ou o app mobile.

## Primeiro: o que você precisa ter instalado

Antes de começar, confirme se o seu computador tem:

- Node.js 18 ou mais recente
- npm
- Expo CLI

Teste com:

```bash
node -v
npm -v
```

Se o Node não estiver instalado, baixe a versão LTS em:
https://nodejs.org

---

## Estrutura do projeto

Você deve ter uma pasta assim:

```bash
central-chamados/
├── backend/
├── frontend/
├── mobile-app/
├── README.md
└── ...
```

---

## 1) Rodando o backend

Abra um terminal e execute:

```bash
cd central-chamados/backend
npm install
```

Agora crie o arquivo `.env` a partir do exemplo:

- Mac/Linux:

```bash
cp .env.example .env
```

- Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

- Windows CMD:

```cmd
copy .env.example .env
```

Depois rode:

```bash
npx prisma migrate dev --name init
npm run seed
npm run dev
```

Se tudo estiver certo, o backend vai ficar disponível em:

```text
http://localhost:3333
```

> Deixe esse terminal aberto. Ele precisa continuar rodando.

---

## 2) Rodando o frontend web

Abra outro terminal e execute:

```bash
cd central-chamados/frontend
npm install
```

Crie o arquivo `.env`:

- Mac/Linux:

```bash
cp .env.example .env
```

- Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

- Windows CMD:

```cmd
copy .env.example .env
```

No frontend, o arquivo normalmente já vem assim:

```env
VITE_API_URL="http://localhost:3333"
```

Agora inicie o frontend:

```bash
npm run dev
```

Ele vai mostrar uma URL como:

```text
http://localhost:5173
```

Abra essa URL no navegador.

---

## 3) Rodando o app mobile

Abra um terceiro terminal e execute:

```bash
cd central-chamados/mobile-app
npm install
```

O app mobile precisa saber onde está o backend. Crie um arquivo `.env` dentro da pasta `mobile-app` com este conteúdo:

```env
EXPO_PUBLIC_API_URL="http://SEU_IP_DA_MAQUINA:3333"
```

Exemplo:

```env
EXPO_PUBLIC_API_URL="http://192.168.0.10:3333"
```

### Importante sobre o IP

- Se você usar celular real, use o IP do computador na mesma rede Wi‑Fi.
- Se usar emulador Android do Android Studio, normalmente o valor é:

```env
EXPO_PUBLIC_API_URL="http://10.0.2.2:3333"
```

- Não use `localhost` aqui, porque dentro do app mobile ele não aponta para o computador que está rodando o backend.

Agora rode o app:

```bash
npm start
```

Se quiser abrir diretamente:

```bash
npm run android
```

ou

```bash
npm run ios
```

ou

```bash
npm run web
```

---

## 4) Como testar o sistema

Depois de rodar tudo, teste com estas contas:

- Cliente: `cliente@demo.com`
- Atendente: `atendente@demo.com`

Senha para as duas:

```text
123456
```

Você também pode criar uma conta nova pela tela de cadastro.

---

## 5) Ordem recomendada para rodar tudo

1. Abrir terminal do backend e rodar `npm run dev`
2. Abrir terminal do frontend e rodar `npm run dev`
3. Abrir terminal do mobile app e rodar `npm start`
4. Validar que o backend está em `http://localhost:3333`
5. Testar web em `http://localhost:5173`
6. Testar mobile usando o Expo no emulador ou dispositivo

## Erros comuns

- `npx run dev` dá erro → o correto é `npm run dev`
- "Não foi possível conectar ao servidor" → backend desligado ou sem rodar
- Mobile não consegue acessar o backend → IP do computador está errado
- CORS no navegador → verifique as origens permitidas no backend

---

## Resumo rápido

Se você quiser o caminho mais simples:

```bash
# backend
cd central-chamados/backend
npm install
npx prisma migrate dev --name init
npm run seed
npm run dev

# frontend
cd ../frontend
npm install
npm run dev

# mobile
cd ../mobile-app
npm install
npm start
```
