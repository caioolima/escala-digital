# Escala Digital

Plataforma de educacao corporativa para publicar cursos, organizar trilhas e acompanhar a evolucao dos alunos em um unico ambiente.

## Visao Geral

O projeto foi estruturado como um monorepo com frontend em Next.js, backend em NestJS e banco PostgreSQL via Prisma.

Na pratica, a plataforma atende dois perfis principais:

- alunos, com catalogo, trilhas, player de aulas, progresso e avaliacao de cursos
- gestores/criadores, com dashboard, criacao de cursos, organizacao de trilhas e acompanhamento operacional

Tambem existe uma camada de autenticacao com separacao por perfil, verificacao em duas etapas e suporte a dispositivos confiaveis.

## Principais Funcionalidades

- login segmentado para aluno e acesso corporativo
- autenticacao JWT com 2FA por codigo e trusted devices
- area do aluno com catalogo de cursos e jornadas de aprendizagem
- player de aulas com marcacao de progresso e conclusao
- trilhas formadas por multiplos cursos
- dashboard do gestor com indicadores, cursos publicados e rascunhos
- criacao, edicao e organizacao de cursos e trilhas
- matriculas em cursos e trilhas
- avaliacoes e reviews ao final dos cursos
- emails transacionais para acesso, verificacao e novos cursos

## Arquitetura

```text
.
├── apps
│   ├── api      # API NestJS + Prisma
│   ├── web      # Aplicacao principal em Next.js
│   └── docs     # Workspace de documentacao/apoio
├── packages
│   ├── ui
│   ├── eslint-config
│   └── typescript-config
├── docker-compose.yml
├── package.json
└── turbo.json
```

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

## Modelagem de Produto

No banco, a plataforma gira em torno destas entidades:

- `Company`: empresa responsavel pelo ambiente
- `User`: usuario com papel `CREATOR` ou `STUDENT`
- `Course`: curso publicado pela empresa
- `Module` e `Lesson`: estrutura interna do curso
- `Trail`: trilha que conecta varios cursos
- `Enrollment` e `TrailEnrollment`: matriculas
- `LessonProgress`: progresso por aula
- `Review`: avaliacao do curso
- `TrustedDevice`: controle de dispositivos confiaveis para 2FA

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

O banco sobe por padrao com:

- host: `localhost`
- porta: `5438`
- database: `course_platform`
- user: `postgres`
- password: `postgres`

### 3. Configure as variaveis de ambiente

Crie um arquivo `.env` em `apps/api` com algo neste formato:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5438/course_platform?schema=public"
JWT_SECRET="super-secret"
JWT_EXPIRES_IN="7d"
PORT=3001
FRONTEND_URL="http://localhost:3000"
WEB_APP_URL="http://localhost:3000"

# opcionais
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

Em terminais separados:

```bash
npm --workspace api run start:dev
npm --workspace web run dev
```

Aplicacoes:

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

## Modulos da API

Os principais modulos do backend hoje sao:

- `auth`: autenticacao, login por perfil, 2FA e dispositivos confiaveis
- `courses`: catalogo, detalhes e operacoes de cursos
- `lessons`: conteudo e fluxo de aulas
- `trails`: agrupamento de cursos em jornadas
- `enrollments`: matriculas e acesso do aluno
- `reviews`: feedback e avaliacao de cursos
- `mail`: envio de emails transacionais
- `prisma`: acesso ao banco

## Fluxos Principais

### Aluno

- faz login com o perfil de aluno
- acessa catalogo e trilhas
- consome aulas no player
- conclui conteudos
- avalia o curso ao final

### Gestor / Criador

- acessa o ambiente corporativo
- cria cursos e trilhas
- publica conteudos
- acompanha indicadores no dashboard
- libera acesso para alunos

## Status Atual

O repositorio ainda mistura areas ja evoluidas do produto com alguns arquivos herdados de templates do Turborepo, Next.js e NestJS. O core da plataforma, no entanto, ja esta modelado em cima do dominio de educacao corporativa.

No uso local, prefira iniciar `web` e `api` separadamente. O workspace `docs` existe no monorepo, mas hoje usa a mesma faixa de porta da API e pode exigir ajuste antes de rodar em paralelo.

## Melhorias Futuras

- adicionar arquivos `.env.example` por workspace
- padronizar a documentacao interna de `apps/web` e `apps/api`
- consolidar o workspace `docs` com uma funcao mais clara
- incluir CI para lint, typecheck e testes
- documentar deploy e estrategia de ambientes

## Licenca

Uso privado do projeto.
