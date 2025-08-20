import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  Card, 
  Typography, 
  Tag, 
  Space, 
  Button, 
  Avatar,
  message, 
  Spin,
  Badge,
  Modal,
  Form,
  Input,
  Drawer,
  Descriptions,
  Timeline,
  Row,
  Col
} from 'antd';
import { 
  UserOutlined, 
  MailOutlined, 
  CalendarOutlined, 
  FileTextOutlined, 
  DragOutlined,
  CloseOutlined,
  TrophyOutlined,
  BookOutlined,
  GlobalOutlined,
  StarOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  KeyboardSensor,
} from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import {
  useDroppable,
  useDraggable,
} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { apiService } from '../services/api';
import type { Application } from '../types/Application';
import type { Job, JobStage } from '../types/Job';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface DraggableApplicationCardProps {
  application: Application;
  onViewResume?: () => void;
  onViewResponses?: () => void;
  onCardClick?: () => void;
  hasPendingChange?: boolean;
}

const DraggableApplicationCard: React.FC<DraggableApplicationCardProps> = ({ 
  application, 
  onViewResume, 
  onViewResponses,
  onCardClick,
  hasPendingChange = false
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({ id: application.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  // Estado para controlar se o usuário está arrastando
  const [isDraggingState, setIsDraggingState] = useState(false);
  const [dragStartTime, setDragStartTime] = useState<number | null>(null);
  const [dragStartPosition, setDragStartPosition] = useState<{ x: number; y: number } | null>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    setDragStartTime(Date.now());
    setDragStartPosition({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (dragStartTime && dragStartPosition) {
      const timeDiff = Date.now() - dragStartTime;
      const distance = Math.sqrt(
        Math.pow(e.clientX - dragStartPosition.x, 2) + 
        Math.pow(e.clientY - dragStartPosition.y, 2)
      );
      
      // Se o clique foi rápido (< 300ms) e não houve movimento significativo (< 5px), abrir o modal
      if (timeDiff < 300 && distance < 5 && !isDraggingState) {
        onCardClick?.();
      }
    }
    setDragStartTime(null);
    setDragStartPosition(null);
  };

  const handleDragStart = () => {
    setIsDraggingState(true);
  };

  const handleDragEnd = () => {
    setIsDraggingState(false);
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

  const getAdherenceLevel = (overallScore?: number) => {
    if (overallScore === undefined || overallScore === null) return null;
    if (overallScore >= 90) return 'Muito alta';
    if (overallScore >= 70) return 'Alta';
    if (overallScore >= 50) return 'Média';
    return 'Baixa';
  };

  const getAdherenceColor = (overallScore?: number) => {
    if (overallScore === undefined || overallScore === null) return 'default';
    if (overallScore >= 90) return 'blue'; // Azul mais escuro
    if (overallScore >= 70) return 'cyan'; // Azul claro
    if (overallScore >= 50) return 'gold'; // Amarela
    return 'red'; // Vermelha
  };

  return (
    <Card
      ref={setNodeRef}
      size="small"
      hoverable
      {...attributes}
      {...listeners}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      style={{
        ...style,
        marginBottom: '8px',
        cursor: isDragging ? 'grabbing' : 'grab',
        backgroundColor: isDragging ? '#f0f0f0' : hasPendingChange ? '#fff7e6' : 'white',
        border: hasPendingChange ? '2px solid #faad14' : undefined,
        opacity: hasPendingChange ? 0.8 : 1,
        userSelect: 'none',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
        <DragOutlined style={{ marginRight: '8px', color: '#999' }} />
        <Avatar 
          size="small" 
          icon={<UserOutlined />} 
          style={{ backgroundColor: '#1890ff' }}
        />
        <div style={{ flex: 1, marginLeft: '8px' }}>
          <Text strong style={{ fontSize: '14px' }}>
            {application.firstName} {application.lastName}
          </Text>
          {hasPendingChange && (
            <div style={{ fontSize: '10px', color: '#faad14', marginTop: '2px' }}>
              ⏳ Aguardando confirmação
            </div>
          )}
        </div>
        <Space size="small">
          {application.overallScore !== undefined && (
            <Tag color={getAdherenceColor(application.overallScore)}>
              {getAdherenceLevel(application.overallScore)}
            </Tag>
          )}
          {application.aiScore !== undefined && (
            <Tag color={getScoreColor(application.aiScore)}>
              {formatScore(application.aiScore)}
            </Tag>
          )}
        </Space>
      </div>

      <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
        <div>
          <MailOutlined style={{ marginRight: '4px' }} />
          {formatContactInfo(application)}
        </div>
        <div>
          <CalendarOutlined style={{ marginRight: '4px' }} />
          {formatDate(application.createdAt)}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '4px' }}>
        {application.resumeUrl && (
          <Button 
            type="text" 
            size="small" 
            icon={<FileTextOutlined />}
            onClick={onViewResume}
            style={{ padding: '0 4px' }}
          >
            CV
          </Button>
        )}
        {application.questionResponses && application.questionResponses.length > 0 && (
          <Button 
            type="text" 
            size="small" 
            onClick={onViewResponses}
            style={{ padding: '0 4px' }}
          >
            {application.questionResponses.length} respostas
          </Button>
        )}
      </div>
    </Card>
  );
};

interface StageColumnProps {
  stage: JobStage;
  applications: Application[];
  onViewResume: (application: Application) => void;
  onViewResponses: (application: Application) => void;
  onCardClick: (application: Application) => void;
  pendingStageChanges: Map<string, string>;
}

const StageColumn: React.FC<StageColumnProps> = ({ 
  stage, 
  applications, 
  onViewResume,
  onViewResponses,
  onCardClick,
  pendingStageChanges
}) => {
  const {
    setNodeRef,
    isOver,
  } = useDroppable({ id: stage.id! });





  const style = {
    backgroundColor: isOver ? '#f0f8ff' : 'white',
    border: isOver ? '2px dashed #1890ff' : '1px solid #e8e8e8',
  };

  return (
    <div
      ref={setNodeRef}
      className="stage-column"
      style={{
        ...style,
        minWidth: '320px',
        maxWidth: '380px',
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '16px',
        margin: '0 8px',
        height: 'fit-content',
        maxHeight: 'calc(100vh - 240px)',
        overflowY: 'auto',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        border: '1px solid #e8e8e8',
        position: 'relative',
        zIndex: 2
      }}
    >
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '16px',
        padding: '12px',
        backgroundColor: '#fafafa',
        borderRadius: '8px',
        border: '1px solid #e8e8e8'
      }}>
        <div>
          <Title level={5} style={{ margin: 0, fontSize: '16px' }}>
            {stage.name}
          </Title>
        </div>
        <Badge count={applications.length} showZero style={{ backgroundColor: '#1890ff' }} />
      </div>

      <div>
        {applications.map((application) => (
          <DraggableApplicationCard
            key={application.id}
            application={application}
            onViewResume={() => onViewResume(application)}
            onViewResponses={() => onViewResponses(application)}
            onCardClick={() => onCardClick(application)}
            hasPendingChange={pendingStageChanges.has(application.id)}
          />
        ))}
      </div>

      {applications.length === 0 && (
        <div style={{ 
          textAlign: 'center', 
          padding: '20px', 
          color: '#999',
          fontSize: '12px'
        }}>
          Nenhum candidato nesta etapa
        </div>
      )}
    </div>
  );
};

export const ApplicationsList: React.FC = () => {
  const { id: jobId, applicationId } = useParams<{ id: string; applicationId?: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [job, setJob] = useState<Job | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeId, setActiveId] = useState<string | null>(null);
  const [isChangingStage, setIsChangingStage] = useState(false);
  
  // Estado para controlar mudanças temporárias de stage
  const [pendingStageChanges, setPendingStageChanges] = useState<Map<string, string>>(new Map());
  
  // Estado para controlar o modal lateral de detalhes da application
  const [applicationDetailsDrawer, setApplicationDetailsDrawer] = useState<{
    visible: boolean;
    application: Application | null;
  }>({
    visible: false,
    application: null,
  });

  // Estado para armazenar os dados do resume
  const [resumeData, setResumeData] = useState<any>(null);
  const [resumeLoading, setResumeLoading] = useState(false);
  
  const [changeStageModal, setChangeStageModal] = useState<{
    visible: boolean;
    application: Application | null;
    toStage: JobStage | null;
    notes: string;
  }>({
    visible: false,
    application: null,
    toStage: null,
    notes: '',
  });

  const [responsesModal, setResponsesModal] = useState<{
    visible: boolean;
    application: Application | null;
  }>({
    visible: false,
    application: null,
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3,
      },
    }),
    useSensor(KeyboardSensor),
  );

  useEffect(() => {
    if (jobId) {
      loadJob();
      loadApplications();
    }
  }, [jobId]);

  // useEffect para detectar mudanças na URL e abrir o modal automaticamente
  useEffect(() => {
    if (applicationId && applications.length > 0) {
      const application = applications.find(app => app.id === applicationId);
      if (application) {
        setApplicationDetailsDrawer({
          visible: true,
          application,
        });
        
        // Buscar os dados do resume
        loadResumeData(application.id);
      }
    }
  }, [applicationId, applications]);

  // useEffect para sincronizar o estado do modal com a URL
  useEffect(() => {
    if (applicationDetailsDrawer.visible && applicationDetailsDrawer.application) {
      // Atualizar a URL para incluir o applicationId no path
      const newUrl = `/jobs/${jobId}/applications/${applicationDetailsDrawer.application.id}`;
      navigate(newUrl, { replace: true });
    }
  }, [applicationDetailsDrawer.visible, applicationDetailsDrawer.application, jobId, navigate]);

  // useEffect para lidar com o botão voltar do navegador
  useEffect(() => {
    const handlePopState = () => {
      // Verificar se há applicationId na URL atual
      const currentPath = location.pathname;
      const pathParts = currentPath.split('/');
      const currentApplicationId = pathParts[pathParts.length - 1];
      
      // Se o último segmento não é um applicationId válido (não é um UUID), fechar o modal
      if (!currentApplicationId || currentApplicationId === 'applications' || currentApplicationId === jobId) {
        setApplicationDetailsDrawer({ visible: false, application: null });
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [location.pathname, jobId]);


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
      
      const data = await apiService.getApplicationsWithQuestionResponses(jobId!);
      
      setApplications(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar aplicações');
      message.error('Erro ao carregar aplicações');
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const applicationId = active.id as string;
    const toStageId = over.id as string;

    // Encontrar a aplicação e o stage atual
    const application = applications.find(app => app.id === applicationId);
    const toStage = job?.stages.find(stage => stage.id === toStageId);

    if (!application || !toStage) {
      return;
    }

    // Se a aplicação já está no stage de destino, não fazer nada
    if (application.currentStageId === toStageId) {
      return;
    }
    
    // Aplicar mudança visual imediatamente
    setPendingStageChanges(prev => new Map(prev.set(applicationId, toStageId)));

    // Abrir modal para confirmar a mudança
    setChangeStageModal({
      visible: true,
      application,
      toStage,
      notes: '',
    });
  };

  const handleStageChange = async () => {
    if (!changeStageModal.application || !changeStageModal.toStage) return;

    try {
      setIsChangingStage(true);
      
      await apiService.changeApplicationStage(
        jobId!,
        changeStageModal.application.id,
        {
          toStageId: changeStageModal.toStage.id!,
          notes: changeStageModal.notes,
        }
      );

      message.success('Candidato movido com sucesso!');
      
      // Limpar mudança temporária
      setPendingStageChanges(prev => {
        const newMap = new Map(prev);
        newMap.delete(changeStageModal.application!.id);
        return newMap;
      });
      
      // Recarregar aplicações para atualizar o estado
      await loadApplications();
      
      setChangeStageModal({
        visible: false,
        application: null,
        toStage: null,
        notes: '',
      });
    } catch (err) {
      message.error('Erro ao mover candidato');
      console.error('Erro ao mudar stage:', err);
    } finally {
      setIsChangingStage(false);
    }
  };

  const handleViewResume = (application: Application) => {
    if (application.resumeUrl) {
      // Abre o CV em uma nova aba usando o path relativo
      // O Caddyfile já está configurado para redirecionar /cognitive-ats-uploads/* para localstack:4566
      window.open(application.resumeUrl, '_blank');
    }
  };

  const handleViewResponses = (application: Application) => {
    setResponsesModal({
      visible: true,
      application,
    });
  };

  const handleApplicationCardClick = (application: Application) => {
    setApplicationDetailsDrawer({
      visible: true,
      application,
    });
    
    // Atualizar a URL para incluir o applicationId no path
    const newUrl = `/jobs/${jobId}/applications/${application.id}`;
    navigate(newUrl, { replace: true });

    // Buscar os dados do resume
    loadResumeData(application.id);
  };

  const loadResumeData = async (applicationId: string) => {
    try {
      setResumeLoading(true);
      setResumeData(null);
      
      const resume = await apiService.getApplicationResume(applicationId);
      setResumeData(resume);
    } catch (error) {
      console.error('Erro ao carregar dados do resume:', error);
      // Não mostrar erro para o usuário, apenas log
      setResumeData(null);
    } finally {
      setResumeLoading(false);
    }
  };

  const handleCloseApplicationDrawer = () => {
    setApplicationDetailsDrawer({ visible: false, application: null });
    
    // Remover o applicationId da URL
    const newUrl = `/jobs/${jobId}/applications`;
    navigate(newUrl, { replace: true });
  };

  const getApplicationsByStage = (stageId: string) => {
    return applications
      .filter(app => {
        // Verificar se há uma mudança temporária para esta aplicação
        const pendingStageId = pendingStageChanges.get(app.id);
        const effectiveStageId = pendingStageId || app.currentStageId;
        return effectiveStageId === stageId;
      })
      .sort((a, b) => {
        // Ordenar por overall_score do maior para o menor
        const scoreA = a.overallScore ?? 0;
        const scoreB = b.overallScore ?? 0;
        return scoreB - scoreA; // Ordem decrescente
      });
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

  if (!job || !job.stages || job.stages.length === 0) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Title level={4}>Nenhuma etapa configurada</Title>
          <Text type="secondary">
            Esta vaga não possui etapas configuradas. Configure as etapas primeiro.
          </Text>
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
              {applications.length} candidato{applications.length !== 1 ? 's' : ''} inscrito{applications.length !== 1 ? 's' : ''} • Ordenados por aderência (maior para menor)
            </Text>
          </div>
          
          <Space>
            <Button type="primary" onClick={loadApplications}>
              Atualizar
            </Button>
          </Space>
        </div>
      </Card>

      {/* Trello Board */}
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
        <div style={{ 
          backgroundColor: '#f0f2f5', 
          padding: '16px', 
          borderRadius: '8px',
          minHeight: 'calc(100vh - 200px)',
          position: 'relative',
          zIndex: 1
        }}>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div style={{ 
              display: 'flex', 
              gap: '16px', 
              overflowX: 'auto',
              padding: '8px',
              minHeight: 'calc(100vh - 240px)'
            }}>
              {job.stages
                .filter(stage => stage.isActive)
                .sort((a, b) => a.orderIndex - b.orderIndex)
                .map((stage) => (
                  <StageColumn
                    key={stage.id}
                    stage={stage}
                    applications={getApplicationsByStage(stage.id!)}
                    onViewResume={handleViewResume}
                    onViewResponses={handleViewResponses}
                    onCardClick={handleApplicationCardClick}
                    pendingStageChanges={pendingStageChanges}
                  />
                ))}
            </div>

            <DragOverlay>
              {activeId ? (
                <div style={{ 
                  backgroundColor: 'white',
                  padding: '16px',
                  borderRadius: '8px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                  border: '2px solid #1890ff',
                  maxWidth: '300px',
                  transform: 'rotate(5deg)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                    <DragOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                    <Avatar 
                      size="small" 
                      icon={<UserOutlined />} 
                      style={{ backgroundColor: '#1890ff' }}
                    />
                    <div style={{ flex: 1, marginLeft: '8px' }}>
                      <Text strong style={{ fontSize: '14px', color: '#1890ff' }}>
                        Arrastando candidato...
                      </Text>
                    </div>
                  </div>
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>
      )}

      {/* Drawer lateral com detalhes da Application */}
      <Drawer
        title={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>Detalhes do Candidato</span>
            <Button 
              type="text" 
              icon={<CloseOutlined />} 
              onClick={handleCloseApplicationDrawer}
            />
          </div>
        }
        placement="right"
        width={600}
        open={applicationDetailsDrawer.visible}
        onClose={handleCloseApplicationDrawer}
        bodyStyle={{ padding: '24px' }}
        headerStyle={{ padding: '16px 24px' }}
      >
        {applicationDetailsDrawer.application && (
          <div>
            {/* Informações básicas do candidato */}
            <Card size="small" style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                <Avatar 
                  size={64} 
                  icon={<UserOutlined />} 
                  style={{ backgroundColor: '#1890ff', marginRight: '16px' }}
                />
                <div>
                  <Title level={3} style={{ margin: 0 }}>
                    {applicationDetailsDrawer.application.firstName} {applicationDetailsDrawer.application.lastName}
                  </Title>
                  <Text type="secondary">
                    Candidato em {applicationDetailsDrawer.application.currentStage?.name || 'Etapa não definida'}
                  </Text>
                </div>
              </div>
              
              <Row gutter={16}>
                <Col span={12}>
                  <Descriptions size="small" column={1}>
                    <Descriptions.Item label="Email">
                      {applicationDetailsDrawer.application.email || 'Não informado'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Telefone">
                      {applicationDetailsDrawer.application.phone || 'Não informado'}
                    </Descriptions.Item>
                  </Descriptions>
                </Col>
                <Col span={12}>
                  <Descriptions size="small" column={1}>
                    <Descriptions.Item label="Data de inscrição">
                      {new Date(applicationDetailsDrawer.application.createdAt).toLocaleDateString('pt-BR')}
                    </Descriptions.Item>
                    <Descriptions.Item label="Última atualização">
                      {new Date(applicationDetailsDrawer.application.updatedAt).toLocaleDateString('pt-BR')}
                    </Descriptions.Item>
                  </Descriptions>
                </Col>
              </Row>
            </Card>

            {/* Scores e avaliações */}
            <Card size="small" style={{ marginBottom: '24px' }} title="Avaliações">
              <Row gutter={16}>
                <Col span={8}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}>
                      {applicationDetailsDrawer.application.overallScore || 'N/A'}
                    </div>
                    <Text type="secondary">Aderência (%)</Text>
                  </div>
                </Col>
                <Col span={8}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#52c41a' }}>
                      {applicationDetailsDrawer.application.aiScore ? `${applicationDetailsDrawer.application.aiScore.toFixed(1)}/10` : 'N/A'}
                    </div>
                    <Text type="secondary">Score AI</Text>
                  </div>
                </Col>
                <Col span={8}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#722ed1' }}>
                      {applicationDetailsDrawer.application.questionResponsesScore || 'N/A'}
                    </div>
                    <Text type="secondary">Respostas (%)</Text>
                  </div>
                </Col>
              </Row>
            </Card>

            {/* Resume/CV */}
            {resumeData && (
              <Card size="small" style={{ marginBottom: '24px' }} title="Currículo">
                {resumeData.summary && (
                  <div style={{ marginBottom: '16px' }}>
                    <Text strong>Resumo:</Text>
                    <div style={{ marginTop: '8px', padding: '12px', backgroundColor: '#fafafa', borderRadius: '6px' }}>
                      {resumeData.summary}
                    </div>
                  </div>
                )}

                {resumeData.professionalExperiences && resumeData.professionalExperiences.length > 0 && (
                  <div style={{ marginBottom: '16px' }}>
                    <Text strong>Experiência Profissional:</Text>
                    <Timeline style={{ marginTop: '8px' }}>
                      {resumeData.professionalExperiences.map((exp: any) => (
                        <Timeline.Item 
                          key={exp.id} 
                          dot={<TrophyOutlined style={{ color: '#1890ff' }} />}
                        >
                          <div>
                            <Text strong>{exp.position}</Text>
                            <br />
                            <Text type="secondary">{exp.company}</Text>
                            <br />
                            <Text type="secondary">
                              {new Date(exp.startDate).toLocaleDateString('pt-BR')} - 
                              {exp.endDate ? new Date(exp.endDate).toLocaleDateString('pt-BR') : 'Atual'}
                            </Text>
                            {exp.description && (
                              <div style={{ marginTop: '8px', color: '#666' }}>
                                {exp.description}
                              </div>
                            )}
                          </div>
                        </Timeline.Item>
                      ))}
                    </Timeline>
                  </div>
                )}

                {resumeData.academicFormations && resumeData.academicFormations.length > 0 && (
                  <div style={{ marginBottom: '16px' }}>
                    <Text strong>Formação Acadêmica:</Text>
                    <Timeline style={{ marginTop: '8px' }}>
                      {resumeData.academicFormations.map((formation: any) => (
                        <Timeline.Item 
                          key={formation.id} 
                          dot={<BookOutlined style={{ color: '#52c41a' }} />}
                        >
                          <div>
                            <Text strong>{formation.course}</Text>
                            <br />
                            <Text type="secondary">{formation.institution}</Text>
                            <br />
                            <Text type="secondary">
                              {formation.degree} • {new Date(formation.startDate).toLocaleDateString('pt-BR')} - 
                              {formation.endDate ? new Date(formation.endDate).toLocaleDateString('pt-BR') : 'Atual'}
                            </Text>
                          </div>
                        </Timeline.Item>
                      ))}
                    </Timeline>
                  </div>
                )}

                {resumeData.achievements && resumeData.achievements.length > 0 && (
                  <div style={{ marginBottom: '16px' }}>
                    <Text strong>Conquistas:</Text>
                    <div style={{ marginTop: '8px' }}>
                      {resumeData.achievements.map((achievement: any) => (
                        <div key={achievement.id} style={{ 
                          padding: '8px 12px', 
                          backgroundColor: '#fff7e6', 
                          borderRadius: '6px', 
                          marginBottom: '8px',
                          border: '1px solid #ffe58f'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <StarOutlined style={{ color: '#faad14', marginRight: '8px' }} />
                            <div>
                              <Text strong>{achievement.title}</Text>
                              {achievement.year && (
                                <Text type="secondary" style={{ marginLeft: '8px' }}>
                                  ({achievement.year})
                                </Text>
                              )}
                            </div>
                          </div>
                          {achievement.description && (
                            <div style={{ marginTop: '4px', color: '#666', fontSize: '12px' }}>
                              {achievement.description}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {resumeData.languages && resumeData.languages.length > 0 && (
                  <div>
                    <Text strong>Idiomas:</Text>
                    <div style={{ marginTop: '8px' }}>
                      {resumeData.languages.map((language: any) => (
                        <Tag key={language.id} icon={<GlobalOutlined />} style={{ marginBottom: '4px' }}>
                          {language.language} - {language.level}
                        </Tag>
                      ))}
                    </div>
                  </div>
                )}

                {applicationDetailsDrawer.application?.resumeUrl && (
                  <div style={{ marginTop: '16px', textAlign: 'center' }}>
                    <Button 
                      type="primary" 
                      icon={<FileTextOutlined />}
                      onClick={() => handleViewResume(applicationDetailsDrawer.application!)}
                    >
                      Visualizar CV Completo
                    </Button>
                  </div>
                )}
              </Card>
            )}

            {/* Loading do Resume */}
            {resumeLoading && (
              <Card size="small" style={{ marginBottom: '24px' }} title="Currículo">
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <Spin size="large" />
                  <div style={{ marginTop: '16px' }}>Carregando dados do currículo...</div>
                </div>
              </Card>
            )}

            {/* Fallback para quando não há resume */}
            {!resumeData && !resumeLoading && (
              <Card size="small" style={{ marginBottom: '24px' }} title="Currículo">
                <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                  <FileTextOutlined style={{ fontSize: '24px', marginBottom: '8px' }} />
                  <div>Nenhum currículo encontrado para este candidato.</div>
                  <div style={{ fontSize: '12px', marginTop: '8px' }}>
                    O currículo pode não ter sido processado ainda ou não foi enviado.
                  </div>
                </div>
              </Card>
            )}

            {/* Respostas das perguntas */}
            {applicationDetailsDrawer.application.questionResponses && applicationDetailsDrawer.application.questionResponses.length > 0 && (
              <Card size="small" title="Respostas das Perguntas da Vaga">
                {applicationDetailsDrawer.application.questionResponses.map((response, index) => (
                  <div key={response.id} style={{ marginBottom: '16px' }}>
                    <div style={{ 
                      padding: '12px', 
                      backgroundColor: '#f0f8ff', 
                      borderRadius: '6px',
                      border: '1px solid #d6e4ff'
                    }}>
                      <div style={{ marginBottom: '8px' }}>
                        <Text strong style={{ color: '#1890ff' }}>
                          <CheckCircleOutlined style={{ marginRight: '8px' }} />
                          Pergunta {index + 1}:
                        </Text>
                        <div style={{ marginTop: '4px', color: '#333', fontWeight: '500' }}>
                          {response.question}
                        </div>
                      </div>
                      <div>
                        <Text strong>Resposta:</Text>
                        <div style={{ 
                          marginTop: '4px', 
                          color: '#333',
                          padding: '8px 12px',
                          backgroundColor: 'white',
                          borderRadius: '4px',
                          border: '1px solid #e8e8e8'
                        }}>
                          {response.answer}
                        </div>
                      </div>
                      <div style={{ 
                        marginTop: '8px', 
                        fontSize: '11px', 
                        color: '#999',
                        textAlign: 'right'
                      }}>
                        Respondida em: {new Date(response.createdAt).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </Card>
            )}

            {/* Histórico de mudanças de etapa */}
            {applicationDetailsDrawer.application.stageHistory && applicationDetailsDrawer.application.stageHistory.length > 0 && (
              <Card size="small" title="Histórico de Mudanças de Etapa">
                <Timeline>
                  {applicationDetailsDrawer.application.stageHistory.map((history, index) => (
                    <Timeline.Item 
                      key={history.id}
                      color={index === 0 ? '#52c41a' : '#1890ff'}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Text strong>
                            {history.fromStage ? `${history.fromStage.name} → ${history.toStage?.name || 'Etapa não definida'}` : `→ ${history.toStage?.name || 'Etapa não definida'}`}
                          </Text>
                          <Text type="secondary" style={{ fontSize: '12px' }}>
                            {new Date(history.createdAt).toLocaleDateString('pt-BR')}
                          </Text>
                        </div>
                        {history.changedBy && (
                          <Text type="secondary" style={{ fontSize: '12px' }}>
                            Alterado por: {history.changedBy.firstName} {history.changedBy.lastName}
                          </Text>
                        )}
                        {history.notes && (
                          <div style={{ 
                            marginTop: '8px', 
                            padding: '8px 12px', 
                            backgroundColor: '#f6ffed', 
                            borderRadius: '4px',
                            fontSize: '12px',
                            color: '#666'
                          }}>
                            <Text strong>Observações:</Text> {history.notes}
                          </div>
                        )}
                      </div>
                    </Timeline.Item>
                  ))}
                </Timeline>
              </Card>
            )}
          </div>
        )}
      </Drawer>

      {/* Modal de Confirmação de Mudança de Stage */}
      <Modal
        title="Confirmar mudança de etapa"
        open={changeStageModal.visible}
        onOk={handleStageChange}
        onCancel={() => {
          // Reverter mudança visual se cancelar
          if (changeStageModal.application) {
            setPendingStageChanges(prev => {
              const newMap = new Map(prev);
              newMap.delete(changeStageModal.application!.id);
              return newMap;
            });
          }
          
          setChangeStageModal({
            visible: false,
            application: null,
            toStage: null,
            notes: '',
          });
        }}
        confirmLoading={isChangingStage}
        okText="Confirmar"
        cancelText="Cancelar"
        style={{ zIndex: 1000 }}
        maskStyle={{ zIndex: 999 }}
      >
        {changeStageModal.application && changeStageModal.toStage && (
          <div>
            <p>
              <strong>Mover candidato:</strong> {changeStageModal.application.firstName} {changeStageModal.application.lastName}
            </p>
            <p>
              <strong>Para etapa:</strong> {changeStageModal.toStage.name}
            </p>
            <Form layout="vertical">
              <Form.Item label="Observações (opcional)">
                <TextArea
                  rows={3}
                  value={changeStageModal.notes}
                  onChange={(e) => setChangeStageModal(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Adicione observações sobre esta mudança..."
                />
              </Form.Item>
            </Form>
          </div>
        )}
      </Modal>

      {/* Modal de Respostas das Questões */}
      <Modal
        title={`Respostas de ${responsesModal.application?.firstName} ${responsesModal.application?.lastName}`}
        open={responsesModal.visible}
        onCancel={() => setResponsesModal({
          visible: false,
          application: null,
        })}
        footer={[
          <Button 
            key="close" 
            onClick={() => setResponsesModal({
              visible: false,
              application: null,
            })}
          >
            Fechar
          </Button>
        ]}
        width={600}
        style={{ top: 20 }}
        bodyStyle={{ 
          maxHeight: 'calc(100vh - 200px)', 
          overflowY: 'auto',
          padding: '16px'
        }}
      >
        {responsesModal.application && (
          <div>
            {responsesModal.application.questionResponses && responsesModal.application.questionResponses.length > 0 ? (
              <div>
                {responsesModal.application.questionResponses.map((response, index) => (
                  <Card 
                    key={response.id} 
                    size="small" 
                    style={{ marginBottom: '12px' }}
                    title={`Pergunta ${index + 1}`}
                  >
                    <div style={{ marginBottom: '8px' }}>
                      <Text strong>Pergunta:</Text>
                      <div style={{ marginTop: '4px', color: '#666' }}>
                        {response.question}
                      </div>
                    </div>
                    <div>
                      <Text strong>Resposta:</Text>
                      <div style={{ marginTop: '4px', color: '#333' }}>
                        {response.answer}
                      </div>
                    </div>
                    <div style={{ marginTop: '8px', fontSize: '12px', color: '#999' }}>
                      Respondida em: {new Date(response.createdAt).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                <p>Nenhuma resposta encontrada para este candidato.</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};
