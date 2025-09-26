import React from 'react';
import {Button, Popconfirm, Space, Table, Tag} from 'antd';
import {DeleteOutlined, EditOutlined, UserOutlined} from '@ant-design/icons';
import type {User} from '../types/User';

interface UserListProps {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (id: string) => void;
  isLoading?: boolean;
}

export const UserList: React.FC<UserListProps> = ({
                                                    users,
                                                    onEdit,
                                                    onDelete,
                                                    isLoading = false
                                                  }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleDelete = (id: string) => {
    onDelete(id);
  };

  const columns = [
    {
      title: 'Nome',
      dataIndex: 'firstName',
      key: 'firstName',
      render: (firstName: string, record: User) => (
        <Space>
          <UserOutlined style={{color: '#1890ff'}}/>
          <span>{firstName} {record.lastName}</span>
        </Space>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (email: string) => (
        <span style={{color: '#666'}}>{email}</span>
      ),
    },
    {
      title: 'Role',
      key: 'role',
      render: (record: User) => {
        if (record.role) {
          const getRoleColor = (code: string) => {
            switch (code) {
              case 'ADMIN':
                return 'red';
              case 'RECRUITER':
                return 'blue';
              case 'MANAGER':
                return 'green';
              default:
                return 'default';
            }
          };

          return (
            <Tag color={getRoleColor(record.role.code)}>
              {record.role.name}
            </Tag>
          );
        }
        return <span style={{color: '#999'}}>Sem role</span>;
      },
    },
    {
      title: 'Criado em',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => (
        <span style={{color: '#999', fontSize: '12px'}}>
          {formatDate(date)}
        </span>
      ),
    },
    {
      title: 'Atualizado em',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (date: string) => (
        <span style={{color: '#999', fontSize: '12px'}}>
          {formatDate(date)}
        </span>
      ),
    },
    {
      title: 'Ações',
      key: 'actions',
      render: (record: User) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined/>}
            onClick={() => onEdit(record)}
            style={{padding: 0}}
          >
            Editar
          </Button>
          <Popconfirm
            title="Excluir usuário"
            description="Tem certeza que deseja excluir este usuário?"
            onConfirm={() => handleDelete(record.id)}
            okText="Sim"
            cancelText="Não"
            placement="topRight"
          >
            <Button
              type="link"
              danger
              icon={<DeleteOutlined/>}
              style={{padding: 0}}
            >
              Excluir
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={users}
      rowKey="id"
      loading={isLoading}
      pagination={{
        pageSize: 10,
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total, range) =>
          `${range[0]}-${range[1]} de ${total} usuários`,
        locale: {
          items_per_page: 'por página',
          jump_to: 'Ir para',
          jump_to_confirm: 'confirmar',
          page: 'Página',
        },
      }}
      locale={{
        emptyText: 'Nenhum usuário encontrado',
      }}
    />
  );
}; 