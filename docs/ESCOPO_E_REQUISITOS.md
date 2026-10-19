# Escopo e requisitos — Fechou!

## Objetivos do projeto

Preparar um marketplace de serviços que facilite a descoberta de prestadores, a apresentação de profissionais e o contato entre consumidores e prestadores. Nas etapas seguintes, o produto pretende apoiar solicitações, comunicação, recebimento e comparação de propostas e contratação.

## Problema que o produto pretende resolver

Quem precisa contratar um serviço pode ter dificuldade para descobrir profissionais, entender o que oferecem e organizar o contato para explicar uma necessidade e avaliar alternativas.

## Proposta de solução

O Fechou! pretende reunir em um único produto a descoberta de prestadores, seus perfis, o envio de solicitações e a comunicação entre as pessoas envolvidas. A comparação de orçamentos e a contratação fazem parte da visão futura do marketplace.

## Escopo inicial do MVP

O MVP do produto prevê os seguintes fluxos, que serão implementados em etapas:

1. Descobrir prestadores por serviço.
2. Consultar o perfil e a apresentação de um prestador.
3. Criar e enviar uma solicitação de serviço.
4. Comunicar-se com a outra pessoa sobre a solicitação.
5. Receber e comparar propostas para decidir como prosseguir.

Esta sprint prepara apenas a base do frontend: identidade inicial, layout responsivo, navegação, páginas-base, componentes reutilizáveis, documentação e cliente Axios para futura API separada.

## Requisitos funcionais iniciais

- **RF01 — Descoberta:** o consumidor poderá localizar prestadores por categoria ou serviço quando o diretório for implementado.
- **RF02 — Perfil:** o consumidor poderá consultar a apresentação e as informações disponibilizadas por um prestador.
- **RF03 — Solicitação:** o consumidor poderá registrar e enviar os detalhes necessários de uma solicitação.
- **RF04 — Comunicação:** consumidor e prestador poderão trocar mensagens relacionadas a uma solicitação.
- **RF05 — Propostas:** o consumidor poderá receber e comparar propostas associadas ao serviço solicitado.
- **RF06 — Navegação do frontend:** a fundação disponibiliza páginas inicial, serviços, institucional, diagnóstico da API e uma página para rotas inexistentes.
- **RF07 — Integração preparada:** o frontend disponibiliza uma chamada HTTP configurável para verificar o endpoint `GET /health` quando a API estiver disponível.

RF01–RF05 descrevem funcionalidades planejadas do produto; não estão implementadas nesta sprint.

## Delimitação desta sprint

Não fazem parte desta sprint: implementação do diretório ou busca de prestadores, dados reais de perfis, formulários de contratação ou solicitação, envio ou persistência de mensagens, propostas, comparação de orçamentos, autenticação, banco de dados, backend, rotas de servidor ou integração com serviços externos. O diagnóstico mostra a ausência ou resposta da API sem simular um backend.
