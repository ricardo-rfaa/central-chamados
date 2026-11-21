# Central de Chamados

O **Central de Chamados** é um sistema de gerenciamento de solicitações que aproxima clientes e atendentes, permitindo registrar chamados, acompanhar atendimentos e organizar as demandas de suporte.

O projeto possui aplicações web e mobile integradas a uma API centralizada.

## Funcionalidades

O sistema oferece recursos para clientes registrarem e acompanharem solicitações, trocarem mensagens com os atendentes, consultarem seu histórico e avaliarem o atendimento.

Para os atendentes, disponibiliza gerenciamento de chamados por status, prioridade, categoria e SLA, comunicação com clientes e um painel de indicadores da operação.

Os chamados possuem numeração sequencial para facilitar sua identificação, mantendo um identificador interno único para controle do sistema.

## Acesso à aplicação

A versão web está disponível em:

**[Acessar Central de Chamados](https://central-chamados-web.vercel.app)**

O projeto também possui uma aplicação mobile desenvolvida com React Native e Expo.

## Tecnologias utilizadas

| Área | Tecnologias |
|---|---|
| Backend | Node.js, Express e Prisma |
| Frontend web | React, TypeScript e Vite |
| Aplicativo mobile | React Native e Expo |
| Banco de dados | PostgreSQL e Supabase |
| Hospedagem | Vercel |

## Arquitetura

As aplicações web e mobile consomem uma API desenvolvida com Node.js e Express. O backend utiliza Prisma para acessar o banco de dados PostgreSQL hospedado no Supabase.

```text
Aplicação Web ───┐
                 ├── API (Node.js / Express)
Aplicação Mobile ┘          │
                            ▼
                    Prisma / PostgreSQL
                         Supabase
```

## Estrutura do projeto

```text
central-chamados/
├── backend/       # API e regras de negócio
├── frontend/      # Aplicação web
├── mobile-app/    # Aplicação mobile
└── README.md
```

## Pré-requisitos

- **Node.js 26**, conforme definido no `.nvmrc`.
- **npm**.
- **Expo Go**, caso utilize um dispositivo Android físico para testar o aplicativo mobile.

Confira as versões instaladas:

```bash
node -v
npm -v
```

O Node.js está disponível em [nodejs.org](https://nodejs.org/).

## Instalação e execução local

Cada aplicação possui suas próprias dependências. Execute os procedimentos em terminais separados, a partir da raiz do repositório.

### 1. Backend

```bash
cd backend
npm install
```

Crie o arquivo `.env` a partir do `.env.example`:

```bash
cp .env.example .env
```

No Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Configure `DATABASE_URL`, `DIRECT_URL` e `JWT_SECRET` no arquivo `.env`.

As URLs de conexão podem ser obtidas em **Supabase → Connect**. Utilize a conexão apropriada para o Prisma Client e a conexão direta ou Session Pooler para as migrações.

Aplique as migrações e carregue os dados de demonstração:

```bash
npx prisma migrate deploy
npm run seed
```

Inicie a API:

```bash
npm run dev
```

Por padrão, estará disponível em `http://localhost:3333`.

### 2. Frontend web

Em outro terminal:

```bash
cd frontend
npm install
```

Crie o arquivo `.env` com base no `.env.example` e configure:

```env
VITE_API_URL="http://localhost:3333"
```

Inicie a aplicação:

```bash
npm run dev
```

O endereço local normalmente será `http://localhost:5173`.

### 3. Aplicativo mobile

Em outro terminal:

```bash
cd mobile-app
npm install
```

Crie um arquivo `.env` e configure o endereço da API:

```env
EXPO_PUBLIC_API_URL="http://SEU_IP_DA_MAQUINA:3333"
```

Escolha o endereço conforme o ambiente:

- **Navegador:** `http://localhost:3333`.
- **Celular físico:** IP local do computador, por exemplo `http://192.168.0.10:3333`. Ambos devem estar na mesma rede.
- **Emulador Android:** normalmente `http://10.0.2.2:3333`.

Inicie o Expo:

```bash
npx expo start
```

Pressione `w` para abrir no navegador, `a` para iniciar no emulador Android ou leia o QR code com o Expo Go.

**Compatibilidade:** o aplicativo utiliza Expo SDK 52. Em dispositivos Android, é possível instalar uma versão compatível do Expo Go pelo [arquivo oficial de versões](https://expo.dev/go?device=true&platform=android&sdkVersion=52). Em iPhones físicos, será necessário utilizar uma development build ou atualizar o SDK do projeto.

Se alterar o `.env` com o Expo em execução, reinicie o processo para carregar as novas configurações.

## Contas de demonstração

O seed disponibiliza contas para os perfis de cliente e atendente:

| Perfil | E-mail |
|---|---|
| Cliente | `cliente@demo.com` |
| Cliente | `joao.cliente@demo.com` |
| Atendente | `atendente@demo.com` |
| Atendente | `ana.atendente@demo.com` |

**Senha de todas as contas:** `123456`.

Também é possível criar novas contas pela tela de cadastro.

> As credenciais são destinadas exclusivamente a testes e demonstrações. Não utilize senhas de demonstração em ambientes de produção.

## Segurança

Não compartilhe arquivos `.env`, credenciais do banco de dados ou segredos JWT. Utilize valores próprios e mantenha os arquivos de ambiente fora do controle de versão.

## Contribuição

Contribuições são bem-vindas! Para propor alterações, crie uma branch a partir de `main`, implemente e teste as modificações e abra um pull request descrevendo o que foi realizado.

O projeto utiliza GitHub Actions para verificar a sintaxe e gerar o Prisma Client no backend, construir o frontend e verificar os tipos e a exportação web do aplicativo mobile. Os resultados ficam disponíveis na aba **Actions** e nos pull requests.

Para instalar as dependências respeitando as versões registradas nos arquivos de lock, utilize `npm ci` dentro da aplicação correspondente.

A versão do Node.js está definida no `.nvmrc`. Caso utilize nvm, execute `nvm use` na raiz do repositório.
