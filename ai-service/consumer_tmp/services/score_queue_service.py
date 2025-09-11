"""
Serviço para enviar mensagens para a fila de scores de candidatos
"""

import json
from typing import Dict, Any, Optional
from consumer.config.settings import settings
from consumer.services.sqs_service import SQSService
from consumer.utils.logger import logger


class ScoreQueueService:
    """Serviço para enviar mensagens para a fila de scores"""
    
    def __init__(self):
        if getattr(settings, 'queue_provider', 'SQS') == 'REDIS':
            from consumer.services.streams_redis_service import StreamsRedisService
            self.queue = StreamsRedisService(settings.get_ai_score_redis_config())
        else:
            self.queue = SQSService(
                settings.get_ai_score_sqs_config(), 
                settings.ai_score_sqs.queue_name
            )
    
    async def send_score_request(
        self,
        application_id: str,
        resume_data: Dict[str, Any],
        job_data: Optional[Dict[str, Any]] = None,
        question_responses: Optional[list] = None
    ) -> Dict[str, Any]:
        """
        Envia uma solicitação de cálculo de score para a fila
        
        Args:
            application_id: ID da application
            resume_data: Dados do currículo já processados
            job_data: Dados da vaga (opcional)
            question_responses: Respostas das perguntas (opcional)
            
        Returns:
            Dict com o resultado do envio
        """
        try:
            if not self.queue.is_connected():
                return {
                    'success': False,
                    'error': 'Serviço de fila não conectado'
                }
            
            # Constrói a mensagem para a fila de scores
            message_body = self._build_score_message(
                application_id,
                resume_data,
                job_data,
                question_responses
            )
            
            # Envia a mensagem para a fila
            response = self.queue.send_message(message_body)
            
            if response:
                logger.info(
                    "✅ Mensagem de score enviada para a fila",
                    application_id=application_id,
                    message_id=response.get('MessageId'),
                    queue_name=settings.ai_score_sqs.queue_name if getattr(settings, 'queue_provider', 'SQS') == 'SQS' else settings.ai_score_redis.stream_name
                )
                
                return {
                    'success': True,
                    'message_id': response.get('MessageId'),
                    'application_id': application_id,
                    'queue_name': settings.ai_score_sqs.queue_name if getattr(settings, 'queue_provider', 'SQS') == 'SQS' else settings.ai_score_redis.stream_name
                }
            else:
                logger.error(
                    "❌ Falha ao enviar mensagem de score para a fila",
                    application_id=application_id,
                    queue_name=settings.ai_score_sqs.queue_name if getattr(settings, 'queue_provider', 'SQS') == 'SQS' else settings.ai_score_redis.stream_name
                )
                
                return {
                    'success': False,
                    'error': 'Falha ao enviar mensagem para a fila'
                }
                
        except Exception as e:
            logger.error(
                "❌ Erro ao enviar mensagem de score para a fila",
                application_id=application_id,
                error=str(e)
            )
            
            return {
                'success': False,
                'error': str(e)
            }
    
    def _build_score_message(
        self,
        application_id: str,
        resume_data: Dict[str, Any],
        job_data: Optional[Dict[str, Any]] = None,
        question_responses: Optional[list] = None
    ) -> Dict[str, Any]:
        """
        Constrói a mensagem para a fila de scores
        
        Args:
            application_id: ID da application
            resume_data: Dados do currículo
            job_data: Dados da vaga
            question_responses: Respostas das perguntas
            
        Returns:
            Dict com a mensagem estruturada
        """
        # Converte dados do currículo para o formato esperado pela fila de scores
        converted_resume_data = self._convert_resume_format(resume_data)
        
        # Se não houver dados da vaga, cria dados padrão
        if not job_data:
            job_data = self._create_default_job_data()
        
        message = {
            "applicationId": application_id,
            "resumeData": converted_resume_data,
            "jobData": job_data
        }
        
        # Adiciona respostas das perguntas se existirem
        if question_responses:
            message["questionResponses"] = question_responses
        
        # Adiciona timestamp
        from datetime import datetime
        message["createdAt"] = datetime.now().isoformat()
        
        return message
    
    def _convert_resume_format(self, resume_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Converte o formato do currículo processado para o formato esperado pela fila de scores
        
        Args:
            resume_data: Dados do currículo no formato do parser
            
        Returns:
            Dados convertidos para o formato da fila de scores
        """
        converted = {
            "personal_info": {},
            "education": [],
            "experience": [],
            "skills": [],
            "languages": [],
            "achievements": []
        }
        
        # Informações pessoais (extrair do summary ou criar padrão)
        if resume_data.get('summary'):
            converted["personal_info"]["name"] = "Candidato"  # Placeholder
            converted["personal_info"]["summary"] = resume_data['summary']
        
        # Formação acadêmica
        if resume_data.get('academicFormations'):
            for formation in resume_data['academicFormations']:
                converted["education"].append({
                    "degree": formation.get('course', ''),
                    "institution": formation.get('institution', ''),
                    "year": formation.get('endDate', ''),
                    "description": formation.get('description', '')
                })
        
        # Experiência profissional
        if resume_data.get('professionalExperiences'):
            for exp in resume_data['professionalExperiences']:
                converted["experience"].append({
                    "title": exp.get('position', ''),
                    "company": exp.get('companyName', ''),
                    "duration": self._calculate_duration(exp.get('startDate'), exp.get('endDate')),
                    "description": exp.get('description', ''),
                    "responsibilities": exp.get('responsibilities', []),
                    "achievements": exp.get('achievements', [])
                })
        
        # Habilidades (extrair do summary ou experiências)
        skills = set()
        if resume_data.get('summary'):
            # Extrair habilidades comuns do summary
            common_skills = ['Python', 'JavaScript', 'Java', 'React', 'Node.js', 'SQL', 'AWS', 'Docker']
            for skill in common_skills:
                if skill.lower() in resume_data['summary'].lower():
                    skills.add(skill)
        
        converted["skills"] = list(skills) if skills else ["Desenvolvimento de Software"]
        
        # Idiomas (se disponível)
        if resume_data.get('languages'):
            for lang in resume_data['languages']:
                converted["languages"].append({
                    "language": lang.get('language', ''),
                    "level": lang.get('level', 'Intermediário')
                })
        
        # Conquistas
        if resume_data.get('achievements'):
            converted["achievements"] = resume_data['achievements']
        
        return converted
    
    def _create_default_job_data(self) -> Dict[str, Any]:
        """
        Cria dados padrão de vaga quando não fornecidos
        
        Returns:
            Dict com dados padrão de vaga
        """
        return {
            "title": "Desenvolvedor Full Stack",
            "description": "Desenvolvimento de aplicações web modernas e escaláveis",
            "requirements": [
                "Experiência com desenvolvimento web",
                "Conhecimento de boas práticas",
                "Capacidade de trabalhar em equipe"
            ],
            "responsibilities": [
                "Desenvolver features frontend e backend",
                "Participar de code reviews",
                "Colaborar com a equipe de produto"
            ],
            "education_required": "Formação em áreas relacionadas à computação",
            "experience_required": "Experiência em desenvolvimento",
            "skills_required": ["Programação", "Desenvolvimento Web", "Trabalho em Equipe"]
        }
    
    def _calculate_duration(self, start_date: Optional[str], end_date: Optional[str]) -> str:
        """
        Calcula a duração entre duas datas
        
        Args:
            start_date: Data de início
            end_date: Data de fim
            
        Returns:
            String com a duração calculada
        """
        if not start_date:
            return "N/A"
        
        try:
            from datetime import datetime
            
            start = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
            
            if end_date:
                end = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
                duration = end - start
                years = duration.days // 365
                months = (duration.days % 365) // 30
                
                if years > 0:
                    return f"{years} ano(s) e {months} mes(es)"
                else:
                    return f"{months} mes(es)"
            else:
                return "Atual"
                
        except Exception:
            return "N/A"
    
    def get_queue_status(self) -> Dict[str, Any]:
        """Retorna o status da fila de scores"""
        return self.queue.get_queue_info()


# Instância global do serviço
score_queue_service = ScoreQueueService()
