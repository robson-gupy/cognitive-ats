import React, {useState} from 'react';
import {Button, Card, Divider, Form, Input, message, Space, Typography} from 'antd';
import {EyeInvisibleOutlined, EyeTwoTone, LockOutlined, SaveOutlined, UserOutlined} from '@ant-design/icons';
import {useAuthContext} from '../contexts/AuthContext';
import {apiService} from '../services/api';

const {Title, Text} = Typography;

interface UserProfileData {
  firstName: string;
  lastName: string;
  email: string;
}

interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export const UserProfile: React.FC = () => {
  const {currentUser, refreshAuthData} = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [profileForm] = Form.useForm();
  const [passwordForm] = Form.useForm();

  // Preencher formulário com dados atuais
  React.useEffect(() => {
    if (currentUser) {
      profileForm.setFieldsValue({
        firstName: currentUser.firstName,
        lastName: currentUser.lastName,
        email: currentUser.email,
      });
    }
  }, [currentUser, profileForm]);

  const handleProfileUpdate = async (values: UserProfileData) => {
    setLoading(true);
    try {
      await apiService.updateProfile(values);
      message.success('Perfil atualizado com sucesso!');

      // Atualizar dados do usuário no contexto
      await refreshAuthData();
    } catch (error: any) {
      message.error(error.message || 'Erro ao atualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (values: PasswordChangeData) => {
    if (values.newPassword !== values.confirmPassword) {
      message.error('As senhas não coincidem');
      return;
    }

    setPasswordLoading(true);
    try {
      await apiService.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      message.success('Senha alterada com sucesso!');
      passwordForm.resetFields();
    } catch (error: any) {
      message.error(error.message || 'Erro ao alterar senha');
    } finally {
      setPasswordLoading(false);
    }
  };

  if (!currentUser) {
    return <div>Carregando...</div>;
  }

  return (
    <div style={{maxWidth: '800px', margin: '0 auto', padding: '24px'}}>
      <Title level={2}>
        <UserOutlined/> Meu Perfil
      </Title>

      <Space direction="vertical" size="large" style={{width: '100%'}}>
        {/* Informações do Perfil */}
        <Card title="Informações Pessoais" style={{marginBottom: '24px'}}>
          <Form
            form={profileForm}
            layout="vertical"
            onFinish={handleProfileUpdate}
            requiredMark={false}
          >
            <Form.Item
              label="Nome"
              name="firstName"
              rules={[
                {required: true, message: 'Por favor, insira seu nome!'},
                {min: 2, message: 'O nome deve ter pelo menos 2 caracteres!'},
              ]}
            >
              <Input placeholder="Seu nome"/>
            </Form.Item>

            <Form.Item
              label="Sobrenome"
              name="lastName"
              rules={[
                {required: true, message: 'Por favor, insira seu sobrenome!'},
                {min: 2, message: 'O sobrenome deve ter pelo menos 2 caracteres!'},
              ]}
            >
              <Input placeholder="Seu sobrenome"/>
            </Form.Item>

            <Form.Item
              label="Email"
              name="email"
              rules={[
                {required: true, message: 'Por favor, insira seu email!'},
                {type: 'email', message: 'Por favor, insira um email válido!'},
              ]}
            >
              <Input placeholder="seu@email.com" disabled/>
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                icon={<SaveOutlined/>}
              >
                Salvar Alterações
              </Button>
            </Form.Item>
          </Form>
        </Card>

        <Divider/>

        {/* Alteração de Senha */}
        <Card title="Alterar Senha" style={{marginBottom: '24px'}}>
          <Form
            form={passwordForm}
            layout="vertical"
            onFinish={handlePasswordChange}
            requiredMark={false}
          >
            <Form.Item
              label="Senha Atual"
              name="currentPassword"
              rules={[
                {required: true, message: 'Por favor, insira sua senha atual!'},
                {min: 6, message: 'A senha deve ter pelo menos 6 caracteres!'},
              ]}
            >
              <Input.Password
                placeholder="Sua senha atual"
                iconRender={(visible) => (visible ? <EyeTwoTone/> : <EyeInvisibleOutlined/>)}
              />
            </Form.Item>

            <Form.Item
              label="Nova Senha"
              name="newPassword"
              rules={[
                {required: true, message: 'Por favor, insira a nova senha!'},
                {min: 6, message: 'A nova senha deve ter pelo menos 6 caracteres!'},
              ]}
            >
              <Input.Password
                placeholder="Nova senha"
                iconRender={(visible) => (visible ? <EyeTwoTone/> : <EyeInvisibleOutlined/>)}
              />
            </Form.Item>

            <Form.Item
              label="Confirmar Nova Senha"
              name="confirmPassword"
              rules={[
                {required: true, message: 'Por favor, confirme a nova senha!'},
                {min: 6, message: 'A senha deve ter pelo menos 6 caracteres!'},
              ]}
            >
              <Input.Password
                placeholder="Confirme a nova senha"
                iconRender={(visible) => (visible ? <EyeTwoTone/> : <EyeInvisibleOutlined/>)}
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={passwordLoading}
                icon={<LockOutlined/>}
              >
                Alterar Senha
              </Button>
            </Form.Item>
          </Form>
        </Card>

        {/* Informações da Conta */}
        <Card title="Informações da Conta">
          <Space direction="vertical" style={{width: '100%'}}>
            <div style={{marginBottom: '16px'}}>
              <Text strong>Empresa ID:</Text> {currentUser.companyId || 'N/A'}
            </div>

            <div style={{marginBottom: '16px'}}>
              <Text strong>Departamento:</Text> Não atribuído
            </div>

            <div style={{marginBottom: '16px'}}>
              <Text strong>Função:</Text> {currentUser.roleCode || 'N/A'}
            </div>

            <div style={{marginBottom: '16px'}}>
              <Text strong>Membro desde:</Text> Data não disponível
            </div>
          </Space>
        </Card>
      </Space>
    </div>
  );
}; 