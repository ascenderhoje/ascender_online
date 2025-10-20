# Sistema de Avaliação de Competências

## Visão Geral

O Sistema de Avaliação de Competências é uma plataforma web completa para gerenciamento e realização de avaliações de competências de colaboradores. O sistema permite que empresas criem modelos de avaliação personalizados, gerenciem usuários e visualizem resultados de forma organizada.

## Principais Funcionalidades

- **Gerenciamento de Empresas**: Cadastro e administração de múltiplas empresas
- **Gestão de Usuários**: Três tipos de acesso (Administrador, Gestor, Colaborador)
- **Modelos de Avaliação**: Criação de modelos personalizados com competências e critérios
- **Competências e Critérios**: Biblioteca de competências com critérios de avaliação
- **Avaliações**: Criação, edição e visualização de avaliações de colaboradores
- **Grupos e Hierarquia**: Organização de colaboradores em grupos com gestores
- **Sistema de Autenticação**: Login seguro com Supabase Auth
- **Internacionalização**: Suporte a múltiplos idiomas (PT-BR, EN-US, ES-ES)

## Tipos de Usuário

### 1. Administrador
- Acesso completo ao sistema
- Gerencia empresas, usuários, competências e modelos
- Cria e gerencia avaliações
- Visualiza todas as avaliações de todas as empresas

### 2. Gestor
- Gerencia sua equipe/grupo
- Visualiza avaliações dos colaboradores sob sua responsabilidade
- Não pode editar ou criar novos recursos

### 3. Colaborador
- Acesso apenas às suas próprias avaliações
- Visualiza resultados em modo leitura
- Não pode editar ou criar recursos

## Estrutura da Documentação

Esta documentação está organizada nos seguintes arquivos:

1. **[visao-geral.md](./visao-geral.md)** - Visão geral do sistema e arquitetura
2. **[autenticacao.md](./autenticacao.md)** - Sistema de autenticação e autorização
3. **[painel-administrativo.md](./painel-administrativo.md)** - Funcionalidades do painel administrativo
4. **[painel-gestor.md](./painel-gestor.md)** - Funcionalidades do painel de gestor
5. **[painel-colaborador.md](./painel-colaborador.md)** - Funcionalidades do painel de colaborador
6. **[modelos-avaliacao.md](./modelos-avaliacao.md)** - Sistema de modelos de avaliação
7. **[competencias-criterios.md](./competencias-criterios.md)** - Gestão de competências e critérios
8. **[avaliacoes.md](./avaliacoes.md)** - Sistema de avaliações
9. **[banco-de-dados.md](./banco-de-dados.md)** - Estrutura do banco de dados

## Tecnologias Utilizadas

- **Frontend**: React 18 + TypeScript + Vite
- **Estilização**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Edge Functions)
- **Autenticação**: Supabase Auth (Email/Password)
- **Roteamento**: React Router (implementação customizada)
- **Ícones**: Lucide React

## Começando

Para informações sobre instalação e configuração, consulte o arquivo principal [README.md](../README.md) na raiz do projeto.

## Suporte

Para dúvidas ou problemas, consulte a documentação específica de cada módulo nos arquivos listados acima.
