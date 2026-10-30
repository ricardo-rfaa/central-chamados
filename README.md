# Central de Chamados

Sistema de gerenciamento de chamados com interfaces web e mobile e uma API centralizada. O projeto é organizado em três aplicações que trabalham em conjunto: backend, frontend web e aplicativo mobile.

## Objetivo

Centralizar o registro e o acompanhamento de solicitações, oferecendo uma experiência para clientes e atendentes.

## Funcionalidades

- Acesso ao sistema com perfis de cliente e atendente
- Criação de conta e autenticação
- Interface web para utilização do sistema
- Aplicativo mobile para acesso em dispositivos móveis
- API para comunicação entre as aplicações

## Tecnologias

| Camada | Tecnologias |
| --- | --- |
| Backend | Node.js, Express e Prisma |
| Frontend web | React e Vite |
| Aplicativo mobile | React Native e Expo |

## Estrutura do projeto

```text
central-chamados/
├── backend/       # API, regras de negócio e acesso a dados
├── frontend/      # Aplicação web
├── mobile-app/    # Aplicativo React Native / Expo
└── README.md
```

## Pré-requisitos

Antes de começar, instale:

- Node.js 18 ou mais recente
- npm
- Expo Go, caso queira testar em um dispositivo físico

Verifique as versões instaladas:

```bash
node -v
npm -v
```

Se necessário, instale o Node.js pela página oficial: https://nodejs.org.

## Instalação e execução

As três aplicações possuem dependências próprias. Execute os comandos a seguir na raiz do repositório, abrindo um terminal separado para cada aplicação.

### 1. Backend

Entre na pasta e instale as dependências:

```bash
cd central-chamados/backend
npm install
```

Crie o arquivo de ambiente a partir do exemplo:

- macOS/Linux:

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

Configure no arquivo `.env` os valores necessários para o seu ambiente. Em seguida, execute as migrações, carregue os dados iniciais e inicie a API:

```bash
npx prisma migrate dev --name init
npm run seed
npm run dev
```

Por padrão, a API ficará disponível em:

```text
http://localhost:3333
```

Mantenha esse terminal aberto enquanto utilizar o sistema.

### 2. Frontend web

Em outro terminal:

```bash
cd central-chamados/frontend
npm install
```

Crie o arquivo `.env` usando o mesmo procedimento da seção do backend (copiando `.env.example`). Confira se a URL da API está configurada:

```env
VITE_API_URL="http://localhost:3333"
```

Inicie a aplicação:

```bash
npm run dev
```

O Vite exibirá o endereço local, normalmente:

```text
http://localhost:5173
```

Abra o endereço informado no navegador.

### 3. Aplicativo mobile

Em um terceiro terminal:

```bash
cd central-chamados/mobile-app
npm install
```

Crie um arquivo `.env` na pasta `mobile-app` e informe o endereço da API:

```env
EXPO_PUBLIC_API_URL="http://SEU_IP_DA_MAQUINA:3333"
```

Escolha o endereço conforme o ambiente de execução:

- **Navegador (Expo web):** use `http://localhost:3333`.
- **Celular físico com Expo Go:** use o endereço IP do computador na rede Wi-Fi, por exemplo `http://192.168.0.10:3333`. O celular e o computador devem estar na mesma rede.
- **Emulador Android do Android Studio:** normalmente use `http://10.0.2.2:3333`.

Inicie o Expo:

```bash
npx expo start
```

A partir do terminal do Expo:

- Pressione `w` para abrir no navegador.
- Pressione `a` para abrir no emulador Android.
- Ou leia o QR code com o Expo Go no celular.

Se alterar o arquivo `.env` com o Expo em execução, encerre o processo com `Ctrl+C` e inicie novamente para carregar as novas variáveis.

## Acesso para demonstração

O projeto disponibiliza as seguintes contas de demonstração:

| Perfil | E-mail |
| --- | --- |
| Cliente | `cliente@demo.com` |
| Atendente | `atendente@demo.com` |

Senha para ambas as contas:

```text
123456
```

Também é possível criar uma nova conta pela tela de cadastro.

## Ordem de inicialização

Para utilizar o sistema localmente:

1. Inicie o backend com `npm run dev`.
2. Inicie o frontend web com `npm run dev`.
3. Inicie o aplicativo mobile com `npx expo start`, se for utilizá-lo.
4. Acesse o frontend em `http://localhost:5173` e confirme que a API está disponível em `http://localhost:3333`.

## Contribuição

Contribuições são bem-vindas. Para propor mudanças, crie uma branch a partir de `main`, implemente e teste suas alterações e abra um pull request descrevendo o que foi modificado.

## Licença

Consulte o arquivo de licença do repositório para informações sobre uso e distribuição.
