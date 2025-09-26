import React, {useEffect, useState} from 'react';
import {Button, Card, Divider, Form, Input, message, Select, Space, Switch, Typography} from 'antd';
import {useNavigate, useParams} from 'react-router-dom';
import {DeleteOutlined, DragOutlined, PlusOutlined} from '@ant-design/icons';
import {apiService} from '../services/api';
import type {CreateJobData, Job, UpdateJobData} from '../types/Job';
import {JobStatus} from '../types/Job';
import type {Department} from '../types/Department';
import type {DragEndEvent} from '@dnd-kit/core';
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  MouseSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';

const {Title} = Typography;
const {TextArea} = Input;
const {Option} = Select;

interface JobQuestion {
  id: string;
  question: string;
  isRequired: boolean;
  orderIndex?: number;
}

interface JobStage {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  orderIndex?: number;
}

// Componente sortable para cada pergunta
const SortableQuestionItem: React.FC<{
  question: JobQuestion;
  index: number;
  onUpdate: (index: number, field: keyof JobQuestion, value: any) => void;
  onRemove: (index: number) => void;
}> = ({question, index, onUpdate, onRemove}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({id: question.id});

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 'auto',
    boxShadow: isDragging ? '0 8px 16px rgba(0,0,0,0.2)' : 'none',
  };

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        border: '1px solid #f0f0f0',
        borderRadius: '8px',
        marginBottom: '12px',
        padding: '16px',
        backgroundColor: '#fafafa',
        cursor: isDragging ? 'grabbing' : 'grab',
      }}
      {...attributes}
      {...listeners}
    >
      <div style={{width: '100%'}}>
        <div style={{display: 'flex', alignItems: 'center', marginBottom: '12px'}}>
          <DragOutlined style={{marginRight: '8px', color: '#999'}}/>
          <span style={{fontWeight: 'bold', color: '#1890ff'}}>
            Pergunta {index + 1}
          </span>
          <Button
            type="text"
            danger
            icon={<DeleteOutlined/>}
            onClick={(e) => {
              e.stopPropagation();
              onRemove(index);
            }}
            style={{marginLeft: 'auto'}}
          />
        </div>

        <div style={{marginBottom: '12px'}}>
          <Input
            placeholder="Digite a pergunta..."
            value={question.question}
            onChange={(e) => onUpdate(index, 'question', e.target.value)}
            style={{
              marginBottom: '8px',
              backgroundColor: 'white',
              borderColor: '#d9d9d9'
            }}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          />
        </div>

        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
          <div style={{display: 'flex', alignItems: 'center'}}>
            <Switch
              checked={question.isRequired}
              onChange={(checked) => onUpdate(index, 'isRequired', checked)}
              style={{marginRight: '8px'}}
            />
            <span style={{fontSize: '14px', color: '#666'}}>
              {question.isRequired ? 'Obrigatória' : 'Opcional'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente sortable para cada etapa
const SortableStageItem: React.FC<{
  stage: JobStage;
  index: number;
  onUpdate: (index: number, field: keyof JobStage, value: any) => void;
  onRemove: (index: number) => void;
}> = ({stage, index, onUpdate, onRemove}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({id: stage.id});

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 'auto',
    boxShadow: isDragging ? '0 8px 16px rgba(0,0,0,0.2)' : 'none',
  };

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        border: '1px solid #f0f0f0',
        borderRadius: '8px',
        marginBottom: '12px',
        padding: '16px',
        backgroundColor: '#fafafa',
        cursor: isDragging ? 'grabbing' : 'grab',
      }}
      {...attributes}
      {...listeners}
    >
      <div style={{width: '100%'}}>
        <div style={{display: 'flex', alignItems: 'center', marginBottom: '12px'}}>
          <DragOutlined style={{marginRight: '8px', color: '#999'}}/>
          <span style={{fontWeight: 'bold', color: '#52c41a'}}>
            Etapa {index + 1}
          </span>
          <Button
            type="text"
            danger
            icon={<DeleteOutlined/>}
            onClick={(e) => {
              e.stopPropagation();
              onRemove(index);
            }}
            style={{marginLeft: 'auto'}}
          />
        </div>

        <div style={{marginBottom: '12px'}}>
          <Input
            placeholder="Nome da etapa (ex: Triagem, Entrevista, Teste Técnico)"
            value={stage.name}
            onChange={(e) => onUpdate(index, 'name', e.target.value)}
            style={{
              marginBottom: '8px',
              backgroundColor: 'white',
              borderColor: '#d9d9d9'
            }}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          />
        </div>

        <div style={{marginBottom: '12px'}}>
          <TextArea
            placeholder="Descrição da etapa (opcional)"
            value={stage.description || ''}
            onChange={(e) => onUpdate(index, 'description', e.target.value)}
            rows={2}
            style={{
              backgroundColor: 'white',
              borderColor: '#d9d9d9'
            }}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          />
        </div>

        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
          <div style={{display: 'flex', alignItems: 'center'}}>
            <Switch
              checked={stage.isActive}
              onChange={(checked) => onUpdate(index, 'isActive', checked)}
              style={{marginRight: '8px'}}
            />
            <span style={{fontSize: '14px', color: '#666'}}>
              {stage.isActive ? 'Ativa' : 'Inativa'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export const JobForm: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const {id} = useParams();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);
  const [questions, setQuestions] = useState<JobQuestion[]>([]);
  const [stages, setStages] = useState<JobStage[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const isEditing = !!id;

  const loadDepartments = async () => {
    try {
      setLoadingDepartments(true);
      const departmentsData = await apiService.getDepartments();
      setDepartments(departmentsData);
    } catch (error) {
      message.error('Erro ao carregar departamentos');
      console.error('Erro ao carregar departamentos:', error);
    } finally {
      setLoadingDepartments(false);
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const createDefaultStages = () => {
    const defaultStages: JobStage[] = [
      {
        id: `stage-${Date.now()}-1`,
        name: 'Triagem',
        description: 'Avaliação inicial dos candidatos',
        isActive: true,
        orderIndex: 0,
      },
      {
        id: `stage-${Date.now()}-2`,
        name: 'Entrevista',
        description: 'Entrevista com candidatos selecionados',
        isActive: true,
        orderIndex: 1,
      },
      {
        id: `stage-${Date.now()}-3`,
        name: 'Contratação',
        description: 'Processo final de contratação',
        isActive: true,
        orderIndex: 2,
      },
    ];
    setStages(defaultStages);
  };

  useEffect(() => {
    loadDepartments();
    if (isEditing) {
      loadJob();
    } else {
      // Criar etapas padrão para novas vagas
      createDefaultStages();
    }
  }, [id]);

  const loadJob = async () => {
    try {
      setInitialLoading(true);
      const job: Job = await apiService.getJob(id!);
      form.setFieldsValue({
        title: job.title,
        description: job.description,
        requirements: job.requirements,
        status: job.status,
        departmentId: job.departmentId,
        requiresAddress: job.requiresAddress ?? false,
        // expirationDate: job.expirationDate ? new Date(job.expirationDate) : null,
      });

      // Carregar perguntas existentes
      if (job.questions && job.questions.length > 0) {
        setQuestions(job.questions.map((q, index) => ({
          id: q.id || `question-${index}`,
          question: q.question,
          isRequired: q.isRequired,
          orderIndex: q.orderIndex,
        })));
      }

      // Carregar etapas existentes
      if (job.stages && job.stages.length > 0) {
        setStages(job.stages.map((s, index) => ({
          id: s.id || `stage-${index}`,
          name: s.name,
          description: s.description,
          isActive: s.isActive,
          orderIndex: s.orderIndex,
        })));
      }
    } catch (error) {
      message.error('Erro ao carregar vaga');
      navigate('/jobs');
    } finally {
      setInitialLoading(false);
    }
  };

  const addQuestion = () => {
    const newQuestion: JobQuestion = {
      id: `question-${Date.now()}`,
      question: '',
      isRequired: true,
      orderIndex: questions.length,
    };
    setQuestions([...questions, newQuestion]);
  };

  const removeQuestion = (index: number) => {
    const newQuestions = questions.filter((_, i) => i !== index);
    setQuestions(newQuestions);
  };

  const updateQuestion = (index: number, field: keyof JobQuestion, value: any) => {
    const newQuestions = [...questions];
    newQuestions[index] = {...newQuestions[index], [field]: value};
    setQuestions(newQuestions);
  };

  const addStage = () => {
    const newStage: JobStage = {
      id: `stage-${Date.now()}`,
      name: '',
      description: '',
      isActive: true,
      orderIndex: stages.length,
    };
    setStages([...stages, newStage]);
  };

  const removeStage = (index: number) => {
    const newStages = stages.filter((_, i) => i !== index);
    setStages(newStages);
  };

  const updateStage = (index: number, field: keyof JobStage, value: any) => {
    const newStages = [...stages];
    newStages[index] = {...newStages[index], [field]: value};
    setStages(newStages);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const {active, over} = event;

    console.log('Drag end event:', {
      active: active.id,
      over: over?.id,
      activeType: active.data.current?.type,
      overType: over?.data.current?.type
    });

    if (active.id !== over?.id) {
      const activeId = active.id as string;

      // Verificar se é uma pergunta ou etapa baseado no prefixo do ID ou se existe nos arrays
      const isQuestion = questions.some(q => q.id === activeId);
      const isStage = stages.some(s => s.id === activeId);

      console.log('Item type check:', {
        activeId,
        isQuestion,
        isStage,
        questionsCount: questions.length,
        stagesCount: stages.length
      });

      if (isQuestion) {
        setQuestions((items) => {
          const oldIndex = items.findIndex((item) => item.id === active.id);
          const newIndex = items.findIndex((item) => item.id === over?.id);

          console.log('Reordering questions:', {
            oldIndex,
            newIndex,
            activeId: active.id,
            overId: over?.id,
            itemsCount: items.length
          });

          if (oldIndex === -1 || newIndex === -1) {
            console.error('Invalid indices:', {oldIndex, newIndex});
            return items;
          }

          const newItems = arrayMove(items, oldIndex, newIndex);
          console.log('New questions order:', newItems.map(q => ({id: q.id, question: q.question})));

          return newItems;
        });
      } else if (isStage) {
        setStages((items) => {
          const oldIndex = items.findIndex((item) => item.id === active.id);
          const newIndex = items.findIndex((item) => item.id === over?.id);

          console.log('Reordering stages:', {
            oldIndex,
            newIndex,
            activeId: active.id,
            overId: over?.id,
            itemsCount: items.length
          });

          if (oldIndex === -1 || newIndex === -1) {
            console.error('Invalid indices:', {oldIndex, newIndex});
            return items;
          }

          const newItems = arrayMove(items, oldIndex, newIndex);
          console.log('New stages order:', newItems.map(s => ({id: s.id, name: s.name})));

          return newItems;
        });
      }
    }
  };

  const onFinish = async (values: any) => {
    try {
      setLoading(true);

      const jobData: CreateJobData | UpdateJobData = {
        title: values.title,
        description: values.description,
        requirements: values.requirements,
        ...(values.requiresAddress !== undefined && { requiresAddress: values.requiresAddress }),
        status: isEditing ? values.status : JobStatus.DRAFT,
        ...(values.departmentId && {departmentId: values.departmentId}),
        ...(values.expirationDate && {expirationDate: values.expirationDate.toISOString()}),
        questions: questions.filter(q => q.question.trim() !== '').map((q, index) => ({
          ...(isEditing && q.id && {id: q.id}),
          question: q.question,
          isRequired: q.isRequired,
          orderIndex: index,
        })),
        stages: stages.filter(s => s.name.trim() !== '').map((s, index) => ({
          ...(isEditing && s.id && {id: s.id}),
          name: s.name,
          description: s.description,
          isActive: s.isActive,
          orderIndex: index,
        })),
      };

      if (isEditing) {
        await apiService.updateJob(id!, jobData as UpdateJobData);
        message.success('Vaga atualizada com sucesso');
      } else {
        await apiService.createJob(jobData as CreateJobData);
        message.success('Vaga criada com sucesso');
      }

      navigate('/jobs');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const onCancel = () => {
    navigate('/jobs');
  };

  if (initialLoading) {
    return <div>Carregando...</div>;
  }

  return (
    <div style={{padding: '24px'}}>
      <Card>
        <Title level={2} style={{marginBottom: '24px'}}>
          {isEditing ? 'Editar Vaga' : 'Nova Vaga'}
        </Title>

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            status: JobStatus.DRAFT,
            requiresAddress: false,
          }}
        >
          <Form.Item
            name="title"
            label="Título da Vaga"
            rules={[
              {required: true, message: 'Por favor, insira o título da vaga'},
              {min: 3, message: 'O título deve ter pelo menos 3 caracteres'},
              {max: 255, message: 'O título deve ter no máximo 255 caracteres'}
            ]}
          >
            <Input
              placeholder="Ex: Desenvolvedor Full Stack"
            />
          </Form.Item>

          <Form.Item
            name="description"
            label="Descrição"
            rules={[{required: true, message: 'Por favor, insira a descrição da vaga'}, {
              min: 5,
              message: 'A descrição deve ter pelo menos 5 caracteres'
            }]}
          >
            <TextArea
              rows={4}
              placeholder="Descreva as responsabilidades e atividades da vaga..."
            />
          </Form.Item>

          <Form.Item
            name="requirements"
            label="Requisitos"
            rules={[{required: true, message: 'Por favor, insira os requisitos da vaga'}, {
              min: 5,
              message: 'Os requisitos devem ter pelo menos 5 caracteres'
            }]}
          >
            <TextArea
              rows={4}
              placeholder="Liste os requisitos, habilidades e experiências necessárias..."
            />
          </Form.Item>

          <Form.Item
            name="requiresAddress"
            label="Solicitar endereço na inscrição?"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            name="departmentId"
            label="Departamento"
          >
            <Select
              placeholder="Selecione um departamento (opcional)"
              loading={loadingDepartments}
              allowClear
              showSearch
              optionFilterProp="children"
            >
              {departments.map((department) => (
                <Option key={department.id} value={department.id}>
                  {department.name} - {department.code}
                </Option>
              ))}
            </Select>
          </Form.Item>

          {isEditing && (
            <Form.Item
              name="status"
              label="Status"
              rules={[{required: true, message: 'Por favor, selecione o status'}]}
            >
              <Select>
                <Option value={JobStatus.DRAFT}>Rascunho</Option>
                <Option value={JobStatus.PUBLISHED}>Publicada</Option>
                <Option value={JobStatus.PAUSED}>Pausada</Option>
                <Option value={JobStatus.CLOSED}>Fechada</Option>
              </Select>
            </Form.Item>
          )}

          {/* Temporariamente comentado para resolver problema do DatePicker
          <Form.Item
            name="expirationDate"
            label="Data de Expiração"
          >
            <DatePicker 
              style={{ width: '100%' }}
              placeholder="Selecione a data de expiração"
            />
          </Form.Item>
          */}

          <Divider/>

          <div style={{marginBottom: '16px'}}>
            <Title level={4}>Perguntas do Processo Seletivo</Title>
            <p style={{color: '#666', marginBottom: '16px'}}>
              Adicione perguntas que serão feitas aos candidatos durante o processo seletivo.
              Arraste para reordenar as perguntas.
            </p>
            <Button
              type="dashed"
              onClick={addQuestion}
              icon={<PlusOutlined/>}
              style={{width: '100%'}}
            >
              Adicionar Pergunta
            </Button>
          </div>

          {questions.length > 0 && (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={questions.map(q => q.id)}
                strategy={verticalListSortingStrategy}
              >
                <div style={{minHeight: '50px'}}>
                  {questions.map((question, index) => (
                    <SortableQuestionItem
                      key={question.id}
                      question={question}
                      index={index}
                      onUpdate={updateQuestion}
                      onRemove={removeQuestion}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}

          <Divider/>

          <div style={{marginBottom: '16px'}}>
            <Title level={4}>Etapas do Processo Seletivo</Title>
            <p style={{color: '#666', marginBottom: '16px'}}>
              Configure as etapas do processo seletivo para esta vaga.
              As etapas serão exibidas na ordem definida aqui.
              Arraste para reordenar as etapas.
            </p>
            <Button
              type="dashed"
              onClick={addStage}
              icon={<PlusOutlined/>}
              style={{width: '100%'}}
            >
              Adicionar Etapa
            </Button>
          </div>

          {stages.length > 0 && (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={stages.map(s => s.id)}
                strategy={verticalListSortingStrategy}
              >
                <div style={{minHeight: '50px'}}>
                  {stages.map((stage, index) => (
                    <SortableStageItem
                      key={stage.id}
                      stage={stage}
                      index={index}
                      onUpdate={updateStage}
                      onRemove={removeStage}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                {isEditing ? 'Atualizar' : 'Criar'} Vaga
              </Button>
              <Button onClick={onCancel}>
                Cancelar
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}; 