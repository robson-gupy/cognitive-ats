import React, {useEffect, useState} from 'react';
import {Button, Card, List, message, Space, Spin, Typography} from 'antd';
import {useNavigate, useParams} from 'react-router-dom';
import {ArrowLeftOutlined} from '@ant-design/icons';
import {apiService} from '../services/api';
import type {JobLog} from '../types/Job';

const {Title} = Typography;

export const JobLogs: React.FC = () => {
  const [logs, setLogs] = useState<JobLog[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const {id} = useParams();

  useEffect(() => {
    if (id) {
      loadLogs();
    }
  }, [id]);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const logsData = await apiService.getJobLogs(id!);
      setLogs(logsData);
    } catch (error) {
      message.error('Erro ao carregar logs da vaga');
      navigate('/jobs');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getFieldNameText = (fieldName?: string) => {
    if (!fieldName) return '';

    const fieldMap: Record<string, string> = {
      title: 'Título',
      description: 'Descrição',
      requirements: 'Requisitos',
      status: 'Status',
      expirationDate: 'Data de Expiração',
      questions: 'Perguntas',
      stages: 'Etapas',
    };

    return fieldMap[fieldName] || fieldName;
  };

  if (loading) {
    return (
      <div style={{padding: '24px', textAlign: 'center'}}>
        <Spin size="large"/>
        <div style={{marginTop: '16px'}}>Carregando logs...</div>
      </div>
    );
  }

  return (
    <div style={{padding: '24px'}}>
      <Card>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px'}}>
          <Space>
            <Button
              icon={<ArrowLeftOutlined/>}
              onClick={() => navigate(`/jobs/${id}`)}
            >
              Voltar para a Vaga
            </Button>
            <Title level={2} style={{margin: 0}}>
              Histórico de Alterações
            </Title>
          </Space>
        </div>

        {logs.length === 0 ? (
          <div style={{textAlign: 'center', padding: '40px 0'}}>
            <Title level={4} style={{color: '#999'}}>
              Nenhum log encontrado
            </Title>
            <p style={{color: '#666'}}>
              Esta vaga ainda não possui histórico de alterações.
            </p>
          </div>
        ) : (
          <List
            dataSource={logs}
            renderItem={(log) => (
              <List.Item>
                <div style={{
                  width: '100%',
                  padding: '16px',
                  border: '1px solid #f0f0f0',
                  borderRadius: '8px',
                  marginBottom: '8px'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '8px'
                  }}>
                    <div style={{fontWeight: 'bold', fontSize: '16px', color: '#1890ff'}}>
                      {log.description}
                    </div>
                    <div style={{color: '#666', fontSize: '12px', textAlign: 'right'}}>
                      {formatDate(log.createdAt)}
                    </div>
                  </div>

                  <div style={{color: '#666', fontSize: '14px', marginBottom: '8px'}}>
                    <strong>Usuário:</strong> {log.user ? `${log.user.firstName} ${log.user.lastName}` : 'Sistema'}
                  </div>

                  {log.fieldName && (
                    <div style={{color: '#666', fontSize: '14px', marginBottom: '8px'}}>
                      <strong>Campo:</strong> {getFieldNameText(log.fieldName)}
                    </div>
                  )}

                  {log.oldValue && log.newValue && (
                    <div style={{marginTop: '8px'}}>
                      <div style={{color: '#666', fontSize: '14px', marginBottom: '4px'}}>
                        <strong>Alteração:</strong>
                      </div>
                      <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                        <div style={{
                          backgroundColor: '#fff2e8',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          color: '#d46b08'
                        }}>
                          <strong>Antes:</strong> {log.oldValue}
                        </div>
                        <span style={{color: '#999'}}>→</span>
                        <div style={{
                          backgroundColor: '#f6ffed',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          color: '#389e0d'
                        }}>
                          <strong>Depois:</strong> {log.newValue}
                        </div>
                      </div>
                    </div>
                  )}

                  {log.oldValue && !log.newValue && (
                    <div style={{marginTop: '8px'}}>
                      <div style={{color: '#666', fontSize: '14px', marginBottom: '4px'}}>
                        <strong>Valor removido:</strong>
                      </div>
                      <div style={{
                        backgroundColor: '#fff2e8',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        color: '#d46b08'
                      }}>
                        {log.oldValue}
                      </div>
                    </div>
                  )}

                  {!log.oldValue && log.newValue && (
                    <div style={{marginTop: '8px'}}>
                      <div style={{color: '#666', fontSize: '14px', marginBottom: '4px'}}>
                        <strong>Valor adicionado:</strong>
                      </div>
                      <div style={{
                        backgroundColor: '#f6ffed',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        color: '#389e0d'
                      }}>
                        {log.newValue}
                      </div>
                    </div>
                  )}
                </div>
              </List.Item>
            )}
          />
        )}
      </Card>
    </div>
  );
}; 