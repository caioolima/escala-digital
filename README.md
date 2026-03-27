# Escala Digital

Plataforma de educacao corporativa para operacao de cursos, trilhas e acompanhamento de aprendizagem em um unico ambiente. O produto combina experiencia do aluno, painel do criador e uma camada de autenticacao com 2FA para acesso corporativo.

## Visao Geral

O projeto foi estruturado como um monorepo com frontend em Next.js, backend em NestJS e persistencia em PostgreSQL via Prisma.

Na pratica, a plataforma atende dois fluxos principais:

- alunos, com catalogo, trilhas, player de aulas, progresso e avaliacao
- criadores e gestores, com dashboard, estrutura de cursos, publicacao e acompanhamento operacional

## Principais Funcionalidades

- login segmentado para aluno e acesso corporativo
- autenticacao JWT com verificacao em duas etapas e trusted devices
- catalogo de cursos e trilhas de aprendizagem
- player de aulas com marcacao de progresso
- matricula em cursos e trilhas
- dashboard de criadores com indicadores e conteudos publicados
- criacao, edicao e organizacao de cursos, modulos e aulas
- reviews e avaliacoes ao final do consumo
- emails transacionais para acesso, verificacao e comunicacao de plataforma

## Screenshots

### Acesso

![Tela de login da plataforma](assets/screenshots/login.png)

### Dashboard do Criador

![Painel corporativo com indicadores, cursos e acoes rapidas](assets/screenshots/creator-dashboard.png)

### Catalogo do Aluno

![Experiencia do aluno com destaque de curso e grade de conteudos](assets/screenshots/catalog.png)

## Stack

### Frontend

- Next.js 16
- React 19
- Tailwind CSS 4
- Framer Motion
- Radix UI
- Axios

### Backend

- NestJS 11
- Prisma ORM
- PostgreSQL
- JWT
- class-validator
- bcrypt

### Monorepo

- Turborepo
- npm workspaces
- TypeScript
- ESLint
- Prettier

## Arquitetura

```text
.
├── apps
│   ├── api      # API NestJS + Prisma
│   ├── web      # Aplicacao principal em Next.js
│   └── docs     # Workspace complementar de documentacao
├── packages
│   ├── ui
│   ├── eslint-config
│   └── typescript-config
├── docker-compose.yml
├── package.json
└── turbo.json
```

No backend, os modulos principais do dominio hoje sao:

- `auth`: login, 2FA, trusted devices e separacao por perfil
- `courses`: cursos, modulos e aulas
- `trails`: jornadas compostas por varios cursos
- `enrollments`: matriculas e acesso do aluno
- `reviews`: feedback e avaliacao
- `mail`: disparos transacionais
- `prisma`: acesso ao banco

## Modelagem de Produto

As entidades centrais do dominio incluem:

- `Company`: empresa responsavel pelo ambiente
- `User`: usuario com papeis como `CREATOR` e `STUDENT`
- `Course`: curso publicado pela empresa
- `Module` e `Lesson`: estrutura interna do curso
- `Trail`: agrupamento de cursos em uma jornada
- `Enrollment` e `TrailEnrollment`: matriculas
- `LessonProgress`: progresso por aula
- `Review`: avaliacao do curso
- `TrustedDevice`: controle de dispositivos confiaveis

## Fluxos Principais

### Aluno

- faz login na area de aprendizagem
- acessa cursos e trilhas
- consome aulas no player
- avanca no progresso
- avalia o curso ao final

### Criador

- acessa o painel corporativo
- cria cursos, modulos e trilhas
- publica conteudos
- acompanha indicadores de operacao
- libera acesso para alunos

## Execucao Local

### Requisitos

- Node.js 18+
- npm 11+
- Docker e Docker Compose

### 1. Instale as dependencias

```bash
npm install
```

### 2. Suba o PostgreSQL

```bash
docker-compose up -d
```

Banco local:

- host: `localhost`
- porta: `5438`
- database: `course_platform`
- user: `postgres`
- password: `postgres`

### 3. Configure as variaveis de ambiente

Crie um arquivo `.env` em `apps/api`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5438/course_platform?schema=public"
JWT_SECRET="super-secret"
JWT_EXPIRES_IN="7d"
PORT=3001
FRONTEND_URL="http://localhost:3000"
WEB_APP_URL="http://localhost:3000"
SMTP_USER=""
SMTP_PASS=""
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="465"
SMTP_SECURE="true"
SMTP_FROM=""
EMAIL_WEBHOOK_URL=""
EMAIL_WEBHOOK_TOKEN=""
```

Crie um arquivo `.env.local` em `apps/web`:

```env
NEXT_PUBLIC_API_URL="http://localhost:3001/api"
```

### 4. Rode migrations e seed

```bash
npx prisma migrate deploy --schema apps/api/prisma/schema.prisma
npm --workspace api run prisma:seed
```

### 5. Inicie a aplicacao

```bash
npm --workspace api run start:dev
npm --workspace web run dev
```

Enderecos locais:

- frontend: [http://localhost:3000](http://localhost:3000)
- API: [http://localhost:3001/api](http://localhost:3001/api)

## Scripts Uteis

### Na raiz

```bash
npm run dev
npm run build
npm run lint
npm run check-types
```

### Por workspace

```bash
npm --workspace web run dev
npm --workspace api run start:dev
npm --workspace web run build
npm --workspace api run test
```

## Observacoes

- o workspace `docs` existe no monorepo, mas hoje nao e necessario para rodar o fluxo principal de `web` e `api`
- o setup local mais estavel continua sendo iniciar `web` e `api` separadamente

## Roadmap Tecnico

- adicionar `.env.example` por workspace
- incluir CI para lint, typecheck e testes
- ampliar cobertura de testes na API
- consolidar o papel do workspace `docs`
- documentar estrategia de deploy e ambientes

## Licenca

Projeto disponibilizado para demonstracao tecnica.
