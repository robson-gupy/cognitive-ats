import React, {useEffect, useRef, useState} from 'react';
import {Input, message} from 'antd';
import {DragOutlined, EditOutlined} from '@ant-design/icons';
import {apiService} from '../services/api';
import type {JobStage} from '../types/Job';

interface EditableStageNameProps {
  stage: JobStage;
  jobId: string;
  onStageUpdated: (updatedStage: JobStage) => void;
}

export const EditableStageName: React.FC<EditableStageNameProps> = ({
                                                                      stage,
                                                                      jobId,
                                                                      onStageUpdated,
                                                                    }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [stageName, setStageName] = useState(stage.name);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<any>(null);


  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleClick = () => {
    if (!isEditing) {
      setIsEditing(true);
    }
  };

  const handleSave = async () => {
    if (!stageName.trim()) {
      message.error('O nome da etapa não pode estar vazio');
      return;
    }

    if (stageName.trim() === stage.name) {
      setIsEditing(false);
      return;
    }

    try {
      setLoading(true);

      // Buscar as etapas atuais da vaga
      const job = await apiService.getJob(jobId);
      const currentStages = job.stages || [];

      // Atualizar apenas a etapa específica
      const updatedStages = currentStages.map((s: JobStage) =>
        s.id === stage.id ? {...s, name: stageName.trim()} : s
      );

      // Fazer a requisição de atualização
      await apiService.updateJob(jobId, {
        stages: updatedStages.map((s: JobStage) => ({
          id: s.id,
          name: s.name,
          description: s.description,
          orderIndex: s.orderIndex,
          isActive: s.isActive,
        })),
      });

      // Atualizar o estado local
      const updatedStage = {...stage, name: stageName.trim()};
      onStageUpdated(updatedStage);

      setIsEditing(false);
      message.success('Nome da etapa atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar nome da etapa:', error);
      message.error('Erro ao atualizar nome da etapa');
      setStageName(stage.name); // Reverter para o valor original
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setStageName(stage.name);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <Input
        ref={inputRef}
        value={stageName}
        onChange={(e) => setStageName(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        disabled={loading}
        style={{
          fontSize: '16px',
          fontWeight: 'bold',
          border: '2px solid #1890ff',
          borderRadius: '4px',
        }}
        placeholder="Nome da etapa"
      />
    );
  }

  return (
    <div
      onClick={handleClick}
      className="editable-stage-name"
      title="Clique para editar o nome da etapa"
      style={{
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '4px 8px',
        borderRadius: '4px',
        transition: 'background-color 0.2s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = '#f5f5f5';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent';
      }}
    >
      <DragOutlined
        className="drag-handle"
        style={{
          fontSize: '12px',
          color: '#999',
          opacity: 0.7,
          cursor: 'grab',
        }}
      />
      <span style={{fontSize: '16px', fontWeight: 'bold'}}>
        {stage.name}
      </span>
      <EditOutlined
        style={{
          fontSize: '12px',
          color: '#999',
          opacity: 0.7,
        }}
      />
    </div>
  );
};
