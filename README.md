# Central de Chamados

## Sobre o projeto

O **Central de Chamados** é um sistema de gerenciamento de solicitações desenvolvido para centralizar o registro, o acompanhamento e o atendimento de chamados.

A plataforma conecta clientes e atendentes em um único ambiente, permitindo que os clientes registrem solicitações e acompanhem seu andamento, enquanto os atendentes podem organizar, gerenciar e responder aos chamados.

O projeto conta com uma aplicação web, um aplicativo mobile e uma API centralizada, proporcionando acesso às principais funcionalidades por diferentes dispositivos.

## Demonstração

O Central de Chamados está disponível para acesso em produção:

**[Acessar o sistema](https://central-chamados-web.vercel.app)**

### Telas do sistema

![Seleção de perfil](docs/images/01-selecao-perfil.jpg)

![Acesso do cliente](docs/images/02-acesso-cliente.jpg)

![Painel do atendente](docs/images/03-painel-atendente.jpg)

![Detalhes do chamado](docs/images/04-detalhes-chamado.jpg)

## Funcionalidades

O Central de Chamados disponibiliza funcionalidades específicas para clientes e atendentes.

### Área do cliente

- Cadastro e autenticação de usuários.
- Abertura de novos chamados, com descrição, categoria e prioridade.
- Acompanhamento dos chamados e seus respectivos status.
- Comunicação com os atendentes por meio de mensagens.
- Consulta ao histórico de solicitações.
- Possibilidade de recusar uma resolução e reabrir um chamado.
- Cancelamento de chamados.
- Avaliação do atendimento recebido.

### Área do atendente

- Painel para acompanhamento e gerenciamento dos chamados.
- Atendimento e comunicação com clientes por meio de mensagens.
- Atualização do andamento dos chamados.
- Consulta aos chamados e seus históricos.

### Acompanhamento dos chamados

O sistema utiliza os seguintes status para representar o ciclo de atendimento:

- **Novo:** chamado registrado e aguardando atendimento.
- **Em atendimento:** chamado em processo de análise ou resolução.
- **Resolvido:** solução apresentada ao cliente.
- **Fechado:** atendimento encerrado.
- **Cancelado:** chamado cancelado.

## Tecnologias utilizadas

| Camada | Tecnologias |
|---|---|
| Backend | Node.js, Express e Prisma |
| Frontend web | React e Vite |
| Aplicativo mobile | React Native e Expo |
| Banco de dados | PostgreSQL |
| Infraestrutura do banco | Supabase |
| Hospedagem das aplicações | Vercel |

## Arquitetura do projeto

O projeto é organizado em três aplicações independentes que trabalham em conjunto:

- **Backend:** disponibiliza a API responsável pelas regras de negócio, autenticação e comunicação com o banco de dados.
- **Frontend web:** oferece a interface para acesso e gerenciamento dos chamados pelo navegador.
- **Aplicativo mobile:** disponibiliza as principais funcionalidades do sistema em dispositivos móveis.

As aplicações web e mobile consomem a mesma API centralizada, que utiliza o Prisma para acessar o banco de dados PostgreSQL hospedado no Supabase.

### Estrutura do repositório

```text
central-chamados/
├── backend/       # API e regras de negócio
├── frontend/      # Aplicação web
├── mobile-app/    # Aplicativo React Native / Expo
└── README.md
```

## Aplicação em produção

O Central de Chamados está disponível em ambiente de produção, com suas aplicações hospedadas na Vercel e o banco de dados PostgreSQL gerenciado pelo Supabase.

- **Frontend web:** hospedado na Vercel.
- **Backend (API):** hospedado na Vercel.
- **Banco de dados:** PostgreSQL hospedado no Supabase.

O ambiente de produção permite acessar o sistema pela internet, sem a necessidade de executar as aplicações localmente.

**Acesso:** [https://central-chamados-web.vercel.app](https://central-chamados-web.vercel.app)

## Desenvolvimento local

### Pré-requisitos

Antes de iniciar, instale:

- [Node.js 26](https://nodejs.org/) — versão definida no arquivo `.nvmrc`.
- npm — gerenciador de pacotes do Node.js.
- [Expo Go](https://expo.dev/go) — caso queira executar o aplicativo em um dispositivo físico.

Verifique as versões instaladas:

```bash
node -v
npm -v
```

### 1. Backend

Acesse a pasta do backend e instale as dependências:

```bash
cd backend
npm install
```

Copie o arquivo `.env.example` para `.env`.

No Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

No macOS ou Linux:

```bash
cp .env.example .env
```

Configure as variáveis de ambiente no arquivo `.env`:

| Variável | Descrição |
|---|---|
| `DATABASE_URL` | Conexão com o PostgreSQL pelo pooler de transações do Supabase. |
| `DIRECT_URL` | Conexão direta ou pelo pooler de sessão do Supabase. |
| `JWT_SECRET` | Chave utilizada para autenticação dos usuários. |
| `PORT` | Porta de execução da API. O padrão é `3333`. |
| `CORS_ORIGIN` | Origens autorizadas a acessar a API. |

Configure as conexões do banco conforme as orientações do Supabase e os exemplos disponíveis em `.env.example`.

Execute as migrações, prepare os dados de demonstração e inicie o servidor:

```bash
npx prisma migrate dev --name init
npm run seed
npm run dev
```

Por padrão, a API estará disponível em:

`http://localhost:3333`

### 2. Frontend web

Em outro terminal, acesse a pasta do frontend:

```bash
cd frontend
npm install
```

Copie `.env.example` para `.env` e configure:

```env
VITE_API_URL="http://localhost:3333"
```

Inicie a aplicação:

```bash
npm run dev
```

Por padrão, o frontend estará disponível em:

`http://localhost:5173`

### 3. Aplicativo mobile

Em outro terminal, acesse a pasta do aplicativo:

```bash
cd mobile-app
npm install
```

Crie o arquivo `.env` com a variável:

```env
EXPO_PUBLIC_API_URL="http://SEU_IP_DA_MAQUINA:3333"
```

Substitua `SEU_IP_DA_MAQUINA` pelo endereço IP do computador quando utilizar um dispositivo físico na mesma rede Wi-Fi.

Considere os seguintes endereços conforme o ambiente:

- **Expo Web:** `localhost` pode ser utilizado.
- **Dispositivo físico:** utilize o IP local do computador na rede Wi-Fi.
- **Emulador Android:** utilize `10.0.2.2` para acessar o computador hospedeiro.

Inicie o Expo:

```bash
npx expo start
```

A partir do terminal do Expo, você poderá:

- Pressionar `w` para abrir a versão web.
- Pressionar `a` para executar no emulador Android.
- Escanear o QR Code com o Expo Go para utilizar um dispositivo físico.

Após alterar variáveis no `.env`, reinicie o servidor Expo.

### Ordem de inicialização

Para executar o sistema completo localmente:

1. Inicie o backend.
2. Inicie o frontend web.
3. Inicie o aplicativo mobile, caso queira testá-lo.

Com os serviços ativos, acesse o frontend pelo endereço `http://localhost:5173`.

A API estará disponível em `http://localhost:3333`.

## Contribuição

Contribuições são bem-vindas!

## Licença

Este projeto ainda não possui uma licença definida.
