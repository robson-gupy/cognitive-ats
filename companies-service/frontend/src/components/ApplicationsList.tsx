import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Typography, Tag, Space, Button, List, Avatar, Divider, Checkbox, message, Spin } from 'antd';
import { UserOutlined, MailOutlined, CalendarOutlined, FileTextOutlined, TrophyOutlined } from '@ant-design/icons';
import { apiService } from '../services/api';
import type { Application } from '../types/Application';
import type { Job } from '../types/Job';

const { Title, Text } = Typography;

export const ApplicationsList: React.FC = () => {
  const { id: jobId } = useParams<{ id: string }>();
  const [job, setJob] = useState<Job | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showQuestionResponses, setShowQuestionResponses] = useState(false);

  useEffect(() => {
    if (jobId) {
      loadJob();
      loadApplications();
    }
  }, [jobId, showQuestionResponses]);

  const loadJob = async () => {
    try {
      const jobData = await apiService.getJob(jobId!);
      setJob(jobData);
    } catch (err) {
      console.error('Erro ao carregar dados da vaga:', err);
    }
  };

  const loadApplications = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = showQuestionResponses 
        ? await apiService.getApplicationsWithQuestionResponses(jobId!)
        : await apiService.getApplications(jobId!);
      
      setApplications(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar aplicações');
      message.error('Erro ao carregar aplicações');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatContactInfo = (application: Application) => {
    const contactInfo = [];
    if (application.email) contactInfo.push(application.email);
    if (application.phone) contactInfo.push(application.phone);
    return contactInfo.join(' • ') || 'Nenhum contato informado';
  };

  const formatScore = (score?: number) => {
    if (score === undefined || score === null) return 'N/A';
    return `${score.toFixed(1)}/10`;
  };

  const getScoreColor = (score?: number) => {
    if (score === undefined || score === null) return 'default';
    if (score >= 8) return 'success';
    if (score >= 6) return 'warning';
    return 'error';
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <div style={{ marginTop: '16px' }}>Carregando candidatos...</div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <Title level={4} type="danger">Erro ao carregar aplicações</Title>
          <Text type="secondary">{error}</Text>
          <div style={{ marginTop: '16px' }}>
            <Button type="primary" onClick={loadApplications}>
              Tentar novamente
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <Card style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Title level={2} style={{ margin: 0 }}>
              Candidatos
              {job && (
                <Text type="secondary" style={{ fontSize: '18px', marginLeft: '8px' }}>
                  - {job.title}
                </Text>
              )}
            </Title>
            <Text type="secondary">
              {applications.length} candidato{applications.length !== 1 ? 's' : ''} inscrito{applications.length !== 1 ? 's' : ''}
            </Text>
          </div>
          
          <Space>
            <Checkbox
              checked={showQuestionResponses}
              onChange={(e) => setShowQuestionResponses(e.target.checked)}
            >
              Incluir respostas das questões
            </Checkbox>
            
            <Button type="primary" onClick={loadApplications}>
              Atualizar
            </Button>
          </Space>
        </div>
      </Card>

      {/* Applications List */}
      {applications.length === 0 ? (
        <Card>
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <UserOutlined style={{ fontSize: '48px', color: '#d9d9d9' }} />
            <Title level={4} style={{ marginTop: '16px' }}>Nenhuma aplicação encontrada</Title>
            <Text type="secondary">
              Ainda não há candidatos inscritos nesta vaga.
            </Text>
          </div>
        </Card>
      ) : (
        <List
          grid={{ gutter: 16, xs: 1, sm: 1, md: 2, lg: 2, xl: 3, xxl: 3 }}
          dataSource={applications}
          renderItem={(application) => (
            <List.Item>
              <Card
                hoverable
                style={{ width: '100%' }}
                actions={
                  application.resumeUrl ? [
                    <Button 
                      key="resume" 
                      type="link" 
                      icon={<FileTextOutlined />}
                      href={application.resumeUrl}
                      target="_blank"
                    >
                      Ver currículo
                    </Button>
                  ] : []
                }
              >
                <List.Item.Meta
                  avatar={
                    <Avatar 
                      size="large" 
                      icon={<UserOutlined />} 
                      style={{ backgroundColor: '#1890ff' }}
                    />
                  }
                  title={
                    <Space>
                      <Text strong style={{ fontSize: '16px' }}>
                        {application.firstName} {application.lastName}
                      </Text>
                      {application.aiScore !== undefined && (
                        <Tag color={getScoreColor(application.aiScore)} icon={<TrophyOutlined />}>
                          {formatScore(application.aiScore)}
                        </Tag>
                      )}
                    </Space>
                  }
                  description={
                    <Space direction="vertical" size="small" style={{ width: '100%' }}>
                      <Space>
                        <MailOutlined />
                        <Text type="secondary">{formatContactInfo(application)}</Text>
                      </Space>
                      <Space>
                        <CalendarOutlined />
                        <Text type="secondary">Inscrito em {formatDate(application.createdAt)}</Text>
                      </Space>
                      {application.questionResponses && application.questionResponses.length > 0 && (
                        <Tag color="blue">
                          {application.questionResponses.length} resposta{application.questionResponses.length !== 1 ? 's' : ''}
                        </Tag>
                      )}
                    </Space>
                  }
                />

                {/* Question Responses */}
                {showQuestionResponses && application.questionResponses && application.questionResponses.length > 0 && (
                  <>
                    <Divider />
                    <div>
                      <Title level={5}>Respostas das questões:</Title>
                      <List
                        size="small"
                        dataSource={application.questionResponses}
                        renderItem={(response, index) => (
                          <List.Item>
                            <div style={{ width: '100%' }}>
                              <Text strong>{index + 1}. {response.question}</Text>
                              <div style={{ marginTop: '8px' }}>
                                <Text type="secondary">{response.answer}</Text>
                              </div>
                            </div>
                          </List.Item>
                        )}
                      />
                    </div>
                  </>
                )}
              </Card>
            </List.Item>
          )}
        />
      )}
    </div>
  );
};
