import React, { useState, useEffect } from 'react';
import { Layout, Button, message, Typography, Table, Modal, Form, Input, Space, Tag, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, StopOutlined, ApartmentOutlined } from '@ant-design/icons';
import { apiService } from '../services/api';
import type { Department, CreateDepartmentRequest, UpdateDepartmentRequest } from '../types/Department';

const { Content } = Layout;
const { Title, Text } = Typography;
const { TextArea } = Input;

interface DepartmentManagementProps {
  currentUser: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    companyId: string;
  } | null;
}

export const DepartmentManagement: React.FC<DepartmentManagementProps> = ({ currentUser }) => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    if (currentUser?.companyId) {
      loadDepartments();
    }
  }, [currentUser?.companyId]);

  const loadDepartments = async () => {
    if (!currentUser?.companyId) return;
    
    setLoading(true);
    try {
      const data = await apiService.getDepartments(currentUser.companyId);
      setDepartments(data);
    } catch (error) {
      message.error('Erro ao carregar departamentos');
      console.error('Erro ao carregar departamentos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDepartment = async (values: CreateDepartmentRequest) => {
    try {
      const newDepartment = await apiService.createDepartment({
        ...values,
        companyId: currentUser?.companyId || '',
      });
      setDepartments([...departments, newDepartment]);
      message.success('Departamento criado com sucesso!');
      setIsModalOpen(false);
      form.resetFields();
    } catch (error) {
      message.error('Erro ao criar departamento');
      console.error('Erro ao criar departamento:', error);
    }
  };

  const handleUpdateDepartment = async (values: UpdateDepartmentRequest) => {
    if (!editingDepartment) return;
    
    try {
      const updatedDepartment = await apiService.updateDepartment(editingDepartment.id, values);
      setDepartments(departments.map(dept => 
        dept.id === editingDepartment.id ? updatedDepartment : dept
      ));
      message.success('Departamento atualizado com sucesso!');
      setIsModalOpen(false);
      setEditingDepartment(null);
      form.resetFields();
    } catch (error) {
      message.error('Erro ao atualizar departamento');
      console.error('Erro ao atualizar departamento:', error);
    }
  };

  const handleDeleteDepartment = async (id: string) => {
    try {
      const result = await apiService.deleteDepartment(id);
      setDepartments(departments.filter(dept => dept.id !== id));
      message.success(result.message || 'Departamento excluído com sucesso!');
    } catch (error) {
      message.error('Erro ao excluir departamento');
      console.error('Erro ao excluir departamento:', error);
    }
  };

  const handleDeactivateDepartment = async (id: string) => {
    try {
      await apiService.deactivateDepartment(id);
      await loadDepartments(); // Recarregar para atualizar o status
      message.success('Departamento desativado com sucesso!');
    } catch (error) {
      message.error('Erro ao desativar departamento');
      console.error('Erro ao desativar departamento:', error);
    }
  };

  const handleEditDepartment = (department: Department) => {
    setEditingDepartment(department);
    form.setFieldsValue({
      name: department.name,
      description: department.description,
      code: department.code,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (values: CreateDepartmentRequest | UpdateDepartmentRequest) => {
    if (editingDepartment) {
      handleUpdateDepartment(values as UpdateDepartmentRequest);
    } else {
      handleCreateDepartment(values as CreateDepartmentRequest);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingDepartment(null);
    form.resetFields();
  };

  const columns = [
    {
      title: 'Nome',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Department) => (
        <div>
          <div style={{ fontWeight: 500 }}>{text}</div>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            Código: {record.code}
          </Text>
        </div>
      ),
    },
    {
      title: 'Descrição',
      dataIndex: 'description',
      key: 'description',
      render: (text: string) => text || '-',
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'Ativo' : 'Inativo'}
        </Tag>
      ),
    },
    {
      title: 'Usuários',
      key: 'users',
      render: (record: Department) => (
        <Text type="secondary">
          {record.users?.length || 0} usuário(s)
        </Text>
      ),
    },
    {
      title: 'Ações',
      key: 'actions',
      render: (record: Department) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEditDepartment(record)}
          >
            Editar
          </Button>
          {record.isActive && (
            <Popconfirm
              title="Desativar departamento"
              description="Tem certeza que deseja desativar este departamento?"
              onConfirm={() => handleDeactivateDepartment(record.id)}
              okText="Sim"
              cancelText="Não"
            >
              <Button type="link" icon={<StopOutlined />}>
                Desativar
              </Button>
            </Popconfirm>
          )}
          {record.users && record.users.length === 0 && (
            <Popconfirm
              title="Excluir departamento"
              description="Tem certeza que deseja excluir este departamento?"
              onConfirm={() => handleDeleteDepartment(record.id)}
              okText="Sim"
              cancelText="Não"
            >
              <Button type="link" danger icon={<DeleteOutlined />}>
                Excluir
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

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
          <div>
            <Title level={2} style={{ margin: 0 }}>
              <ApartmentOutlined style={{ marginRight: '8px' }} />
              Gerenciamento de Departamentos
            </Title>
            <Text type="secondary">
              Gerencie os departamentos da sua empresa
            </Text>
          </div>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingDepartment(null);
              setIsModalOpen(true);
            }}
            disabled={!currentUser?.companyId}
          >
            Novo Departamento
          </Button>
        </div>

        {/* Informações da Empresa */}

        <Table
          columns={columns}
          dataSource={departments}
          loading={loading}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} de ${total} departamentos`,
          }}
          locale={{
            emptyText: 'Nenhum departamento encontrado',
          }}
        />
      </div>

      <Modal
        title={editingDepartment ? 'Editar Departamento' : 'Novo Departamento'}
        open={isModalOpen}
        onCancel={handleModalClose}
        footer={null}
        width={600}
        destroyOnHidden
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            name: '',
            description: '',
            code: '',
          }}
        >
          <Form.Item
            name="name"
            label="Nome do Departamento"
            rules={[
              { required: true, message: 'Por favor, insira o nome do departamento' },
              { max: 100, message: 'O nome deve ter no máximo 100 caracteres' }
            ]}
          >
            <Input placeholder="Ex: Tecnologia, RH, Comercial" />
          </Form.Item>

          <Form.Item
            name="code"
            label="Código"
            rules={[
              { required: true, message: 'Por favor, insira o código do departamento' },
              { max: 10, message: 'O código deve ter no máximo 10 caracteres' }
            ]}
          >
            <Input placeholder="Ex: TEC, RH, COM" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Descrição"
          >
            <TextArea 
              rows={3} 
              placeholder="Descrição opcional do departamento"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={handleModalClose}>
                Cancelar
              </Button>
              <Button type="primary" htmlType="submit">
                {editingDepartment ? 'Atualizar' : 'Criar'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </Content>
  );
}; 