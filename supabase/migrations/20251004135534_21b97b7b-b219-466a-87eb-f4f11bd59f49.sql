-- ============================================
-- SISTEMA RAAS - CAPS 3 DR BACELAR VIANA
-- Estrutura completa do banco de dados
-- ============================================

-- Tabela de Profissionais (CBO - Classificação Brasileira de Ocupações)
CREATE TABLE public.professionals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  cbo_code VARCHAR(6) NOT NULL,
  cbo_description VARCHAR(200) NOT NULL,
  cpf VARCHAR(11) UNIQUE,
  cns VARCHAR(15),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de Procedimentos (SIGTAP - Sistema de Gerenciamento da Tabela de Procedimentos)
CREATE TABLE public.procedures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sigtap_code VARCHAR(10) NOT NULL UNIQUE,
  description VARCHAR(250) NOT NULL,
  procedure_type VARCHAR(50),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de Pacientes
CREATE TABLE public.patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prontuario VARCHAR(10),
  cns VARCHAR(15),
  cpf VARCHAR(11),
  name VARCHAR(30) NOT NULL,
  birth_date DATE NOT NULL,
  sex CHAR(1) NOT NULL CHECK (sex IN ('M', 'F')),
  race_color VARCHAR(2) NOT NULL,
  mother_name VARCHAR(30),
  responsible_name VARCHAR(30),
  address_street VARCHAR(30),
  address_number VARCHAR(5),
  address_complement VARCHAR(10),
  address_neighborhood VARCHAR(30),
  address_zipcode VARCHAR(8),
  phone VARCHAR(11),
  mobile VARCHAR(11),
  email VARCHAR(40),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT cns_or_cpf_required CHECK (cns IS NOT NULL OR cpf IS NOT NULL)
);

-- Tabela de Atendimentos
CREATE TABLE public.attendances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  admission_date DATE NOT NULL,
  month_reference VARCHAR(7) NOT NULL,
  patient_origin VARCHAR(2) NOT NULL,
  cid_primary VARCHAR(4) NOT NULL,
  cid_secondary1 VARCHAR(4),
  cid_secondary2 VARCHAR(4),
  cid_secondary3 VARCHAR(4),
  esf_coverage CHAR(1) NOT NULL DEFAULT 'N' CHECK (esf_coverage IN ('S', 'N')),
  esf_cnes VARCHAR(7),
  patient_destination VARCHAR(2) NOT NULL,
  homeless_situation CHAR(1) NOT NULL DEFAULT 'N' CHECK (homeless_situation IN ('S', 'N')),
  drug_user CHAR(1) NOT NULL DEFAULT 'N' CHECK (drug_user IN ('S', 'N')),
  drug_type VARCHAR(3),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de Ações/Procedimentos realizados no atendimento
CREATE TABLE public.attendance_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attendance_id UUID NOT NULL REFERENCES public.attendances(id) ON DELETE CASCADE,
  professional_id UUID NOT NULL REFERENCES public.professionals(id),
  procedure_id UUID NOT NULL REFERENCES public.procedures(id),
  action_date DATE NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Índices para melhorar performance
CREATE INDEX idx_patients_cns ON public.patients(cns);
CREATE INDEX idx_patients_cpf ON public.patients(cpf);
CREATE INDEX idx_attendances_patient ON public.attendances(patient_id);
CREATE INDEX idx_attendances_date ON public.attendances(admission_date);
CREATE INDEX idx_actions_attendance ON public.attendance_actions(attendance_id);
CREATE INDEX idx_actions_professional ON public.attendance_actions(professional_id);
CREATE INDEX idx_actions_procedure ON public.attendance_actions(procedure_id);
CREATE INDEX idx_professionals_cbo ON public.professionals(cbo_code);
CREATE INDEX idx_procedures_sigtap ON public.procedures(sigtap_code);

-- Enable Row Level Security
ALTER TABLE public.professionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.procedures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_actions ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Sistema público do SUS, mas com controle
-- Para este sistema administrativo, vamos permitir acesso público por enquanto
-- Em produção, você deve adicionar autenticação

CREATE POLICY "Allow public read professionals" ON public.professionals FOR SELECT USING (true);
CREATE POLICY "Allow public insert professionals" ON public.professionals FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update professionals" ON public.professionals FOR UPDATE USING (true);
CREATE POLICY "Allow public delete professionals" ON public.professionals FOR DELETE USING (true);

CREATE POLICY "Allow public read procedures" ON public.procedures FOR SELECT USING (true);
CREATE POLICY "Allow public insert procedures" ON public.procedures FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update procedures" ON public.procedures FOR UPDATE USING (true);
CREATE POLICY "Allow public delete procedures" ON public.procedures FOR DELETE USING (true);

CREATE POLICY "Allow public read patients" ON public.patients FOR SELECT USING (true);
CREATE POLICY "Allow public insert patients" ON public.patients FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update patients" ON public.patients FOR UPDATE USING (true);
CREATE POLICY "Allow public delete patients" ON public.patients FOR DELETE USING (true);

CREATE POLICY "Allow public read attendances" ON public.attendances FOR SELECT USING (true);
CREATE POLICY "Allow public insert attendances" ON public.attendances FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update attendances" ON public.attendances FOR UPDATE USING (true);
CREATE POLICY "Allow public delete attendances" ON public.attendances FOR DELETE USING (true);

CREATE POLICY "Allow public read actions" ON public.attendance_actions FOR SELECT USING (true);
CREATE POLICY "Allow public insert actions" ON public.attendance_actions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update actions" ON public.attendance_actions FOR UPDATE USING (true);
CREATE POLICY "Allow public delete actions" ON public.attendance_actions FOR DELETE USING (true);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_professionals_updated_at BEFORE UPDATE ON public.professionals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_procedures_updated_at BEFORE UPDATE ON public.procedures
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON public.patients
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_attendances_updated_at BEFORE UPDATE ON public.attendances
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_actions_updated_at BEFORE UPDATE ON public.attendance_actions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir alguns CBO codes comuns em CAPS
INSERT INTO public.professionals (name, cbo_code, cbo_description, cpf) VALUES
('Dr. João Silva', '225125', 'Médico Psiquiatra', '12345678901'),
('Dra. Maria Santos', '251510', 'Psicólogo Clínico', '12345678902'),
('Carlos Oliveira', '322205', 'Técnico de Enfermagem', '12345678903'),
('Ana Costa', '223505', 'Enfermeiro', '12345678904');

-- Inserir alguns procedimentos SIGTAP comuns em CAPS
INSERT INTO public.procedures (sigtap_code, description, procedure_type) VALUES
('0301060096', 'Atendimento Individual', 'Psicossocial'),
('0301060100', 'Atendimento em Grupo', 'Psicossocial'),
('0301060088', 'Acolhimento Inicial', 'Psicossocial'),
('0301060118', 'Atendimento Familiar', 'Psicossocial'),
('0301060126', 'Visita Domiciliar', 'Psicossocial'),
('0301060134', 'Oficina Terapêutica', 'Psicossocial'),
('0301060142', 'Atividade de Suporte Social', 'Psicossocial');