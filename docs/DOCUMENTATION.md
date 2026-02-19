# Pressroom — Documentação do Projeto

> Plataforma de geração de relatórios com editor visual drag-and-drop, data binding e exportação para PDF/HTML.

---

## Índice

1. [Visão Geral](#1-visão-geral)
2. [Arquitetura](#2-arquitetura)
3. [Stack Tecnológica](#3-stack-tecnológica)
4. [Estrutura do Monorepo](#4-estrutura-do-monorepo)
5. [Modelo de Dados (Prisma)](#5-modelo-de-dados-prisma)
6. [Autenticação e Autorização](#6-autenticação-e-autorização)
7. [Rotas da Aplicação (App Router)](#7-rotas-da-aplicação-app-router)
8. [API REST](#8-api-rest)
9. [Studio — Editor Visual](#9-studio--editor-visual)
10. [Sistema de Componentes de Relatório](#10-sistema-de-componentes-de-relatório)
11. [Motor de Data Binding](#11-motor-de-data-binding)
12. [Pipeline de Renderização](#12-pipeline-de-renderização)
13. [Sistema de Páginas e Layout](#13-sistema-de-páginas-e-layout)
14. [Header & Footer](#14-header--footer)
15. [Validação (Zod)](#15-validação-zod)
16. [Componentes de UI](#16-componentes-de-ui)
17. [Infraestrutura e DevOps](#17-infraestrutura-e-devops)
18. [Testes](#18-testes)
19. [Scripts e Comandos](#19-scripts-e-comandos)
20. [Variáveis de Ambiente](#20-variáveis-de-ambiente)

---

## 1. Visão Geral

**Pressroom** é uma plataforma de geração de relatórios que permite aos usuários:

- Criar templates visuais de relatórios através de um editor drag-and-drop (baseado no Puck Editor)
- Vincular dados dinâmicos via expressões `{{...}}` (data binding)
- Configurar tamanho de página, margens, orientação, headers e footers
- Gerar relatórios em PDF ou HTML com suporte multi-página
- Gerenciar templates com busca, tags, paginação e compartilhamento
- Organizar templates por organização com branding customizável

O projeto é um **monorepo** gerenciado com pnpm workspaces e Turborepo.

---

## 2. Arquitetura

```
┌─────────────────────────────────────────────────────────┐
│                     FRONTEND (Next.js)                  │
│                                                         │
│  ┌─────────┐    ┌──────────────┐    ┌────────────────┐  │
│  │ Landing  │    │  Dashboard   │    │     Studio     │  │
│  │  Page    │    │ (Templates)  │    │ (Puck Editor)  │  │
│  └─────────┘    └──────────────┘    └────────────────┘  │
│                         │                    │           │
│                    Server Actions       API Calls        │
│                         │                    │           │
├─────────────────────────┼────────────────────┼───────────┤
│                     BACKEND (API Routes)                 │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │ /api/templates│  │/api/reports  │  │/api/orgs      │  │
│  │   CRUD       │  │  /render     │  │  CRUD         │  │
│  └──────────────┘  └──────┬───────┘  └───────────────┘  │
│                           │                              │
│                  ┌────────▼────────┐                     │
│                  │ Rendering       │                     │
│                  │ Pipeline        │                     │
│                  │                 │                     │
│                  │ Template JSON   │                     │
│                  │    ↓            │                     │
│                  │ Data Binding    │                     │
│                  │    ↓            │                     │
│                  │ HTML Generation │                     │
│                  │    ↓            │                     │
│                  │ PDF (Puppeteer) │                     │
│                  └─────────────────┘                     │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                   INFRAESTRUTURA                        │
│                                                         │
│  ┌────────────┐  ┌─────────┐  ┌────────────────────┐   │
│  │ PostgreSQL  │  │  Redis  │  │ Puppeteer/Chrome   │   │
│  │ (Prisma)    │  │         │  │ (Browser Pool)     │   │
│  └────────────┘  └─────────┘  └────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### Fluxo Principal

1. O usuário faz login via credenciais (NextAuth.js)
2. No **Dashboard**, cria ou seleciona um template
3. No **Studio**, edita visualmente o template com componentes drag-and-drop
4. Configura **data bindings** (`{{company.name}}`, `{{formatCurrency(total, 'BRL')}}`)
5. Ao gerar o relatório, a API `/api/reports/render` executa o pipeline:
   - Resolve bindings com dados de contexto
   - Gera HTML completo a partir do Puck JSON
   - Converte para PDF via Puppeteer (Chrome headless)

---

## 3. Stack Tecnológica

| Camada          | Tecnologia                                    |
| --------------- | --------------------------------------------- |
| **Framework**   | Next.js 15 (App Router, Turbopack)            |
| **Runtime**     | Node.js ≥ 20                                  |
| **Linguagem**   | TypeScript 5.8                                |
| **UI**          | React 19, Tailwind CSS 4, Radix UI, shadcn/ui |
| **Editor**      | @puckeditor/core 0.21                         |
| **Gráficos**    | Recharts 2.15                                 |
| **Auth**        | NextAuth.js 5 (beta), bcryptjs                |
| **ORM**         | Prisma 6.19 (PostgreSQL)                      |
| **Validação**   | Zod 4                                         |
| **PDF**         | Puppeteer 24 (Chrome headless)                |
| **Monorepo**    | pnpm 10.29, Turborepo 2.5                     |
| **Testes**      | Vitest 3.1, Testing Library, jsdom            |
| **Notificação** | Sonner 2.0                                    |
| **Ícones**      | Lucide React                                  |
| **DB**          | PostgreSQL 16 (Docker)                        |
| **Cache**       | Redis 7 (Docker)                              |

---

## 4. Estrutura do Monorepo

```
pressroom/
├── apps/
│   └── web/                          # Aplicação principal (Next.js)
│       ├── app/                      # App Router (rotas e páginas)
│       │   ├── (auth)/               # Grupo de rotas de autenticação
│       │   │   ├── login/
│       │   │   └── register/
│       │   ├── (dashboard)/          # Grupo de rotas do dashboard
│       │   │   └── templates/
│       │   ├── studio/               # Editor visual
│       │   │   └── [templateId]/
│       │   └── api/                  # API REST
│       │       ├── auth/
│       │       ├── templates/
│       │       ├── reports/
│       │       └── organizations/
│       ├── components/               # Componentes React
│       │   ├── dashboard/            # Componentes do dashboard
│       │   ├── report-components/    # Blocos de relatório (Puck)
│       │   ├── studio/               # Componentes do editor
│       │   ├── templates/            # Compartilhamento
│       │   └── ui/                   # shadcn/ui primitivos
│       ├── lib/                      # Lógica de negócio
│       │   ├── auth/                 # Configuração NextAuth + registro
│       │   ├── binding/              # Motor de data binding
│       │   ├── puck/                 # Configuração do editor Puck
│       │   ├── rendering/            # Pipeline de renderização
│       │   ├── templates/            # Server actions de templates
│       │   ├── types/                # Tipos (PageConfig, HeaderFooter)
│       │   ├── utils/                # Utilitários
│       │   └── validation/           # Schemas Zod
│       ├── prisma/                   # Schema + seed do banco
│       └── __tests__/                # Testes unitários e integração
├── packages/
│   └── shared/                       # Constantes e tipos compartilhados
├── docker-compose.yml                # PostgreSQL + Redis
├── turbo.json                        # Configuração Turborepo
└── pnpm-workspace.yaml               # Workspace configuration
```

---

## 5. Modelo de Dados (Prisma)

### Diagrama de Entidades

```
┌──────────────────┐       ┌──────────────────────┐
│   Organization   │       │        User           │
├──────────────────┤       ├──────────────────────┤
│ id (cuid)        │       │ id (cuid)            │
│ name             │       │ email (unique)       │
│ slug (unique)    │       │ username (unique)    │
│ logo?            │       │ name?                │
│ primaryColor?    │       │ hashedPassword?      │
│ secondaryColor?  │       │ avatarUrl?           │
│ accentColor?     │       │ emailVerified?       │
│ fontFamily?      │       │ createdAt / updatedAt│
│ createdAt/Updated│       └──────┬───────────────┘
└──────┬───────────┘              │
       │ 1:N                      │ 1:N          1:N
       ▼                          ▼               ▼
┌──────────────────────┐   ┌──────────┐   ┌──────────┐
│     Template         │   │ Account  │   │ Session  │
├──────────────────────┤   └──────────┘   └──────────┘
│ id (cuid)            │
│ name                 │
│ description?         │
│ templateData (JSON)  │   ← Dados do editor Puck
│ sampleData (JSON)?   │   ← Dados de exemplo para binding
│ pageConfig (JSON)?   │   ← Configuração de página (tamanho, margens)
│ headerFooterConfig?  │   ← Configuração de header/footer
│ organizationId?      │
│ ownerId?             │
│ version              │
│ tags (String[])      │
│ deletedAt? (soft del)│
│ createdAt / updatedAt│
└──────┬───────────────┘
       │ 1:N
       ▼
┌──────────────────────┐
│   TemplateAccess     │
├──────────────────────┤
│ id (cuid)            │
│ templateId           │
│ userId               │   ← Usuário com acesso compartilhado
│ grantedBy            │
│ grantedAt            │
└──────────────────────┘
```

### Modelos

| Modelo             | Tabela              | Descrição                                                  |
| ------------------ | ------------------- | ---------------------------------------------------------- |
| **Organization**   | `organizations`     | Agrupamento de templates com branding (cores, logo, fonte) |
| **User**           | `users`             | Usuários com autenticação por credenciais ou OAuth         |
| **Account**        | `accounts`          | Contas OAuth vinculadas (NextAuth adapter)                 |
| **Session**        | `sessions`          | Sessões de usuário (NextAuth adapter)                      |
| **Template**       | `templates`         | Templates de relatório com dados Puck + configurações      |
| **TemplateAccess** | `template_accesses` | Controle de acesso compartilhado por template              |

---

## 6. Autenticação e Autorização

### Configuração (`lib/auth/index.ts`)

- **Provider:** Credentials (email + senha bcrypt)
- **Adapter:** PrismaAdapter (persistência automática de sessions/accounts)
- **Estratégia de sessão:** JWT
- **Callbacks:** JWT enriquecido com `user.id` propagado para `session.user.id`

### Middleware (`middleware.ts`)

| Rota                       | Comportamento                                         |
| -------------------------- | ----------------------------------------------------- |
| `/`, `/login`, `/register` | Pública. Redireciona para `/templates` se autenticado |
| `/api/auth/*`              | Pública (handlers NextAuth)                           |
| `/api/reports/health`      | Pública (health check)                                |
| `/api/*`                   | Protegida — retorna 401 se não autenticado            |
| Todas as demais            | Protegida — redireciona para `/login`                 |

### Registro (`lib/auth/actions.ts`)

Server action `registerUser`:
1. Valida input com `registerSchema` (Zod)
2. Verifica duplicidade de email/username
3. Hash da senha com bcryptjs
4. Cria usuário via Prisma

---

## 7. Rotas da Aplicação (App Router)

### Páginas Públicas

| Rota        | Arquivo                        | Tipo   | Descrição                    |
| ----------- | ------------------------------ | ------ | ---------------------------- |
| `/`         | `app/page.tsx`                 | Server | Landing page com hero e CTAs |
| `/login`    | `app/(auth)/login/page.tsx`    | Client | Formulário de login          |
| `/register` | `app/(auth)/register/page.tsx` | Client | Formulário de registro       |

### Páginas Protegidas

| Rota                   | Arquivo                              | Tipo   | Descrição                         |
| ---------------------- | ------------------------------------ | ------ | --------------------------------- |
| `/templates`           | `app/(dashboard)/templates/page.tsx` | Server | Dashboard — listagem de templates |
| `/studio/[templateId]` | `app/studio/[templateId]/page.tsx`   | Client | Editor visual do template         |

### Layouts

| Layout                       | Descrição                            |
| ---------------------------- | ------------------------------------ |
| `app/layout.tsx`             | Root layout — HTML base, globals.css |
| `app/(auth)/layout.tsx`      | Layout de autenticação               |
| `app/(dashboard)/layout.tsx` | Layout do dashboard                  |

---

## 8. API REST

### Templates

| Método   | Rota                  | Descrição                                        |
| -------- | --------------------- | ------------------------------------------------ |
| `GET`    | `/api/templates`      | Lista templates (paginado, filtros, busca, tags) |
| `POST`   | `/api/templates`      | Cria template com dados iniciais                 |
| `GET`    | `/api/templates/[id]` | Busca template por ID                            |
| `PUT`    | `/api/templates/[id]` | Atualiza template (dados, config, sample data)   |
| `DELETE` | `/api/templates/[id]` | Soft delete (seta `deletedAt`)                   |

### Reports

| Método | Rota                  | Descrição                               |
| ------ | --------------------- | --------------------------------------- |
| `POST` | `/api/reports/render` | Renderiza relatório (PDF ou HTML)       |
| `GET`  | `/api/reports/health` | Health check do serviço de renderização |

#### Render Request Body

```typescript
{
  // Fonte do template (uma das três opções):
  templateId?: string;        // Busca template do banco
  templateData?: PuckData;    // Dados Puck inline (single-page)
  pages?: TemplatePage[];     // Array de páginas (multi-page)

  // Dados de contexto para binding:
  data?: Record<string, unknown>;

  // Formato de saída:
  format?: 'pdf' | 'html';   // Default: 'pdf'

  // Configuração de página:
  pageConfig?: {
    paperSize?: string;       // 'a4', 'letter', 'legal', etc.
    orientation?: string;     // 'portrait' | 'landscape'
    margins?: { top, right, bottom, left };
  };

  // Configuração de header/footer:
  headerFooterConfig?: HeaderFooterConfig;
}
```

### Organizations

| Método | Rota                      | Descrição                                  |
| ------ | ------------------------- | ------------------------------------------ |
| `GET`  | `/api/organizations`      | Lista organizações acessíveis pelo usuário |
| `POST` | `/api/organizations`      | Cria organização com branding              |
| `GET`  | `/api/organizations/[id]` | Busca organização por ID                   |
| `PUT`  | `/api/organizations/[id]` | Atualiza organização                       |

---

## 9. Studio — Editor Visual

O Studio é o coração da aplicação. Baseado no **Puck Editor** (`@puckeditor/core`), fornece:

### Funcionalidades

- **Drag-and-drop** de componentes de relatório
- **Multi-página**: adicionar, remover, duplicar, renomear e reordenar páginas
- **Preview ao vivo** em canvas com dimensões reais de papel (72 DPI)
- **Sample Data**: painel lateral para editar dados de exemplo (JSON)
- **Header & Footer**: configuração visual com 3 zonas (esquerda, centro, direita)
- **Page Config**: configuração de tamanho de papel, margens, orientação por página
- **Undo/Redo**: integrado com o histórico do Puck
- **Download PDF**: gera PDF diretamente via API `/api/reports/render`
- **Atalhos de teclado**: `Ctrl+Shift+D` (sample data), `Ctrl+Shift+P` (preview)

### Componentes do Studio (`components/studio/`)

| Componente                        | Responsabilidade                                    |
| --------------------------------- | --------------------------------------------------- |
| `studio-header.tsx`               | Barra superior (nome, save, undo/redo, downloads)   |
| `page-tab-bar.tsx`                | Abas de páginas (add, rename, delete, reorder)      |
| `paper-canvas.tsx`                | Canvas com dimensões reais do papel + header/footer |
| `page-config-panel.tsx`           | Painel de configuração de página                    |
| `page-config-dialog.tsx`          | Dialog para edição detalhada de page config         |
| `page-settings-panel.tsx`         | Painel lateral direito com configurações da página  |
| `page-navigator.tsx`              | Navegação entre páginas                             |
| `sample-data-panel.tsx`           | Painel slide-over para sample data                  |
| `sample-data-editor.tsx`          | Editor JSON de dados de amostra                     |
| `header-footer-config-dialog.tsx` | Dialog de configuração de header/footer             |
| `page-break-selector.tsx`         | Seletor de comportamento de page break              |
| `pdf-warnings.tsx`                | Avisos sobre problemas no PDF                       |
| `right-panel.tsx`                 | Painel direito customizado (override do Puck)       |
| `block-fields-panel.tsx`          | Painel de campos de um bloco selecionado            |

---

## 10. Sistema de Componentes de Relatório

Os componentes usados dentro do editor Puck para construir relatórios:

### Categorias

#### Layout
| Componente   | Descrição                                  |
| ------------ | ------------------------------------------ |
| `Container`  | Container com padding, background e bordas |
| `GridRow`    | Linha de grid flexível                     |
| `GridColumn` | Coluna dentro de um GridRow                |
| `Section`    | Seção com título e espaçamento             |
| `Spacer`     | Espaçamento vertical configurável          |
| `Divider`    | Linha divisória horizontal                 |
| `PageBreak`  | Quebra de página para PDF                  |

#### Content
| Componente     | Descrição                               |
| -------------- | --------------------------------------- |
| `TextBlock`    | Bloco de texto com formatação           |
| `HeadingBlock` | Título (H1-H6) configurável             |
| `ImageBlock`   | Imagem com URL, dimensões e alinhamento |

#### Data
| Componente  | Descrição                                 |
| ----------- | ----------------------------------------- |
| `DataTable` | Tabela de dados com colunas configuráveis |

#### Charts
| Componente   | Descrição                                   |
| ------------ | ------------------------------------------- |
| `ChartBlock` | Gráfico (bar, line, pie, area) via Recharts |

#### Legacy (Header & Footer)
| Componente     | Descrição                                |
| -------------- | ---------------------------------------- |
| `ReportHeader` | Header de relatório (inline no conteúdo) |
| `ReportFooter` | Footer de relatório (inline no conteúdo) |

### Dual Config

O sistema mantém **duas configurações Puck**:

- **`puckConfig`** (`lib/puck/config.ts`): Usado no editor (client-side), com `ChartBlock` baseado em Recharts
- **`serverPuckConfig`** (`lib/puck/server-config.tsx`): Usado na renderização (server-side), com `ServerChartBlock` que gera SVG inline para evitar problemas com RSC e Turbopack

---

## 11. Motor de Data Binding

O motor de data binding permite vincular dados dinâmicos aos templates usando a sintaxe `{{expressão}}`.

### Arquitetura

```
Template JSON com {{...}}
        │
        ▼
┌─────────────────┐
│ resolveBindings  │   (lib/binding/index.ts)
│ Percorre JSON    │
│ recursivamente   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ parse()          │   (lib/binding/expression-parser.ts)
│ Tokeniza →  AST  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ resolveExpression│   (lib/binding/resolver.ts)
│ Executa AST      │
│ contra dados     │
└────────┬────────┘
         │ (se função)
         ▼
┌─────────────────┐
│ builtInFunctions │   (lib/binding/functions.ts)
│ formatCurrency   │
│ formatDate       │
│ formatNumber     │
│ if / uppercase   │
│ lowercase / join │
└─────────────────┘
```

### Sintaxe Suportada

| Tipo                 | Exemplo                                     | Resultado            |
| -------------------- | ------------------------------------------- | -------------------- |
| Acesso a propriedade | `{{company.name}}`                          | `"Acme Corp"`        |
| Acesso a array       | `{{items[0].name}}`                         | `"Widget A"`         |
| Texto misto          | `Total: {{summary.total}}`                  | `"Total: 1500"`      |
| Função               | `{{formatCurrency(summary.total, 'BRL')}}`  | `"R$ 1.500,00"`      |
| Condicional          | `{{if(active, 'Sim', 'Não')}}`              | `"Sim"` ou `"Não"`   |
| Formatação de data   | `{{formatDate(report.date, 'dd/MM/yyyy')}}` | `"15/01/2025"`       |
| Uppercase            | `{{uppercase(company.name)}}`               | `"ACME CORP"`        |
| Join                 | `{{join(tags, ', ')}}`                      | `"tag1, tag2, tag3"` |

### Funções Built-in

| Função           | Assinatura                       | Descrição                          |
| ---------------- | -------------------------------- | ---------------------------------- |
| `formatCurrency` | `(value, currency?)`             | Formata moeda (BRL, USD, EUR, GBP) |
| `formatDate`     | `(value, format?)`               | Formata data (padrão ou locale)    |
| `formatNumber`   | `(value, decimals?)`             | Formata número com decimais        |
| `if`             | `(condition, trueVal, falseVal)` | Condicional ternário               |
| `uppercase`      | `(value)`                        | Converte para maiúsculas           |
| `lowercase`      | `(value)`                        | Converte para minúsculas           |
| `join`           | `(array, separator?)`            | Junta array em string              |

### Segurança

- Proteção contra **prototype pollution**: bloqueia `__proto__`, `prototype`, `constructor`
- **Limite de profundidade**: 50 níveis de recursão
- **Detecção de referências circulares**: via `WeakSet`
- **Sem `eval()`**: todas as funções são explicitamente definidas

---

## 12. Pipeline de Renderização

### Módulos (`lib/rendering/`)

```
renderReport()                    ← Orquestrador principal
    │
    ├── resolveBindings()         ← Resolve {{...}} com dados
    │
    ├── generateHtml()            ← Gera HTML completo
    │   └── renderPuckData()      ← Renderiza componentes Puck → HTML
    │       └── serverPuckConfig  ← Componentes server-safe
    │
    ├── generateHeaderHtml()      ← Header HTML (se configurado)
    ├── generateFooterHtml()      ← Footer HTML (se configurado)
    │
    └── renderPdf()               ← Converte HTML → PDF
        └── getBrowser()          ← Pool de browser singleton
```

### Detalhamento

| Módulo               | Arquivo                      | Responsabilidade                                |
| -------------------- | ---------------------------- | ----------------------------------------------- |
| **Orquestrador**     | `render-report.ts`           | Coordena o pipeline completo                    |
| **Data Binding**     | `../binding/index.ts`        | Resolve expressões `{{...}}` nos dados          |
| **Geração HTML**     | `html-generator.ts`          | Converte Puck JSON → HTML com CSS inline        |
| **Header/Footer**    | `header-footer-generator.ts` | Gera HTML para headers/footers Puppeteer        |
| **Renderização PDF** | `pdf-renderer.ts`            | Converte HTML → PDF buffer via Puppeteer        |
| **Browser Pool**     | `browser-pool.ts`            | Gerencia instância singleton do Chrome          |
| **Rate Limiter**     | `rate-limiter.ts`            | Limita requisições por usuário (sliding window) |

### Browser Pool

- Instância **singleton** do Puppeteer/Chrome
- Proteção contra **race conditions** via `launchPromise` compartilhado
- Flags otimizadas: `--disable-dev-shm-usage`, `--no-sandbox` (container)
- Limite de **10 páginas concorrentes** no pdf-renderer

### Rate Limiter

- **Sliding window** de 60 segundos
- Default: **10 requisições/minuto** por usuário
- Configurável via `RENDER_RATE_LIMIT_PER_MINUTE`
- Limpeza periódica de entradas expiradas

---

## 13. Sistema de Páginas e Layout

### Tipos (`lib/types/page-config.ts`)

```typescript
interface PageConfig {
  paperSize: PaperSize;           // 'a4' | 'letter' | 'legal' | ...
  orientation: Orientation;       // 'portrait' | 'landscape'
  margins: PageMargins;           // { top, right, bottom, left }
  marginPreset: MarginPreset;     // 'normal' | 'narrow' | 'wide' | 'custom'
}
```

### Tamanhos de Papel Suportados

| Nome   | Dimensões (mm) |
| ------ | -------------- |
| A4     | 210 × 297      |
| Letter | 215.9 × 279.4  |
| Legal  | 215.9 × 355.6  |

### Sistema de Unidades

- **Armazenamento**: 72 DPI pixels (PDF points)
- **Renderização PDF**: convertido para milímetros (Puppeteer)
- **Preview no Studio**: escalonado para tela com `pxToScreen()`

### Funções Utilitárias

| Função                      | Descrição                                    |
| --------------------------- | -------------------------------------------- |
| `getPageDimensions`         | Retorna largura/altura em mm                 |
| `pxToMm` / `mmToPx`         | Convertem entre pixels (72 DPI) e milímetros |
| `pageConfigToRenderOptions` | Converte PageConfig → PdfRenderOptions       |
| `mergePageConfig`           | Merge de override por página                 |

---

## 14. Header & Footer

### Configuração (`lib/types/header-footer-config.ts`)

Cada header/footer possui:
- **3 zonas**: esquerda, centro, direita
- **Tipos de conteúdo por zona**: `text`, `image`, `pageNumber`, `empty`
- **Borda** configurável (posição, cor, largura)
- **Cor de fundo**: opcional
- **Altura**: em pixels (72 DPI)
- **Override por página**: permite customizar por página específica

### Tipos de Conteúdo de Zona

| Tipo         | Campos                         | Exemplo                   |
| ------------ | ------------------------------ | ------------------------- |
| `text`       | `content`, `fontSize`, `color` | `{{company.name}}`        |
| `image`      | `src`, `width`, `height`       | Logo da empresa           |
| `pageNumber` | `format`                       | `"Página {n} de {total}"` |
| `empty`      | —                              | Zona vazia                |

### Geração (`lib/rendering/header-footer-generator.ts`)

- Layout em **tabela de 3 colunas** (compatível com contexto restrito do Puppeteer)
- **CSS totalmente inline** (obrigatório para header/footer do Puppeteer)
- Suporte a **Puppeteer classes**: `.pageNumber`, `.totalPages`
- Resolução de **bindings** (`{{...}}`) no conteúdo de texto

---

## 15. Validação (Zod)

### Schemas (`lib/validation/`)

| Schema                     | Arquivo                    | Propósito                            |
| -------------------------- | -------------------------- | ------------------------------------ |
| `loginSchema`              | `auth-schemas.ts`          | Login (email + password)             |
| `registerSchema`           | `auth-schemas.ts`          | Registro (name, email, username, pw) |
| `templateCreateSchema`     | `template-schemas.ts`      | Criação de template                  |
| `templateUpdateSchema`     | `template-schemas.ts`      | Atualização de template              |
| `templateListQuerySchema`  | `template-schemas.ts`      | Query params de listagem             |
| `puckDataSchema`           | `template-schemas.ts`      | Estrutura de dados Puck              |
| `renderRequestSchema`      | `render-schemas.ts`        | Request de rendering                 |
| `headerFooterConfigSchema` | `header-footer-schemas.ts` | Configuração header/footer           |

---

## 16. Componentes de UI

### Dashboard (`components/dashboard/`)

| Componente            | Descrição                                 |
| --------------------- | ----------------------------------------- |
| `template-card.tsx`   | Card de template com preview, tags, ações |
| `template-grid.tsx`   | Grid responsivo de template cards         |
| `template-search.tsx` | Barra de busca e filtros                  |
| `empty-state.tsx`     | Estado vazio quando não há templates      |

### UI Primitivos (`components/ui/`) — shadcn/ui

`badge`, `button`, `card`, `dialog`, `dropdown-menu`, `input`, `label`, `separator`, `skeleton`, `tooltip`, `user-avatar`, `user-dropdown`

---

## 17. Infraestrutura e DevOps

### Docker Compose

| Serviço      | Imagem             | Porta     | Volume          |
| ------------ | ------------------ | --------- | --------------- |
| **postgres** | postgres:16-alpine | 5433:5432 | `postgres_data` |
| **redis**    | redis:7-alpine     | 6379:6379 | `redis_data`    |

### Puppeteer / Chrome

- O Chrome é instalado separadamente via `@puppeteer/browsers`
- Cache padrão: `~/.cache/puppeteer`
- Para Docker: configurar `PUPPETEER_CACHE_DIR`
- Flags de container: `--no-sandbox`, `--disable-dev-shm-usage`

---

## 18. Testes

O projeto usa **Vitest** com cobertura extensiva. Estrutura de testes em `__tests__/`:

### Categorias de Testes

| Diretório    | Escopo                                            |
| ------------ | ------------------------------------------------- |
| `api/`       | Testes das API routes (render, templates)         |
| `auth/`      | Schemas de auth, middleware                       |
| `binding/`   | Parser de expressões, funções, resolver           |
| `dashboard/` | Componentes do dashboard                          |
| `lib/`       | Utilitários (page-config-utils)                   |
| `puck/`      | Componentes Puck, config, registry                |
| `rendering/` | Pipeline completo (browser pool, HTML, PDF, etc.) |
| `studio/`    | Todos os componentes do studio                    |
| `types/`     | Tipos (header-footer, page-config)                |
| `utils/`     | Utilitários (user-utils)                          |

### Execução

```bash
# Todos os testes
pnpm test

# Testes com watch
cd apps/web && pnpm vitest

# Teste específico
cd apps/web && pnpm vitest run __tests__/rendering/pdf-renderer.test.ts
```

---

## 19. Scripts e Comandos

### Root (monorepo)

```bash
pnpm dev              # Inicia todos os apps em dev mode
pnpm build            # Build de produção
pnpm test             # Executa todos os testes
pnpm lint             # Lint em todos os packages
pnpm lint:fix         # Auto-fix de lint
pnpm typecheck        # Type checking
pnpm format           # Formata com Prettier
pnpm format:check     # Verifica formatação
```

### Docker

```bash
pnpm docker:up        # Sobe PostgreSQL + Redis
pnpm docker:down      # Para containers
pnpm docker:logs      # Logs dos containers
```

### Prisma

```bash
pnpm prisma:generate       # Gera Prisma Client
pnpm prisma:migrate:dev    # Cria/aplica migration (dev)
pnpm prisma:migrate:deploy # Aplica migrations (prod)
pnpm prisma:migrate:reset  # Reset completo do banco
pnpm prisma:db:push        # Push schema sem migration
pnpm prisma:db:seed        # Executa seed
pnpm prisma:studio         # Abre Prisma Studio (GUI)
pnpm prisma:format         # Formata schema.prisma
```

---

## 20. Variáveis de Ambiente

| Variável                       | Descrição                            | Default              |
| ------------------------------ | ------------------------------------ | -------------------- |
| `DATABASE_URL`                 | URL de conexão PostgreSQL            | —                    |
| `NEXTAUTH_SECRET`              | Secret para JWT do NextAuth          | —                    |
| `NEXTAUTH_URL`                 | URL base da aplicação                | —                    |
| `POSTGRES_USER`                | Usuário do PostgreSQL (Docker)       | `pressroom`          |
| `POSTGRES_PASSWORD`            | Senha do PostgreSQL (Docker)         | `pressroom`          |
| `POSTGRES_DB`                  | Nome do banco (Docker)               | `pressroom`          |
| `RENDER_RATE_LIMIT_PER_MINUTE` | Limite de renders por minuto/usuário | `10`                 |
| `RENDER_TIMEOUT_MS`            | Timeout de renderização (ms)         | `60000`              |
| `PUPPETEER_CACHE_DIR`          | Diretório cache do Chrome            | `~/.cache/puppeteer` |

---

## Setup Rápido

```bash
# 1. Instalar dependências
pnpm install

# 2. Instalar Chrome para Puppeteer
pnpm dlx @puppeteer/browsers install chrome@stable

# 3. Subir banco de dados
pnpm docker:up

# 4. Configurar variáveis de ambiente
cp apps/web/.env.example apps/web/.env.local
# Editar .env.local com DATABASE_URL, NEXTAUTH_SECRET, etc.

# 5. Gerar Prisma Client e aplicar migrations
pnpm prisma:generate
pnpm prisma:migrate:dev

# 6. (Opcional) Seed do banco
pnpm prisma:db:seed

# 7. Iniciar em modo de desenvolvimento
pnpm dev
```

---

> Documentação gerada automaticamente em 18/02/2026 com base na análise estática do código-fonte.
