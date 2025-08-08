import React, { useState, useEffect } from 'react';
import { Table, Button, Tag, Space, message, Popconfirm, Card, Typography, Dropdown } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, UserOutlined, RobotOutlined, DownOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import type { Job } from '../types/Job';
import { JobStatus } from '../types/Job';

const { Title } = Typography;

export const JobList: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const data = await apiService.getJobs();
      setJobs(data);
    } catch (error) {
      message.error('Erro ao carregar vagas');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const result = await apiService.deleteJob(id);
      message.success(result.message || 'Vaga excluída com sucesso');
      loadJobs();
    } catch (error) {
      message.error('Erro ao excluir vaga');
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

  const columns = [
    {
      title: 'Título',
      dataIndex: 'title',
      key: 'title',
      render: (text: string) => <strong>{text}</strong>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: JobStatus) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: 'Departamento',
      dataIndex: 'department',
      key: 'department',
      render: (department: any) => department ? (
        <Tag color="blue">{department.name}</Tag>
      ) : (
        <span style={{ color: '#999' }}>Não definido</span>
      ),
    },
    {
      title: 'Data de Expiração',
      dataIndex: 'expirationDate',
      key: 'expirationDate',
      render: (date: string) => new Date(date).toLocaleDateString('pt-BR'),
    },
    {
      title: 'Perguntas',
      dataIndex: 'questions',
      key: 'questions',
      render: (questions: any[]) => questions?.length || 0,
    },
    {
      title: 'Etapas',
      dataIndex: 'stages',
      key: 'stages',
      render: (stages: any[]) => stages?.length || 0,
    },
    {
      title: 'Criada em',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString('pt-BR'),
    },
    {
      title: 'Ações',
      key: 'actions',
      render: (_: any, record: Job) => (
        <Space>
          <Button
            type="primary"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/jobs/${record.id}`)}
          >
            Ver
          </Button>
          {record.status === JobStatus.PUBLISHED && (
            <Button
              icon={<UserOutlined />}
              onClick={() => navigate(`/jobs/${record.id}/applications`)}
            >
              Candidatos
            </Button>
          )}
          <Button
            icon={<EditOutlined />}
            onClick={() => navigate(`/jobs/${record.id}/edit`)}
          >
            Editar
          </Button>
          <Popconfirm
            title="Tem certeza que deseja excluir esta vaga?"
            onConfirm={() => handleDelete(record.id)}
            okText="Sim"
            cancelText="Não"
          >
            <Button danger icon={<DeleteOutlined />}>
              Excluir
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <Title level={2}>Gerenciamento de Vagas</Title>
          <Dropdown
            menu={{
              items: [
                {
                  key: 'manual',
                  label: 'Criar Manualmente',
                  icon: <PlusOutlined />,
                  onClick: () => navigate('/jobs/new'),
                },
                {
                  key: 'ai',
                  label: 'Criar com IA',
                  icon: <RobotOutlined />,
                  onClick: () => navigate('/jobs/new-with-ai'),
                },
              ],
            }}
          >
            <Button type="primary" size="large">
              <Space>
                <PlusOutlined />
                Nova Vaga
                <DownOutlined />
              </Space>
            </Button>
          </Dropdown>
        </div>

        <Table
          columns={columns}
          dataSource={jobs}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} de ${total} vagas`,
          }}
        />
      </Card>
    </div>
  );
}; 