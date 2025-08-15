import React, { useState, useCallback } from 'react';
import { Form, Input, Button, Card, message, Tabs } from 'antd';
import { UserOutlined, LockOutlined, BankOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { useAuthContext } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import { generateSlug } from '../utils/slug';
import { debounce } from 'lodash';

interface LoginFormProps {
  onLoginSuccess: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  const [slugLoading, setSlugLoading] = useState(false);
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const { login } = useAuthContext();
  const [form] = Form.useForm();

  const onFinish = async (values: any) => {
    try {
      setLoading(true);
      await login(values);
      message.success('Login realizado com sucesso!');
      onLoginSuccess();
    } catch (error) {
      message.error('Erro no login. Verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
  };

  const onRegister = async (values: any) => {
    try {
      setLoading(true);
      await apiService.register(values);
      message.success('Registro realizado com sucesso! Faça login para continuar.');
      setActiveTab('login');
    } catch (error) {
      message.error('Erro no registro. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Função para verificar disponibilidade do slug no servidor
  const checkSlugAvailability = async (slug: string) => {
    if (!slug || slug.length < 2) {
      setSlugAvailable(null);
      return;
    }

    try {
      setSlugLoading(true);
      // Aqui você precisará implementar o endpoint no backend para verificar disponibilidade
      // Por enquanto, vou simular uma verificação
      const isAvailable = await apiService.checkSlugAvailability(slug);
      setSlugAvailable(isAvailable);
    } catch (error) {
      console.error('Erro ao verificar disponibilidade do slug:', error);
      setSlugAvailable(null);
    } finally {
      setSlugLoading(false);
    }
  };

  // Debounce da verificação de disponibilidade (500ms após parar de digitar)
  const debouncedSlugCheck = useCallback(
    debounce((slug: string) => {
      checkSlugAvailability(slug);
    }, 500),
    []
  );

  const handleCompanyNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const companyName = e.target.value;
    
    if (companyName) {
      // Gerar novo slug baseado no nome
      const newSlug = generateSlug(companyName);
      form.setFieldValue('companySlug', newSlug);
      
      // Verificar disponibilidade do novo slug
      debouncedSlugCheck(newSlug);
    } else {
      // Limpar slug e status de disponibilidade
      form.setFieldValue('companySlug', '');
      setSlugAvailable(null);
    }
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const slug = e.target.value;
    
    if (slug) {
      // Verificar disponibilidade do slug digitado
      debouncedSlugCheck(slug);
    } else {
      setSlugAvailable(null);
    }
  };

  const getSlugStatusIcon = () => {
    if (slugLoading) {
      return <span style={{ color: '#1890ff' }}>⏳</span>;
    }
    if (slugAvailable === true) {
      return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
    }
    if (slugAvailable === false) {
      return <CloseCircleOutlined style={{ color: '#ff4d4f' }} />;
    }
    return null;
  };

  const getSlugStatusText = () => {
    if (slugLoading) {
      return 'Verificando disponibilidade...';
    }
    if (slugAvailable === true) {
      return 'Identificador disponível';
    }
    if (slugAvailable === false) {
      return 'Identificador já está em uso';
    }
    return '';
  };

  const getSlugStatusColor = () => {
    if (slugAvailable === true) return '#52c41a';
    if (slugAvailable === false) return '#ff4d4f';
    return '#666';
  };

  const loginForm = (
    <Form
      name="login"
      onFinish={onFinish}
      layout="vertical"
      requiredMark={false}
    >
      <Form.Item
        label="Email"
        name="email"
        rules={[
          { required: true, message: 'Por favor, insira seu email!' },
          { type: 'email', message: 'Por favor, insira um email válido!' },
        ]}
      >
        <Input placeholder="seu@email.com" />
      </Form.Item>

      <Form.Item
        label="Senha"
        name="password"
        rules={[
          { required: true, message: 'Por favor, insira sua senha!' },
          { min: 6, message: 'A senha deve ter pelo menos 6 caracteres!' },
        ]}
      >
        <Input.Password placeholder="Sua senha" />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading}>
          Entrar
        </Button>
      </Form.Item>
    </Form>
  );

  const registerForm = (
    <Form
      name="register"
      onFinish={onRegister}
      layout="vertical"
      requiredMark={false}
      form={form}
    >
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ marginBottom: '16px', color: '#1890ff' }}>Dados da Empresa</h3>
        
        <Form.Item
          label="Nome da Empresa"
          name="companyName"
          rules={[
            { required: true, message: 'Por favor, insira o nome da empresa!' },
            { min: 2, message: 'O nome deve ter pelo menos 2 caracteres!' },
          ]}
        >
          <Input 
            placeholder="Nome da empresa" 
            onChange={handleCompanyNameChange}
          />
        </Form.Item>

        <Form.Item
          label="Identificador Legível"
          name="companySlug"
          rules={[
            { required: true, message: 'Por favor, insira o identificador legível!' },
            { min: 2, message: 'O identificador deve ter pelo menos 2 caracteres!' },
            { pattern: /^[a-z0-9-]+$/, message: 'O identificador deve conter apenas letras minúsculas, números e hífens!' },
          ]}
          tooltip="Identificador único e legível para a empresa (ex: minha-empresa-tecnologia)"
          validateStatus={slugAvailable === false ? 'error' : slugAvailable === true ? 'success' : undefined}
          help={getSlugStatusText()}
        >
          <Input 
            placeholder="ex: minha-empresa-tecnologia" 
            onChange={handleSlugChange}
            suffix={getSlugStatusIcon()}
          />
        </Form.Item>

        <Form.Item
          label="Razão Social"
          name="corporateName"
          rules={[
            { required: true, message: 'Por favor, insira a razão social!' },
            { min: 2, message: 'A razão social deve ter pelo menos 2 caracteres!' },
          ]}
        >
          <Input placeholder="Razão social da empresa" />
        </Form.Item>

        <Form.Item
          label="CNPJ"
          name="cnpj"
          rules={[
            { required: true, message: 'Por favor, insira o CNPJ!' },
            { min: 14, message: 'CNPJ deve ter pelo menos 14 dígitos!' },
          ]}
        >
          <Input placeholder="00.000.000/0000-00" />
        </Form.Item>

        <Form.Item
          label="Área de Atuação"
          name="businessArea"
          rules={[
            { required: true, message: 'Por favor, insira a área de atuação!' },
            { min: 2, message: 'A área deve ter pelo menos 2 caracteres!' },
          ]}
        >
          <Input placeholder="Ex: Tecnologia, Saúde, Educação" />
        </Form.Item>

        <Form.Item
          label="Sobre a Empresa"
          name="companyDescription"
        >
          <Input.TextArea 
            placeholder="Descreva brevemente sua empresa..."
            rows={3}
          />
        </Form.Item>
      </div>

      <div>
        <h3 style={{ marginBottom: '16px', color: '#1890ff' }}>Dados do Administrador</h3>
        
        <Form.Item
          label="Nome"
          name="firstName"
          rules={[
            { required: true, message: 'Por favor, insira seu nome!' },
            { min: 2, message: 'O nome deve ter pelo menos 2 caracteres!' },
          ]}
        >
          <Input placeholder="Seu nome" />
        </Form.Item>

        <Form.Item
          label="Sobrenome"
          name="lastName"
          rules={[
            { required: true, message: 'Por favor, insira seu sobrenome!' },
            { min: 2, message: 'O sobrenome deve ter pelo menos 2 caracteres!' },
          ]}
        >
          <Input placeholder="Seu sobrenome" />
        </Form.Item>

        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: 'Por favor, insira seu email!' },
            { type: 'email', message: 'Por favor, insira um email válido!' },
          ]}
        >
          <Input placeholder="seu@email.com" />
        </Form.Item>

        <Form.Item
          label="Senha"
          name="password"
          rules={[
            { required: true, message: 'Por favor, insira sua senha!' },
            { min: 6, message: 'A senha deve ter pelo menos 6 caracteres!' },
          ]}
        >
          <Input.Password placeholder="Sua senha" />
        </Form.Item>
      </div>

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading} block>
          Registrar Empresa
        </Button>
      </Form.Item>
    </Form>
  );

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      background: '#f0f2f5'
    }}>
      <Card title="Cognitive ATS" style={{ width: 500 }}>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: 'login',
              label: 'Entrar',
              children: loginForm,
            },
            {
              key: 'register',
              label: 'Registrar Empresa',
              children: registerForm,
            },
          ]}
        />
      </Card>
    </div>
  );
}; 