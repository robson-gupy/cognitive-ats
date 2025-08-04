import React, { useState } from 'react';
import { Form, Input, Button, Card, message, Tabs } from 'antd';
import { useAuthContext } from '../contexts/AuthContext';
import { apiService } from '../services/api';

interface LoginFormProps {
  onLoginSuccess: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  const { login } = useAuthContext();

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
          <Input placeholder="Nome da empresa" />
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