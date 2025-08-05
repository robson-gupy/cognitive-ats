-- Script para limpar aplicações duplicadas antes de aplicar índices únicos
-- Remove duplicatas mantendo apenas a primeira inscrição de cada email/celular por vaga

-- Remover duplicatas de email por vaga
DELETE FROM applications 
WHERE id IN (
  SELECT id FROM (
    SELECT id,
           ROW_NUMBER() OVER (
             PARTITION BY job_id, email 
             ORDER BY created_at
           ) as rn
    FROM applications 
    WHERE email IS NOT NULL
  ) t 
  WHERE t.rn > 1
);

-- Remover duplicatas de celular por vaga
DELETE FROM applications 
WHERE id IN (
  SELECT id FROM (
    SELECT id,
           ROW_NUMBER() OVER (
             PARTITION BY job_id, celular 
             ORDER BY created_at
           ) as rn
    FROM applications 
    WHERE celular IS NOT NULL
  ) t 
  WHERE t.rn > 1
); 