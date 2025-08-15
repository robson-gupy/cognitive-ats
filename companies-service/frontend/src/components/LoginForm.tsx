import React, { useState, useCallback, useEffect } from 'react';
import { Form, Input, Button, Card, message, Tabs } from 'antd';
import { UserOutlined, LockOutlined, BankOutlined, CheckCircleOutlined, CloseCircleOutlined, GlobalOutlined } from '@ant-design/icons';
import { useAuthContext } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import { generateSlug } from '../utils/slug';
import { debounce } from 'lodash';
import { getCurrentConfig } from '../config/config';

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
  const [loginFormInstance] = Form.useForm();
  
  // Obter configuração atual para detectar subdomínio
  const config = getCurrentConfig();
  const hasSubdomain = config.hasSubdomain;

  // Se há subdomínio, sempre mostrar apenas a aba de login
  useEffect(() => {
    if (hasSubdomain) {
      setActiveTab('login');
    }
  }, [hasSubdomain]);

  const onFinish = async (values: any) => {
    try {
      setLoading(true);
      
      // Se não há subdomínio, usar o identificador fornecido pelo usuário
      if (!hasSubdomain && values.companySlug) {
        // Construir URL do backend com o subdomínio fornecido
        const protocol = window.location.protocol;
        const hostname = window.location.hostname;
        const backendUrl = `${protocol}//${values.companySlug}.${hostname}/api`;
        
        // Atualizar a configuração global temporariamente
        // Nota: Em uma implementação real, você precisaria de uma forma de atualizar
        // a URL base da API dinamicamente. Por enquanto, vamos usar a abordagem atual.
        console.log('Tentando login com empresa:', values.companySlug);
        console.log('URL do backend seria:', backendUrl);
        
        // Para esta implementação, vamos assumir que o usuário está acessando
        // a URL correta da empresa. Em produção, você pode implementar um
        // redirecionamento ou atualizar a configuração da API.
        await login(values);
        message.success('Login realizado com sucesso!');
        onLoginSuccess();
      } else {
        // Login normal com subdomínio já definido
        await login(values);
        message.success('Login realizado com sucesso!');
        onLoginSuccess();
      }
    } catch (error) {
      message.error('Erro no login. Verifique suas credenciais e identificador da empresa.');
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

  const loginFormContent = (
    <Form
      name="login"
      onFinish={onFinish}
      layout="vertical"
      requiredMark={false}
      form={loginFormInstance}
    >
      {/* Campo de identificador da empresa - apenas quando não há subdomínio */}
      {!hasSubdomain && (
        <Form.Item
          label="Identificador da Empresa"
          name="companySlug"
          rules={[
            { required: true, message: 'Por favor, insira o identificador da empresa!' },
            { min: 2, message: 'O identificador deve ter pelo menos 2 caracteres!' },
            { pattern: /^[a-z0-9-]+$/, message: 'O identificador deve conter apenas letras minúsculas, números e hífens!' },
          ]}
          tooltip="Digite o identificador da sua empresa (ex: minha-empresa)"
        >
          <Input 
            placeholder="ex: minha-empresa" 
            prefix={<GlobalOutlined />}
          />
        </Form.Item>
      )}

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

  const registerFormContent = (
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

  // Determinar quais abas mostrar baseado na presença de subdomínio
  const tabs = hasSubdomain 
    ? [
        {
          key: 'login',
          label: 'Entrar',
          children: loginFormContent,
        }
      ]
    : [
        {
          key: 'login',
          label: 'Entrar',
          children: loginFormContent,
        },
        {
          key: 'register',
          label: 'Registrar Empresa',
          children: registerFormContent,
        }
      ];

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      background: '#f0f2f5'
    }}>
      <Card title="Cognitive ATS" style={{ width: 500 }}>
        {hasSubdomain && (
          <div style={{ 
            marginBottom: '16px', 
            padding: '8px 12px', 
            backgroundColor: '#e6f7ff', 
            border: '1px solid #91d5ff',
            borderRadius: '6px',
            fontSize: '14px',
            color: '#1890ff'
          }}>
            🏢 Empresa: <strong>{config.companySlug}</strong>
          </div>
        )}
        
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabs}
        />
      </Card>
    </div>
  );
}; 