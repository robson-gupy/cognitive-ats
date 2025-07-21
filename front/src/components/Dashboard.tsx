import React from 'react';
import { Card, Row, Col, Statistic, Typography, Space, Button } from 'antd';
import { UserOutlined, TeamOutlined, FileTextOutlined, BankOutlined, ApartmentOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Paragraph } = Typography;

interface DashboardProps {
  currentUser: {
    firstName: string;
    lastName: string;
    email: string;
  } | null;
  isAdmin: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({ currentUser, isAdmin }) => {
  const navigate = useNavigate();
  return (
    <div style={{ padding: '24px' }}>
      <div style={{ 
        background: 'white', 
        padding: '24px', 
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        marginBottom: '24px'
      }}>
        <Title level={2} style={{ marginBottom: '8px' }}>
          Bem-vindo, {currentUser?.firstName}!
        </Title>
        <Paragraph style={{ fontSize: '16px', color: '#666', marginBottom: '24px' }}>
          Gerencie sua aplicação Cognitive ATS de forma eficiente
        </Paragraph>
      </div>

      <Row gutter={[24, 24]}>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="Total de Usuários"
              value={0}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
            {isAdmin && (
              <Button 
                type="link" 
                onClick={() => navigate('/users')}
                style={{ padding: 0, marginTop: '8px' }}
              >
                Ver todos os usuários
              </Button>
            )}
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="Candidatos"
              value={0}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
            <Button 
              type="link" 
              style={{ padding: 0, marginTop: '8px' }}
              onClick={() => console.log('Candidatos em desenvolvimento')}
            >
              Gerenciar candidatos
            </Button>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="Vagas Ativas"
              value={0}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
            <Button 
              type="link" 
              style={{ padding: 0, marginTop: '8px' }}
              onClick={() => console.log('Vagas em desenvolvimento')}
            >
              Ver vagas
            </Button>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="Departamentos"
              value={0}
              prefix={<ApartmentOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
            <Button 
              type="link" 
              style={{ padding: 0, marginTop: '8px' }}
              onClick={() => navigate('/departments')}
            >
              Gerenciar departamentos
            </Button>
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]} style={{ marginTop: '24px' }}>
        <Col xs={24} lg={12}>
          <Card title="Atividades Recentes" hoverable>
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <Paragraph style={{ color: '#999' }}>
                Nenhuma atividade recente
              </Paragraph>
              <Paragraph style={{ fontSize: '12px', color: '#ccc' }}>
                As atividades aparecerão aqui conforme você usar o sistema
              </Paragraph>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="Ações Rápidas" hoverable>
            <Space direction="vertical" style={{ width: '100%' }}>
              {isAdmin && (
                <Button 
                  type="primary" 
                  icon={<UserOutlined />}
                  onClick={() => navigate('/users')}
                  block
                >
                  Gerenciar Usuários
                </Button>
              )}
              {isAdmin && (
                <Button 
                  icon={<BankOutlined />}
                  onClick={() => navigate('/company')}
                  block
                >
                  Dados da Empresa
                </Button>
              )}
              <Button 
                icon={<ApartmentOutlined />}
                onClick={() => navigate('/departments')}
                block
              >
                Gerenciar Departamentos
              </Button>
              <Button 
                icon={<TeamOutlined />}
                onClick={() => console.log('Adicionar candidato em desenvolvimento')}
                block
              >
                Adicionar Candidato
              </Button>
              <Button 
                icon={<FileTextOutlined />}
                onClick={() => navigate('/jobs/new')}
                block
              >
                Criar Nova Vaga
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
}; 