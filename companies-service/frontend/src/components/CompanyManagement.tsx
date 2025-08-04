import React, { useState, useEffect } from 'react';
import { Layout, Button, message, Typography, Form, Input, Spin, Alert } from 'antd';
import { SaveOutlined, EditOutlined, BankOutlined } from '@ant-design/icons';
import { apiService } from '../services/api';
import type { Company, UpdateCompanyData } from '../types/Company';

const { Content } = Layout;
const { Title, Paragraph } = Typography;

export const CompanyManagement: React.FC = () => {
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    loadCompany();
  }, []);

  const loadCompany = async () => {
    setLoading(true);
    try {
      // Buscar a empresa do usuário logado através do perfil
      const user = await apiService.getProfile();
      if (user.companyId) {
        const companyData = await apiService.getCompany(user.companyId);
        setCompany(companyData);
        form.setFieldsValue({
          name: companyData.name,
          corporateName: companyData.corporateName,
          cnpj: companyData.cnpj,
          businessArea: companyData.businessArea,
          description: companyData.description,
        });
      }
    } catch (error) {
      message.error('Erro ao carregar dados da empresa');
      console.error('Erro ao carregar empresa:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Restaurar valores originais
    if (company) {
      form.setFieldsValue({
        name: company.name,
        corporateName: company.corporateName,
        cnpj: company.cnpj,
        businessArea: company.businessArea,
        description: company.description,
      });
    }
  };

  const handleSave = async (values: UpdateCompanyData) => {
    if (!company) return;

    setSaving(true);
    try {
      const updatedCompany = await apiService.updateCompany(company.id, values);
      setCompany(updatedCompany);
      setIsEditing(false);
      message.success('Dados da empresa atualizados com sucesso!');
    } catch (error) {
      message.error('Erro ao atualizar dados da empresa');
      console.error('Erro ao atualizar empresa:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Content style={{ padding: '24px' }}>
        <div style={{ 
          background: 'white', 
          padding: '24px', 
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <Spin size="large" />
          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            Carregando dados da empresa...
          </div>
        </div>
      </Content>
    );
  }

  if (!company) {
    return (
      <Content style={{ padding: '24px' }}>
        <div style={{ 
          background: 'white', 
          padding: '24px', 
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <Alert
            message="Empresa não encontrada"
            description="Não foi possível carregar os dados da empresa."
            type="error"
            showIcon
          />
          <Button 
            onClick={() => window.history.back()}
            style={{ marginTop: '16px' }}
          >
            Voltar
          </Button>
        </div>
      </Content>
    );
  }

  return (
    <Content style={{ padding: '24px' }}>
      <div style={{ 
        background: 'white', 
        padding: '24px', 
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '24px' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <BankOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
            <Title level={2} style={{ margin: 0 }}>Dados da Empresa</Title>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <Button onClick={() => window.history.back()}>
              Voltar
            </Button>
            {!isEditing ? (
              <Button 
                type="primary" 
                icon={<EditOutlined />}
                onClick={handleEdit}
              >
                Editar
              </Button>
            ) : (
              <Button onClick={handleCancel}>
                Cancelar
              </Button>
            )}
          </div>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
          disabled={!isEditing}
        >
          <div className="company-form">
            <div>
              <Form.Item
                label="Nome da Empresa"
                name="name"
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
            </div>

            <div>
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
                name="description"
              >
                <Input.TextArea 
                  placeholder="Descreva brevemente sua empresa..."
                  rows={4}
                />
              </Form.Item>

              <div className="company-info">
                <Paragraph style={{ color: '#666', fontSize: '12px', margin: 0 }}>
                  <strong>Informações do Sistema:</strong><br />
                  Empresa criada em: {new Date(company.createdAt).toLocaleDateString('pt-BR')}<br />
                  Última atualização: {new Date(company.updatedAt).toLocaleDateString('pt-BR')}
                </Paragraph>
              </div>
            </div>
          </div>

          {isEditing && (
            <div style={{ marginTop: '24px', textAlign: 'right' }}>
              <Button 
                type="primary" 
                icon={<SaveOutlined />}
                htmlType="submit"
                loading={saving}
              >
                Salvar Alterações
              </Button>
            </div>
          )}
        </Form>
      </div>
    </Content>
  );
}; 