import React, { useState, useEffect } from 'react';
import { Card, Typography, Tag, Space, Button, Descriptions, Divider, List, message, Spin, Popconfirm } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { EditOutlined, ArrowLeftOutlined, HistoryOutlined, GlobalOutlined, StopOutlined, SettingOutlined } from '@ant-design/icons';
import { apiService } from '../services/api';
import type { Job } from '../types/Job';
import { JobStatus } from '../types/Job';

const { Title, Paragraph } = Typography;

export const JobView: React.FC = () => {
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    if (id) {
      loadJob();
    }
  }, [id]);

  const loadJob = async () => {
    try {
      setLoading(true);
      const jobData = await apiService.getJob(id!);
      setJob(jobData);
    } catch (error) {
      message.error('Erro ao carregar vaga');
      navigate('/jobs');
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!job) return;
    
    try {
      setActionLoading(true);
      await apiService.publishJob(job.id);
      message.success('Vaga publicada com sucesso!');
      await loadJob(); // Recarregar a vaga para atualizar o status
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao publicar vaga';
      message.error(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  const handleClose = async () => {
    if (!job) return;
    
    try {
      setActionLoading(true);
      await apiService.closeJob(job.id);
      message.success('Vaga fechada com sucesso!');
      await loadJob(); // Recarregar a vaga para atualizar o status
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao fechar vaga';
      message.error(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status: JobStatus) => {
    switch (status) {
      case JobStatus.DRAFT:
        return 'default';
      case JobStatus.PUBLISHED:
        return 'green';
      case JobStatus.CLOSED:
        return 'red';
      case JobStatus.PAUSED:
        return 'orange';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: JobStatus) => {
    switch (status) {
      case JobStatus.DRAFT:
        return 'Rascunho';
      case JobStatus.PUBLISHED:
        return 'Publicada';
      case JobStatus.CLOSED:
        return 'Fechada';
      case JobStatus.PAUSED:
        return 'Pausada';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <Spin size="large" />
        <div style={{ marginTop: '16px' }}>Carregando vaga...</div>
      </div>
    );
  }

  if (!job) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <Title level={3}>Vaga não encontrada</Title>
        <Button onClick={() => navigate('/jobs')}>
          Voltar para a lista
        </Button>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <Space>
            <Button 
              icon={<ArrowLeftOutlined />} 
              onClick={() => navigate('/jobs')}
            >
              Voltar
            </Button>
            <Title level={2} style={{ margin: 0 }}>
              {job.title}
            </Title>
          </Space>
          <Space>
            {job.status === JobStatus.DRAFT && (
              <Popconfirm
                title="Publicar vaga"
                description="Tem certeza que deseja publicar esta vaga? Ela ficará visível para candidatos."
                onConfirm={handlePublish}
                okText="Sim, publicar"
                cancelText="Cancelar"
              >
                <Button 
                  type="primary" 
                  icon={<GlobalOutlined />}
                  loading={actionLoading}
                >
                  Publicar Vaga
                </Button>
              </Popconfirm>
            )}
            
            {job.status === JobStatus.PUBLISHED && (
              <Popconfirm
                title="Fechar vaga"
                description="Tem certeza que deseja fechar esta vaga? Ela não receberá mais candidaturas."
                onConfirm={handleClose}
                okText="Sim, fechar"
                cancelText="Cancelar"
              >
                <Button 
                  danger
                  icon={<StopOutlined />}
                  loading={actionLoading}
                >
                  Fechar Vaga
                </Button>
              </Popconfirm>
            )}
            
            <Button 
              icon={<SettingOutlined />}
              onClick={() => navigate(`/jobs/${job.id}/stages`)}
            >
              Gerenciar Etapas
            </Button>
            <Button 
              type="primary" 
              icon={<EditOutlined />}
              onClick={() => navigate(`/jobs/${job.id}/edit`)}
            >
              Editar
            </Button>
            <Button 
              icon={<HistoryOutlined />}
              onClick={() => navigate(`/jobs/${job.id}/logs`)}
            >
              Ver Logs
            </Button>
          </Space>
        </div>

        <Descriptions bordered column={2}>
          <Descriptions.Item label="Status">
            <Tag color={getStatusColor(job.status)}>
              {getStatusText(job.status)}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Data de Expiração">
            {job.expirationDate ? formatDate(job.expirationDate) : 'Não definida'}
          </Descriptions.Item>
          <Descriptions.Item label="Empresa">
            {job.company?.name || 'N/A'}
          </Descriptions.Item>
          <Descriptions.Item label="Departamento">
            {job.department ? (
              <Tag color="blue">{job.department.name} ({job.department.code})</Tag>
            ) : (
              <span style={{ color: '#999' }}>Não definido</span>
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Criado por">
            {job.createdBy ? `${job.createdBy.firstName} ${job.createdBy.lastName}` : 'N/A'}
          </Descriptions.Item>
          <Descriptions.Item label="Criado em">
            {formatDate(job.createdAt)}
          </Descriptions.Item>
          <Descriptions.Item label="Última atualização">
            {formatDate(job.updatedAt)}
          </Descriptions.Item>
        </Descriptions>

        <Divider />

        <Title level={3}>Descrição</Title>
        <Paragraph style={{ fontSize: '16px', lineHeight: '1.6' }}>
          {job.description}
        </Paragraph>

        <Divider />

        <Title level={3}>Requisitos</Title>
        <Paragraph style={{ fontSize: '16px', lineHeight: '1.6' }}>
          {job.requirements}
        </Paragraph>

        {job.questions && job.questions.length > 0 && (
          <>
            <Divider />
            <Title level={3}>Perguntas do Processo Seletivo</Title>
            <List
              dataSource={job.questions}
              renderItem={(question, index) => (
                <List.Item>
                  <div style={{ width: '100%' }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
                      {index + 1}. {question.question}
                    </div>
                    <div style={{ color: '#666', fontSize: '14px' }}>
                      {question.isRequired ? 'Obrigatória' : 'Opcional'}
                    </div>
                  </div>
                </List.Item>
              )}
            />
          </>
        )}

        {job.stages && job.stages.length > 0 && (
          <>
            <Divider />
            <Title level={3}>Etapas do Processo Seletivo</Title>
            <List
              dataSource={job.stages}
              renderItem={(stage, index) => (
                <List.Item>
                  <div style={{ width: '100%' }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
                      {index + 1}. {stage.name}
                    </div>
                    {stage.description && (
                      <div style={{ color: '#666', fontSize: '14px', marginBottom: '4px' }}>
                        {stage.description}
                      </div>
                    )}
                    <div style={{ color: '#999', fontSize: '12px' }}>
                      {stage.isActive ? 'Ativa' : 'Inativa'}
                    </div>
                  </div>
                </List.Item>
              )}
            />
          </>
        )}

      </Card>
    </div>
  );
}; 