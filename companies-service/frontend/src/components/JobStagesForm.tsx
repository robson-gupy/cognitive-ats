import React, {useEffect, useState} from 'react';
import {Button, Card, Divider, Form, Input, message, Space, Switch, Typography} from 'antd';
import {useNavigate, useParams} from 'react-router-dom';
import {DeleteOutlined, DragOutlined, PlusOutlined} from '@ant-design/icons';
import {apiService} from '../services/api';
import type {Job} from '../types/Job';
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

interface JobStage {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  orderIndex?: number;
}

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

export const JobStagesForm: React.FC = () => {
  const navigate = useNavigate();
  const {id} = useParams();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);
  const [stages, setStages] = useState<JobStage[]>([]);
  const [job, setJob] = useState<Job | null>(null);

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

  useEffect(() => {
    if (id) {
      loadJob();
    }
  }, [id]);

  const loadJob = async () => {
    try {
      setInitialLoading(true);
      const jobData: Job = await apiService.getJob(id!);
      setJob(jobData);

      // Carregar etapas existentes
      if (jobData.stages && jobData.stages.length > 0) {
        setStages(jobData.stages.map((s, index) => ({
          id: s.id || `stage-${Date.now()}-${index}`,
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

  const addStage = () => {
    const newStage: JobStage = {
      id: `stage-${Date.now()}-${stages.length}`,
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
      const isStage = stages.some(s => s.id === activeId);

      console.log('Item type check:', {
        activeId,
        isStage,
        stagesCount: stages.length
      });

      if (isStage) {
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

  const onSave = async () => {
    try {
      setLoading(true);

      const stagesData = stages.filter(s => s.name.trim() !== '').map((s, index) => ({
        name: s.name,
        description: s.description,
        isActive: s.isActive,
        orderIndex: index,
      }));

      await apiService.updateJob(id!, {
        stages: stagesData,
      });

      message.success('Etapas da vaga atualizadas com sucesso');
      navigate(`/jobs/${id}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const onCancel = () => {
    navigate(`/jobs/${id}`);
  };

  if (initialLoading) {
    return <div>Carregando...</div>;
  }

  if (!job) {
    return <div>Vaga não encontrada</div>;
  }

  return (
    <div style={{padding: '24px'}}>
      <Card>
        <Title level={2} style={{marginBottom: '24px'}}>
          Etapas do Processo Seletivo - {job.title}
        </Title>

        <div style={{marginBottom: '16px'}}>
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
              <div style={{minHeight: '100px'}}>
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

        {stages.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            color: '#999',
            border: '2px dashed #d9d9d9',
            borderRadius: '8px'
          }}>
            <p>Nenhuma etapa configurada</p>
            <p>Clique em "Adicionar Etapa" para começar</p>
          </div>
        )}

        <Divider/>

        <Form.Item>
          <Space>
            <Button type="primary" onClick={onSave} loading={loading}>
              Salvar Etapas
            </Button>
            <Button onClick={onCancel}>
              Cancelar
            </Button>
          </Space>
        </Form.Item>
      </Card>
    </div>
  );
}; 