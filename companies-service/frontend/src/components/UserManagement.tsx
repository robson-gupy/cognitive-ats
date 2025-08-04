import React, { useState, useEffect } from 'react';
import { Layout, Button, message, Typography } from 'antd';
import { UserList } from './UserList';
import { UserForm } from './UserForm';
import { apiService } from '../services/api';
import { useAuthContext } from '../contexts/AuthContext';
import type { User, CreateUserData, UpdateUserData } from '../types/User';

const { Content } = Layout;
const { Title } = Typography;

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | undefined>(undefined);
  const { currentUser } = useAuthContext();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await apiService.getUsers();
      setUsers(data);
    } catch (error) {
      message.error('Erro ao carregar usuários');
      console.error('Erro ao carregar usuários:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (userData: CreateUserData) => {
    try {
      // Adicionar o companyId do usuário logado automaticamente
      const userDataWithCompany = {
        ...userData,
        companyId: currentUser?.companyId || '',
      };
      
      console.log('Criando usuário com dados:', userDataWithCompany);
      console.log('currentUser:', currentUser);
      
      const newUser = await apiService.createUser(userDataWithCompany);
      setUsers([...users, newUser]);
      message.success('Usuário criado com sucesso!');
      setIsModalOpen(false);
    } catch (error) {
      message.error('Erro ao criar usuário');
      console.error('Erro ao criar usuário:', error);
    }
  };

  const handleUpdateUser = async (userData: UpdateUserData) => {
    if (!editingUser) return;
    
    try {
      const updatedUser = await apiService.updateUser(editingUser.id, userData);
      setUsers(users.map(user => user.id === editingUser.id ? updatedUser : user));
      message.success('Usuário atualizado com sucesso!');
      setIsModalOpen(false);
      setEditingUser(undefined);
    } catch (error) {
      message.error('Erro ao atualizar usuário');
      console.error('Erro ao atualizar usuário:', error);
    }
  };

  const handleDeleteUser = async (id: string) => {
    try {
      const result = await apiService.deleteUser(id);
      setUsers(users.filter(user => user.id !== id));
      message.success(result.message || 'Usuário deletado com sucesso!');
    } catch (error) {
      message.error('Erro ao deletar usuário');
      console.error('Erro ao deletar usuário:', error);
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleSubmit = (data: CreateUserData | UpdateUserData) => {
    if (editingUser) {
      handleUpdateUser(data as UpdateUserData);
    } else {
      handleCreateUser(data as CreateUserData);
    }
  };

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
          <Title level={2} style={{ margin: 0 }}>Gerenciamento de Usuários</Title>
          <div style={{ display: 'flex', gap: '12px' }}>
            <Button onClick={() => window.history.back()}>
              Voltar
            </Button>
            <Button 
              type="primary" 
              onClick={() => {
                setEditingUser(undefined);
                setIsModalOpen(true);
              }}
            >
              Adicionar Usuário
            </Button>
          </div>
        </div>
        
        <UserList 
          users={users} 
          isLoading={loading} 
          onEdit={handleEditUser}
          onDelete={handleDeleteUser}
        />
      </div>

      <UserForm
        isModalOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingUser(undefined);
        }}
        user={editingUser}
        onSubmit={handleSubmit}
        isLoading={loading}
      />
    </Content>
  );
}; 