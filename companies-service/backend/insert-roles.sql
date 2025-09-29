-- Script para inserir as roles necessárias para o sistema funcionar
-- Baseado no enum RoleType e método createDefaultRoles() do RolesService

-- Inserir roles padrão do sistema
INSERT INTO roles (id, name, code, description, is_active, created_at, updated_at) VALUES
(
  gen_random_uuid(),
  'Administrador',
  'ADMIN',
  'Acesso completo ao sistema',
  true,
  NOW(),
  NOW()
),
(
  gen_random_uuid(),
  'Recrutador',
  'RECRUITER',
  'Acesso para gerenciar candidatos e vagas',
  true,
  NOW(),
  NOW()
),
(
  gen_random_uuid(),
  'Gestor',
  'MANAGER',
  'Acesso para gerenciar equipes e processos',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (code) DO NOTHING;

-- Verificar se as roles foram inseridas
SELECT id, name, code, description, is_active, created_at 
FROM roles 
ORDER BY code;
