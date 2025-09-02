import React, {useEffect, useState} from 'react';
import {Button, Form, Input, message, Modal, Select} from 'antd';
import type {CreateUserData, UpdateUserData, User} from '../types/User';
import type {Role} from '../types/Role';
import {apiService} from '../services/api';

interface UserFormProps {
  isModalOpen: boolean;
  onClose: () => void;
  user?: User;
  onSubmit: (data: CreateUserData | UpdateUserData) => void;
  isLoading?: boolean;
}

export const UserForm: React.FC<UserFormProps> = ({
                                                    isModalOpen,
                                                    onClose,
                                                    user,
                                                    onSubmit,
                                                    isLoading = false
                                                  }) => {
  const [form] = Form.useForm();
  const [roles, setRoles] = useState<Role[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(false);

  // Carregar roles quando o modal abrir
  useEffect(() => {
    if (isModalOpen) {
      loadRoles();
    }
  }, [isModalOpen]);

  // Carregar roles disponíveis
  const loadRoles = async () => {
    setLoadingRoles(true);
    try {
      const rolesData = await apiService.getRoles();
      setRoles(rolesData);
    } catch (error) {
      message.error('Erro ao carregar roles');
      console.error('Erro ao carregar roles:', error);
    } finally {
      setLoadingRoles(false);
    }
  };

  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        roleId: user.roleId,
      });
    } else {
      form.resetFields();
    }
  }, [user, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      onSubmit(values);
    } catch (error) {
      message.error('Por favor, corrija os erros no formulário');
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title={user ? 'Editar Usuário' : 'Novo Usuário'}
      open={isModalOpen}
      onCancel={handleCancel}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          Cancelar
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={isLoading}
          onClick={handleSubmit}
        >
          {user ? 'Atualizar' : 'Criar'}
        </Button>,
      ]}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          firstName: '',
          lastName: '',
          email: '',
          password: '',
          roleId: undefined,
        }}
      >
        <Form.Item
          label="Primeiro Nome"
          name="firstName"
          rules={[
            {required: true, message: 'Por favor, insira o primeiro nome!'},
            {min: 2, message: 'O primeiro nome deve ter pelo menos 2 caracteres!'}
          ]}
        >
          <Input placeholder="Digite o primeiro nome"/>
        </Form.Item>

        <Form.Item
          label="Sobrenome"
          name="lastName"
          rules={[
            {required: true, message: 'Por favor, insira o sobrenome!'},
            {min: 2, message: 'O sobrenome deve ter pelo menos 2 caracteres!'}
          ]}
        >
          <Input placeholder="Digite o sobrenome"/>
        </Form.Item>

        <Form.Item
          label="Email"
          name="email"
          rules={[
            {required: true, message: 'Por favor, insira o email!'},
            {type: 'email', message: 'Por favor, insira um email válido!'}
          ]}
        >
          <Input placeholder="Digite o email"/>
        </Form.Item>

        <Form.Item
          label="Senha"
          name="password"
          rules={[
            {required: !user, message: 'Por favor, insira a senha!'},
            {min: 6, message: 'A senha deve ter pelo menos 6 caracteres!'}
          ]}
        >
          <Input.Password placeholder="Digite a senha"/>
        </Form.Item>

        <Form.Item
          label="Role"
          name="roleId"
          rules={[
            {required: true, message: 'Por favor, selecione um role!'}
          ]}
        >
          <Select
            placeholder="Selecione um role"
            loading={loadingRoles}
            showSearch
            optionFilterProp="children"
          >
            {roles.map((role) => (
              <Select.Option key={role.id} value={role.id}>
                {role.name} - {role.description}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
}; 