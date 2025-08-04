import React from 'react';
import { Layout as AntLayout, Button, message, Dropdown, Space } from 'antd';
import { UserOutlined, LogoutOutlined, DownOutlined, TeamOutlined, BankOutlined, ApartmentOutlined, FileTextOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';

const { Header, Content } = AntLayout;

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, isAdmin, logout } = useAuthContext();

  const handleLogout = () => {
    logout();
    navigate('/');
    message.success('Logout realizado com sucesso!');
  };

  const userMenuItems = [
    {
      key: 'profile',
      label: 'Meu Perfil',
      icon: <UserOutlined />,
      onClick: () => {
        navigate('/profile');
      },
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      label: 'Sair',
      icon: <LogoutOutlined />,
      onClick: handleLogout,
    },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      <Header style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        background: '#001529',
        color: 'white'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <h1 style={{ color: 'white', margin: 0 }}>Cognitive ATS</h1>
          <div className="header-navigation">
            <Button 
              type="text" 
              className={`header-nav-button ${isActive('/dashboard') ? 'active' : ''}`}
              onClick={() => navigate('/dashboard')}
            >
              Dashboard
            </Button>
            {isAdmin() && (
              <Button 
                type="text" 
                icon={<FileTextOutlined />}
                className={`header-nav-button ${isActive('/jobs') ? 'active' : ''}`}
                onClick={() => navigate('/jobs')}
              >
                Vagas
              </Button>
            )}
            {isAdmin() && (
              <Button 
                type="text" 
                icon={<TeamOutlined />}
                className={`header-nav-button ${isActive('/users') ? 'active' : ''}`}
                onClick={() => navigate('/users')}
              >
                Gestão de Usuários
              </Button>
            )}
            {isAdmin() && (
              <Button 
                type="text" 
                icon={<BankOutlined />}
                className={`header-nav-button ${isActive('/company') ? 'active' : ''}`}
                onClick={() => navigate('/company')}
              >
                Dados da Empresa
              </Button>
            )}
            <Button 
              type="text" 
              icon={<ApartmentOutlined />}
              className={`header-nav-button ${isActive('/departments') ? 'active' : ''}`}
              onClick={() => navigate('/departments')}
            >
              Departamentos
            </Button>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Dropdown
            menu={{ items: userMenuItems }}
            placement="bottomRight"
            trigger={['click']}
          >
            <Space style={{ 
              color: 'white', 
              cursor: 'pointer',
              padding: '8px 12px',
              borderRadius: '6px',
              transition: 'background-color 0.3s'
            }}
            className="user-menu-trigger"
            >
              <UserOutlined />
              <span>
                {currentUser?.firstName} {currentUser?.lastName}
              </span>
              <DownOutlined style={{ fontSize: '12px' }} />
            </Space>
          </Dropdown>
        </div>
      </Header>
      
      <Content>
        {children}
      </Content>
    </AntLayout>
  );
}; 