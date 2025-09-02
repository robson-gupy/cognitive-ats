import React, {useState} from 'react';
import {Button, Card, Form, Input, InputNumber, message, Spin, Typography} from 'antd';
import {useNavigate} from 'react-router-dom';
import {LoadingOutlined, RobotOutlined} from '@ant-design/icons';
import {apiService} from '../services/api';

const {Title, Paragraph} = Typography;
const {TextArea} = Input;

interface CreateJobWithAiForm {
  prompt: string;
  maxQuestions: number;
  maxStages: number;
}

export const CreateJobWithAi: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: CreateJobWithAiForm) => {
    try {
      setLoading(true);

      const job = await apiService.createJobWithAi(
        values.prompt,
        values.maxQuestions,
        values.maxStages
      );

      message.success('Vaga criada com sucesso! Redirecionando para edição...');

      // Redirecionar para a tela de edição da vaga criada
      navigate(`/jobs/${job.id}/edit`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao criar vaga';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const onCancel = () => {
    navigate('/jobs');
  };

  return (
    <div style={{padding: '24px'}}>
      <Card>
        <div style={{textAlign: 'center', marginBottom: '32px'}}>
          <RobotOutlined style={{fontSize: '48px', color: '#1890ff', marginBottom: '16px'}}/>
          <Title level={2}>Criar Vaga com IA</Title>
          <Paragraph style={{fontSize: '16px', color: '#666'}}>
            Descreva o que você precisa e nossa IA irá gerar uma vaga completa para você!
          </Paragraph>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            maxQuestions: 5,
            maxStages: 3,
          }}
        >
          <Form.Item
            name="prompt"
            label="Descrição da Vaga"
            rules={[
              {required: true, message: 'Por favor, descreva a vaga que você precisa'},
              {min: 20, message: 'A descrição deve ter pelo menos 20 caracteres'}
            ]}
          >
            <TextArea
              rows={6}
              placeholder="Ex: Preciso de um desenvolvedor Full Stack para uma startup de tecnologia. A empresa trabalha com React, Node.js e PostgreSQL. O candidato deve ter experiência com desenvolvimento web, conhecimento em APIs RESTful, e ser capaz de trabalhar em equipe. A vaga é para São Paulo, regime híbrido..."
              style={{fontSize: '14px'}}
            />
          </Form.Item>

          <Form.Item
            name="maxQuestions"
            label="Quantidade de Perguntas"
            rules={[{required: true, message: 'Por favor, defina a quantidade de perguntas'}]}
          >
            <InputNumber
              min={1}
              max={10}
              style={{width: '100%'}}
              placeholder="Quantidade de perguntas para o processo seletivo"
            />
          </Form.Item>

          <Form.Item>
            <div style={{display: 'flex', gap: '12px', justifyContent: 'center'}}>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                icon={loading ? <LoadingOutlined/> : <RobotOutlined/>}
                size="large"
                style={{minWidth: '200px'}}
              >
                {loading ? 'Gerando Vaga...' : 'Criar Vaga com IA'}
              </Button>
              <Button onClick={onCancel} size="large">
                Cancelar
              </Button>
            </div>
          </Form.Item>
        </Form>

        {loading && (
          <div style={{
            textAlign: 'center',
            marginTop: '24px',
            padding: '24px',
            backgroundColor: '#f5f5f5',
            borderRadius: '8px'
          }}>
            <Spin size="large"/>
            <div style={{marginTop: '16px', fontSize: '16px', color: '#666'}}>
              Nossa IA está trabalhando para criar sua vaga...
            </div>
            <div style={{marginTop: '8px', fontSize: '14px', color: '#999'}}>
              Isso pode levar alguns segundos
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}; 