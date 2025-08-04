-- Script para configurar o banco de dados manualmente

-- Criar tabela users
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name varchar(100) NOT NULL,
  last_name varchar(100) NOT NULL,
  email varchar(255) UNIQUE NOT NULL,
  password varchar(255) NOT NULL,
  company_id uuid,
  department_id uuid,
  role_id uuid,
  created_at timestamp DEFAULT NOW(),
  updated_at timestamp DEFAULT NOW()
);

-- Criar tabela companies
CREATE TABLE IF NOT EXISTS companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(255) NOT NULL,
  corporate_name varchar(255) NOT NULL,
  cnpj varchar(18) UNIQUE NOT NULL,
  business_area varchar(255) NOT NULL,
  description text,
  created_at timestamp DEFAULT NOW(),
  updated_at timestamp DEFAULT NOW()
);

-- Criar tabela departments
CREATE TABLE IF NOT EXISTS departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(100) NOT NULL,
  description text,
  code varchar(10) UNIQUE NOT NULL,
  is_active boolean DEFAULT true,
  company_id uuid NOT NULL,
  created_at timestamp DEFAULT NOW(),
  updated_at timestamp DEFAULT NOW()
);

-- Criar tabela roles
CREATE TABLE IF NOT EXISTS roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(100) NOT NULL,
  code varchar(20) UNIQUE NOT NULL,
  description text,
  is_active boolean DEFAULT true,
  created_at timestamp DEFAULT NOW(),
  updated_at timestamp DEFAULT NOW()
);

-- Criar tabela jobs
CREATE TABLE IF NOT EXISTS jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title varchar(255) NOT NULL,
  description text NOT NULL,
  requirements text NOT NULL,
  expiration_date date,
  status varchar(20) DEFAULT 'DRAFT',
  company_id uuid NOT NULL,
  department_id uuid,
  created_by uuid NOT NULL,
  published_at timestamp,
  closed_at timestamp,
  created_at timestamp DEFAULT NOW(),
  updated_at timestamp DEFAULT NOW()
);

-- Criar tabela job_questions
CREATE TABLE IF NOT EXISTS job_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL,
  question text NOT NULL,
  order_index integer NOT NULL,
  is_required boolean DEFAULT true,
  created_at timestamp DEFAULT NOW(),
  updated_at timestamp DEFAULT NOW()
);

-- Criar tabela job_stages
CREATE TABLE IF NOT EXISTS job_stages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL,
  name varchar(255) NOT NULL,
  description text,
  order_index integer NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamp DEFAULT NOW(),
  updated_at timestamp DEFAULT NOW()
);

-- Criar tabela job_logs
CREATE TABLE IF NOT EXISTS job_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL,
  user_id uuid NOT NULL,
  description text NOT NULL,
  field_name varchar(100),
  old_value text,
  new_value text,
  created_at timestamp DEFAULT NOW()
);

-- Adicionar foreign keys
ALTER TABLE users ADD CONSTRAINT fk_users_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE;
ALTER TABLE users ADD CONSTRAINT fk_users_department FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL;
ALTER TABLE users ADD CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE SET NULL;

ALTER TABLE departments ADD CONSTRAINT fk_departments_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE;

ALTER TABLE jobs ADD CONSTRAINT fk_jobs_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE;
ALTER TABLE jobs ADD CONSTRAINT fk_jobs_department FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL;
ALTER TABLE jobs ADD CONSTRAINT fk_jobs_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE job_questions ADD CONSTRAINT fk_job_questions_job FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE;

ALTER TABLE job_stages ADD CONSTRAINT fk_job_stages_job FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE;

ALTER TABLE job_logs ADD CONSTRAINT fk_job_logs_job FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE;
ALTER TABLE job_logs ADD CONSTRAINT fk_job_logs_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE; 