# Fechou! — frontend

Base oficial do frontend do **Fechou!**, um marketplace de serviços que pretende aproximar pessoas que procuram um serviço de prestadores profissionais. Esta versão estabelece a estrutura inicial para as próximas sprints; não representa o marketplace completo.

## Objetivo

Preparar uma aplicação web responsiva para descoberta de prestadores, apresentação de perfis, envio de solicitações, comunicação entre usuários e, em etapas futuras, recebimento e comparação de propostas e contratação.

## Stack

- React 19 com JavaScript e JSX.
- Vite 8 para desenvolvimento e build.
- React Router DOM 7 para navegação no cliente.
- Axios para preparar as chamadas HTTP.
- CSS convencional com variáveis, layout mobile-first e breakpoints em 480, 768, 1024 e 1440 px.
- ESLint para análise estática.

As versões resolvidas estão registradas em `package-lock.json`.

## Pré-requisitos

- Node.js 20.19+ ou 22.12+ (a versão atual do Vite requer uma dessas linhas ou mais recente).
- npm compatível com a versão do Node.js instalada.

## Instalação e execução

Na pasta `fechou-frontend`, instale exatamente as dependências registradas no lockfile:

```sh
npm ci
npm run dev
```

O Vite informa no terminal o endereço local para abrir no navegador. Para executar as verificações e gerar a versão de produção:

```sh
npm run lint
npm run build
npm run preview
```

`preview` serve localmente os arquivos já gerados em `dist/`; execute `npm run build` antes dele.

## Variáveis de ambiente

O frontend usa `VITE_API_URL` como endereço-base da API. O fallback para desenvolvimento local é `http://localhost:3001/api`.

O arquivo `.env.example` contém apenas um valor de exemplo e pode ser copiado para `.env`.

No Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Edite `VITE_API_URL` em `.env` se a API usar outro endereço. Reinicie o servidor Vite depois de alterar variáveis de ambiente. `.env` e variantes locais são ignorados pelo Git; não coloque credenciais nesses arquivos.

## Estrutura principal

```text
public/                  Arquivos estáticos públicos
docs/                    Escopo, histórias e wireframes locais
src/components/          Cabeçalho, rodapé, navegação e componentes comuns
src/pages/               Páginas associadas às rotas
src/services/            Cliente HTTP Axios compartilhado
src/styles/              Variáveis e estilos globais
src/App.jsx               Rotas e layout compartilhado
src/main.jsx              Inicialização do React e importação de estilos
```

## Rotas disponíveis

- `/` — página inicial.
- `/servicos` — espaço inicial para o futuro diretório de serviços; exemplos estão identificados como ilustrativos.
- `/sobre` — visão do produto e estado da fundação.
- `/diagnostico-api` — chamada `GET /health` pela instância Axios configurada.
- Qualquer outra URL — página NotFound.

## Estado e próximas etapas

Já existem o layout comum, os componentes iniciais, o roteamento, o cliente HTTP e o diagnóstico com estados de carregamento, sucesso e erro. O diagnóstico informa quando a API não está disponível; não há backend mockado neste repositório.

Busca funcional de prestadores, perfis com dados reais, criação e persistência de solicitações, conversas, propostas, comparação de orçamentos, contratação e autenticação ficam para etapas futuras. A API será mantida em um repositório separado. As telas locais em `docs/wireframes/` são wireframes HTML de baixa fidelidade; a transposição para Figma e o compartilhamento de um link continuam pendentes.
