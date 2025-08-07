-- Script para verificar o estado atual da aplicação específica
-- Execute estas queries para verificar o estado real no banco

-- 1. Verificar o estado atual da aplicação
SELECT 
    id,
    first_name,
    last_name,
    current_stage_id,
    created_at,
    updated_at
FROM applications 
WHERE id = '1e84aac0-7617-4f34-843a-9db8ee190fe3';

-- 2. Verificar qual etapa está definida como current_stage_id
SELECT 
    a.id,
    a.first_name,
    a.last_name,
    a.current_stage_id,
    js.name as current_stage_name,
    js.description as current_stage_description,
    js.order_index as current_stage_order
FROM applications a
LEFT JOIN job_stages js ON a.current_stage_id = js.id
WHERE a.id = '1e84aac0-7617-4f34-843a-9db8ee190fe3';

-- 3. Verificar todas as etapas da vaga
SELECT 
    js.id,
    js.name,
    js.description,
    js.order_index,
    js.is_active,
    CASE WHEN js.id = (
        SELECT current_stage_id 
        FROM applications 
        WHERE id = '1e84aac0-7617-4f34-843a-9db8ee190fe3'
    ) THEN 'CURRENT' ELSE 'NOT_CURRENT' END as status
FROM job_stages js
WHERE js.job_id = '19053d12-8650-4afd-8ea4-1977d92737c1'
ORDER BY js.order_index;

-- 4. Verificar o histórico completo da aplicação
SELECT 
    ash.id,
    ash.from_stage_id,
    ash.to_stage_id,
    ash.notes,
    ash.created_at,
    from_stage.name as from_stage_name,
    to_stage.name as to_stage_name,
    u.first_name || ' ' || u.last_name as changed_by
FROM application_stage_history ash
LEFT JOIN job_stages from_stage ON ash.from_stage_id = from_stage.id
LEFT JOIN job_stages to_stage ON ash.to_stage_id = to_stage.id
LEFT JOIN users u ON ash.changed_by = u.id
WHERE ash.application_id = '1e84aac0-7617-4f34-843a-9db8ee190fe3'
ORDER BY ash.created_at DESC;

-- 5. Verificar se a etapa que você está tentando definir existe
SELECT 
    id,
    name,
    description,
    order_index,
    is_active,
    job_id
FROM job_stages 
WHERE id = '4d12ecbe-2dfd-42b1-a8f8-f8bba482684f';

-- 6. Verificar se a etapa pertence à vaga correta
SELECT 
    js.id,
    js.name,
    js.job_id,
    j.title as job_title
FROM job_stages js
LEFT JOIN jobs j ON js.job_id = j.id
WHERE js.id = '4d12ecbe-2dfd-42b1-a8f8-f8bba482684f';
