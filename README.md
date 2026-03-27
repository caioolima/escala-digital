# Escala Digital

Plataforma de educação corporativa para operação de cursos, trilhas e acompanhamento de aprendizagem em um único ambiente. O produto combina experiência do aluno, painel do criador e uma camada de autenticação com 2FA para acesso corporativo.

## Visão Geral

O projeto foi estruturado como um monorepo com frontend em Next.js, backend em NestJS e persistência em PostgreSQL via Prisma.

Na prática, a plataforma atende dois fluxos principais:

- alunos, com catálogo, trilhas, player de aulas, progresso e avaliação
- criadores e gestores, com dashboard, estrutura de cursos, publicação e acompanhamento operacional

## Principais Funcionalidades

- login segmentado para aluno e acesso corporativo
- autenticação JWT com verificação em duas etapas e dispositivos confiáveis
- catálogo de cursos e trilhas de aprendizagem
- player de aulas com marcação de progresso
- matrícula em cursos e trilhas
- dashboard de criadores com indicadores e conteúdos publicados
- criação, edição e organização de cursos, módulos e aulas
- reviews e avaliações ao final do consumo
- e-mails transacionais para acesso, verificação e comunicação de plataforma

## Capturas de Tela

### Acesso

![Tela de login da plataforma](assets/screenshots/login.png)

### Dashboard do Criador

![Painel corporativo com indicadores, cursos e ações rápidas](assets/screenshots/creator-dashboard.png)

### Catálogo do Aluno

![Experiência do aluno com destaque de curso e grade de conteúdos](assets/screenshots/catalog.png)

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
│   ├── web      # Aplicação principal em Next.js
│   └── docs     # Workspace complementar de documentação
├── packages
│   ├── ui
│   ├── eslint-config
│   └── typescript-config
├── docker-compose.yml
├── package.json
└── turbo.json
```

No backend, os módulos principais do domínio hoje são:

- `auth`: login, 2FA, dispositivos confiáveis e separação por perfil
- `courses`: cursos, módulos e aulas
- `trails`: jornadas compostas por vários cursos
- `enrollments`: matrículas e acesso do aluno
- `reviews`: feedback e avaliação
- `mail`: disparos transacionais
- `prisma`: acesso ao banco

## Modelagem de Produto

As entidades centrais do domínio incluem:

- `Company`: empresa responsável pelo ambiente
- `User`: usuário com papéis como `CREATOR` e `STUDENT`
- `Course`: curso publicado pela empresa
- `Module` e `Lesson`: estrutura interna do curso
- `Trail`: agrupamento de cursos em uma jornada
- `Enrollment` e `TrailEnrollment`: matrículas
- `LessonProgress`: progresso por aula
- `Review`: avaliação do curso
- `TrustedDevice`: controle de dispositivos confiáveis

## Fluxos Principais

### Aluno

- faz login na área de aprendizagem
- acessa cursos e trilhas
- consome aulas no player
- avança no progresso
- avalia o curso ao final

### Criador

- acessa o painel corporativo
- cria cursos, módulos e trilhas
- publica conteúdos
- acompanha indicadores de operação
- libera acesso para alunos

## Execução Local

### Requisitos

- Node.js 18+
- npm 11+
- Docker e Docker Compose

### 1. Instale as dependências

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

### 3. Configure as variáveis de ambiente

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

### 5. Inicie a aplicação

```bash
npm --workspace api run start:dev
npm --workspace web run dev
```

Endereços locais:

- frontend: [http://localhost:3000](http://localhost:3000)
- API: [http://localhost:3001/api](http://localhost:3001/api)

## Scripts Úteis

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

## Observações

- o workspace `docs` existe no monorepo, mas hoje não é necessário para rodar o fluxo principal de `web` e `api`
- o setup local mais estável continua sendo iniciar `web` e `api` separadamente

## Roadmap Técnico

- adicionar `.env.example` por workspace
- incluir CI para lint, typecheck e testes
- ampliar cobertura de testes na API
- consolidar o papel do workspace `docs`
- documentar estratégia de deploy e ambientes

## Licença

Projeto disponibilizado para demonstração técnica.
