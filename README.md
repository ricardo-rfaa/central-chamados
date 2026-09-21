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

O valor certo depende de onde você vai testar:

- **No navegador** (`npx expo start --web`): pode usar `localhost` normalmente, igual ao frontend web:
  ```env
  EXPO_PUBLIC_API_URL="http://localhost:3333"
  ```
- **No celular real via Expo Go**: use o IP do computador na mesma rede Wi-Fi (não `localhost` — o celular não enxerga o `localhost` do computador).
- **No emulador Android do Android Studio**: normalmente o valor é:
  ```env
  EXPO_PUBLIC_API_URL="http://10.0.2.2:3333"
  ```

Se você mudar o `.env` com o Expo já aberto, pare (`Ctrl+C`) e rode `npx expo start` de novo — variáveis de ambiente só são lidas na inicialização.

Agora rode o app:

```bash
npx expo start
```

- Pressione `w` para abrir no navegador
- Pressione `a` para abrir no emulador Android
- Ou escaneie o QR code com o app **Expo Go** no celular

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
3. Abrir terminal do mobile app e rodar `npx expo start`
4. Validar que o backend está em `http://localhost:3333`
5. Testar web em `http://localhost:5173`
6. Testar mobile usando o Expo no navegador, emulador ou dispositivo

## Erros comuns

- **`npx run dev` dá erro** → o comando certo é `npm run dev` (sem o `x`). `npx` é só para rodar pacotes como o `prisma` ou o `expo`.
- **"Não foi possível conectar ao servidor"** → o backend não está rodando, ou parou. Confira o terminal do backend.
- **Mobile não consegue acessar o backend** → confira se o IP no `.env` do `mobile-app` está correto e se o celular está na mesma rede Wi-Fi do computador. `localhost` só funciona testando pelo navegador (`npx expo start --web`), nunca em celular físico ou emulador.
- **Mobile-app na web dá "Não foi possível conectar ao servidor" mesmo com backend rodando** → CORS. O backend só libera as origens configuradas em `CORS_ORIGIN` (por padrão, `localhost:5173` e `localhost:8081` — as portas do Vite e do Expo web). Confira se o `.env` do **backend** não tem um `CORS_ORIGIN` mais antigo sobrescrevendo esses defaults, e reinicie o backend depois de qualquer mudança no `.env`.
- **Erro `expo-asset`/`expo-constants`/`expo-linking cannot be found`** ao rodar `npx expo start` → dependências do `expo-router` que precisam estar declaradas explicitamente no `package.json`. Rode `npm install` de novo depois de confirmar que o `package.json` está atualizado com essas três dependências.
- **`splash` property is not allowed** no `app.json` → o campo `splash` no nível raiz foi descontinuado a partir do SDK 52 do Expo. Use o plugin `expo-splash-screen` dentro de `plugins`, como já está configurado neste projeto.
- **`Unable to resolve "query-string"`** ao testar na web → o `expo-router` usa esse pacote internamente sem declará-lo como dependência própria. Precisa estar no `package.json` como dependência direta: `"query-string": "^7.1.3"` (não use a versão 8 ou superior, que quebra o import interno do expo-router).
- **`_ExpoSecureStore.default.deleteValueWithKeyAsync is not a function`** ao testar o mobile-app na web → `expo-secure-store` não tem implementação web por design da própria biblioteca (não simula "seguro" via localStorage, para não dar falsa sensação de segurança). O projeto já usa uma abstração (`src/lib/storage.ts`) que cai para `localStorage` na web automaticamente — se esse erro aparecer, confira se o `AuthContext.tsx` está importando de `storage.ts` e não usando `SecureStore` diretamente.

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
npx expo start
```