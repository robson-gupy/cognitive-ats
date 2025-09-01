import React, { useState } from 'react';
import { Layout as AntLayout, Button, message, Dropdown, Space, Drawer } from 'antd';
import { UserOutlined, LogoutOutlined, DownOutlined, TeamOutlined, BankOutlined, ApartmentOutlined, FileTextOutlined, MenuOutlined } from '@ant-design/icons';
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
  const [mobileMenuVisible, setMobileMenuVisible] = useState(false);

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

  const handleMobileNavigation = (path: string) => {
    navigate(path);
    setMobileMenuVisible(false);
  };

  const handleMobileMenuToggle = () => {
    setMobileMenuVisible(!mobileMenuVisible);
  };

  const mobileMenuItems = [
    {
      key: 'dashboard',
      label: 'Dashboard',
      icon: <UserOutlined />,
      onClick: () => handleMobileNavigation('/dashboard'),
    },
    ...(isAdmin() ? [{
      key: 'jobs',
      label: 'Vagas',
      icon: <FileTextOutlined />,
      onClick: () => handleMobileNavigation('/jobs'),
    }] : []),
    ...(isAdmin() ? [{
      key: 'users',
      label: 'Gestão de Usuários',
      icon: <TeamOutlined />,
      onClick: () => handleMobileNavigation('/users'),
    }] : []),
    ...(isAdmin() ? [{
      key: 'company',
      label: 'Dados da Empresa',
      icon: <BankOutlined />,
      onClick: () => handleMobileNavigation('/company'),
    }] : []),
    {
      key: 'departments',
      label: 'Departamentos',
      icon: <ApartmentOutlined />,
      onClick: () => handleMobileNavigation('/departments'),
    },
  ];

  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      <Header style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        background: '#001529',
        color: 'white',
        padding: '0 16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <h1 style={{ color: 'white', margin: 0, fontSize: '18px' }}>Cognitive ATS</h1>
          
          {/* Navegação desktop */}
          <div className="header-navigation desktop-nav">
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Menu hambúrguer para mobile */}
          <Button
            type="text"
            icon={<MenuOutlined />}
            onClick={handleMobileMenuToggle}
            className="mobile-menu-button"
          />
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

      {/* Menu mobile drawer */}
      <Drawer
        title="Menu"
        placement="right"
        onClose={() => setMobileMenuVisible(false)}
        open={mobileMenuVisible}
        width={280}
        bodyStyle={{ padding: 0 }}
        getContainer={false}
      >
        <div style={{ padding: '16px' }}>
          <div style={{ marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #f0f0f0' }}>
            <h3 style={{ margin: 0, color: '#1890ff' }}>Cognitive ATS</h3>
            <p style={{ margin: '4px 0 0 0', color: '#666', fontSize: '14px' }}>
              {currentUser?.firstName} {currentUser?.lastName}
            </p>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {mobileMenuItems.map((item) => (
              <Button
                key={item.key}
                type="text"
                icon={item.icon}
                onClick={item.onClick}
                style={{
                  justifyContent: 'flex-start',
                  height: '48px',
                  textAlign: 'left',
                  backgroundColor: isActive(`/${item.key}`) ? '#e6f7ff' : 'transparent',
                  color: isActive(`/${item.key}`) ? '#1890ff' : '#333',
                  border: 'none',
                  borderRadius: '6px',
                }}
                className="mobile-nav-button"
              >
                {item.label}
              </Button>
            ))}
          </div>
          
          <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #f0f0f0' }}>
            <Button
              type="text"
              icon={<UserOutlined />}
              onClick={() => handleMobileNavigation('/profile')}
              style={{
                justifyContent: 'flex-start',
                height: '48px',
                textAlign: 'left',
                backgroundColor: isActive('/profile') ? '#e6f7ff' : 'transparent',
                color: isActive('/profile') ? '#1890ff' : '#333',
                border: 'none',
                borderRadius: '6px',
                width: '100%',
                marginBottom: '8px',
              }}
            >
              Meu Perfil
            </Button>
            <Button
              type="text"
              icon={<LogoutOutlined />}
              onClick={handleLogout}
              style={{
                justifyContent: 'flex-start',
                height: '48px',
                textAlign: 'left',
                color: '#ff4d4f',
                border: 'none',
                borderRadius: '6px',
                width: '100%',
              }}
            >
              Sair
            </Button>
          </div>
        </div>
      </Drawer>
    </AntLayout>
  );
}; 