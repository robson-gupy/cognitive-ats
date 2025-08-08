import React, { useState, useEffect } from 'react';
import { Table, Button, Tag, Space, message, Popconfirm, Card, Typography, Dropdown, Input, Select, Row, Col } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, UserOutlined, RobotOutlined, DownOutlined, SearchOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import type { Job } from '../types/Job';
import type { Department } from '../types/Department';
import { JobStatus } from '../types/Job';

const { Title } = Typography;
const { Search } = Input;
const { Option } = Select;

export const JobList: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [departmentsLoading, setDepartmentsLoading] = useState(false);
  const navigate = useNavigate();

  // Estados dos filtros
  const [searchText, setSearchText] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');

  useEffect(() => {
    loadJobs();
    loadDepartments();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [jobs, searchText, selectedDepartment, selectedStatus]);

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

  const loadDepartments = async () => {
    try {
      setDepartmentsLoading(true);
      const data = await apiService.getDepartments();
      setDepartments(data);
    } catch (error) {
      message.error('Erro ao carregar departamentos');
    } finally {
      setDepartmentsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...jobs];

    // Filtro por texto de busca (título)
    if (searchText) {
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Filtro por departamento
    if (selectedDepartment) {
      filtered = filtered.filter(job =>
        job.department?.id === selectedDepartment
      );
    }

    // Filtro por status
    if (selectedStatus) {
      filtered = filtered.filter(job =>
        job.status === selectedStatus
      );
    }

    setFilteredJobs(filtered);
  };

  const clearFilters = () => {
    setSearchText('');
    setSelectedDepartment('');
    setSelectedStatus('');
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

        {/* Filtros */}
        <Card 
          size="small" 
          style={{ marginBottom: '16px', backgroundColor: '#fafafa' }}
        >
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={12} md={8} lg={6}>
              <div style={{ marginBottom: '4px', fontSize: '12px', fontWeight: '500', color: '#666' }}>
                Buscar por título
              </div>
              <Search
                placeholder="Digite o título da vaga..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
                prefix={<SearchOutlined />}
              />
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <div style={{ marginBottom: '4px', fontSize: '12px', fontWeight: '500', color: '#666' }}>
                Filtrar por departamento
              </div>
              <Select
                placeholder="Selecione um departamento"
                value={selectedDepartment}
                onChange={setSelectedDepartment}
                allowClear
                loading={departmentsLoading}
                style={{ width: '100%' }}
              >
                {departments.map(dept => (
                  <Option key={dept.id} value={dept.id}>
                    {dept.name}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <div style={{ marginBottom: '4px', fontSize: '12px', fontWeight: '500', color: '#666' }}>
                Filtrar por status
              </div>
              <Select
                placeholder="Selecione um status"
                value={selectedStatus}
                onChange={setSelectedStatus}
                allowClear
                style={{ width: '100%' }}
              >
                <Option value={JobStatus.DRAFT}>Rascunho</Option>
                <Option value={JobStatus.PUBLISHED}>Publicada</Option>
                <Option value={JobStatus.CLOSED}>Fechada</Option>
                <Option value={JobStatus.PAUSED}>Pausada</Option>
              </Select>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <div style={{ marginBottom: '4px', fontSize: '12px', fontWeight: '500', color: '#666' }}>
                Ações
              </div>
              <Button 
                onClick={clearFilters}
                style={{ width: '100%' }}
              >
                Limpar Filtros
              </Button>
            </Col>
          </Row>
          
          {/* Resumo dos filtros aplicados */}
          {(searchText || selectedDepartment || selectedStatus) && (
            <div style={{ marginTop: '12px', fontSize: '12px', color: '#666' }}>
              <strong>Filtros ativos:</strong>
              {searchText && ` Busca: "${searchText}"`}
              {selectedDepartment && ` Departamento: "${departments.find(d => d.id === selectedDepartment)?.name}"`}
              {selectedStatus && ` Status: "${getStatusText(selectedStatus as JobStatus)}"`}
              {` (${filteredJobs.length} de ${jobs.length} vagas)`}
            </div>
          )}
        </Card>

        <Table
          columns={columns}
          dataSource={filteredJobs}
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