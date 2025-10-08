/*
  # Remover constraint de autenticação da tabela pessoas
  
  ## Mudanças
  - Remove a constraint `pessoas_id_fkey` que liga pessoas.id ao auth.users.id
  - Isso permite criar pessoas sem necessidade de usuário autenticado
  - Adiciona default gen_random_uuid() ao campo id
*/

-- Remover constraint de foreign key para auth.users
ALTER TABLE pessoas DROP CONSTRAINT IF EXISTS pessoas_id_fkey;

-- Adicionar default para o campo id
ALTER TABLE pessoas ALTER COLUMN id SET DEFAULT gen_random_uuid();
