"""
Serviço para enviar mensagens para a fila de scores de candidatos
"""

import json
import redis.asyncio as redis
from typing import Dict, Any, Optional

from config.settings import settings
from utils.logger import logger


class ScoreQueueService:
    """Serviço para enviar mensagens para a fila de scores"""

    def __init__(self):
        """Inicializa o serviço com conexão Redis"""
        self.redis_client = None
        self._initialize_redis()

    def _initialize_redis(self):
        """Inicializa a conexão Redis"""
        try:
            redis_url = settings.ai_score_redis.url
            if redis_url:
                self.redis_client = redis.from_url(redis_url, decode_responses=True)
            else:
                self.redis_client = redis.Redis(
                    host=settings.ai_score_redis.host,
                    port=settings.ai_score_redis.port,
                    db=settings.ai_score_redis.db,
                    decode_responses=True
                )
            logger.info(f"✅ Redis client inicializado para fila de scores: {settings.ai_score_redis.stream_name}")
        except Exception as e:
            logger.error(f"❌ Erro ao inicializar Redis client: {str(e)}")
            self.redis_client = None

    async def is_connected(self) -> bool:
        """Verifica se o Redis está conectado"""
        if not self.redis_client:
            return False
        try:
            await self.redis_client.ping()
            return True
        except Exception:
            return False


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
            if not await self.is_connected():
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

            # Envia a mensagem para a fila Redis usando lpush
            queue_name = settings.ai_score_redis.stream_name
            message_json = json.dumps(message_body)

            # Gera um ID único para a mensagem
            import uuid
            message_id = str(uuid.uuid4())

            # Adiciona o message_id ao corpo da mensagem
            message_body['messageId'] = message_id

            # Envia para a fila Redis
            await self.redis_client.lpush(queue_name, message_json)

            logger.info(
                "✅ Mensagem de score enviada para a fila",
                application_id=application_id,
                message_id=message_id,
                queue_name=queue_name
            )

            return {
                'success': True,
                'message_id': message_id,
                'application_id': application_id,
                'queue_name': queue_name
            }

        except Exception as e:
            logger.error(
                f"❌ Erro ao enviar mensagem de score para a fila - Error: {str(e)}",
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
            logger.error("❌ Job data está vazio")
            return None

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

    async def get_queue_status(self) -> Dict[str, Any]:
        """Retorna o status da fila de scores"""
        try:
            if not await self.is_connected():
                return {
                    'connected': False,
                    'error': 'Redis não conectado'
                }

            queue_name = settings.ai_score_redis.stream_name
            queue_length = await self.redis_client.llen(queue_name)

            return {
                'connected': True,
                'queue_name': queue_name,
                'queue_length': queue_length,
                'redis_host': settings.ai_score_redis.host,
                'redis_port': settings.ai_score_redis.port,
                'redis_db': settings.ai_score_redis.db
            }
        except Exception as e:
            return {
                'connected': False,
                'error': str(e)
            }


# Instância global do serviço
score_queue_service = ScoreQueueService()
