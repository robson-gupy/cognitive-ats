"""
Serviço para gerenciar applications no consumer SQS
"""

import logging
from typing import Optional, Dict, Any
from consumer.services.database_service import database_service

logger = logging.getLogger(__name__)


class ApplicationsService:
    """Serviço para operações com applications no consumer"""
    
    async def update_application_scores(
        self, 
        application_id: str, 
        overall_score: Optional[float] = None,
        education_score: Optional[float] = None,
        experience_score: Optional[float] = None
    ) -> Dict[str, Any]:
        """
        Atualiza os scores de uma application diretamente no banco
        
        Args:
            application_id: ID da application
            overall_score: Score geral (opcional)
            education_score: Score de educação (opcional)
            experience_score: Score de experiência (opcional)
            
        Returns:
            Dicionário com o resultado da atualização
        """
        try:
            logger.info(f"🔄 Atualizando scores da application {application_id}")
            
            # Validar se pelo menos um score foi fornecido
            if all(score is None for score in [overall_score, education_score, experience_score]):
                raise ValueError("Pelo menos um score deve ser fornecido para atualização")
            
            # Fazer update direto no banco
            result = await database_service.update_application_scores(
                application_id=application_id,
                overall_score=overall_score,
                education_score=education_score,
                experience_score=experience_score
            )
            
            if result['success']:
                logger.info(f"✅ Scores da application {application_id} atualizados com sucesso")
                logger.info(f"   Overall Score: {overall_score}")
                logger.info(f"   Education Score: {education_score}")
                logger.info(f"   Experience Score: {experience_score}")
            else:
                logger.error(f"❌ Falha ao atualizar scores da application {application_id}: {result['error']}")
            
            return result
            
        except Exception as e:
            logger.error(f"❌ Erro inesperado ao atualizar scores da application {application_id}: {e}")
            return {
                'success': False,
                'application_id': application_id,
                'error': str(e)
            }
    
    async def get_application_by_id(self, application_id: str) -> Optional[Dict[str, Any]]:
        """
        Busca uma application pelo ID
        
        Args:
            application_id: ID da application
            
        Returns:
            Dados da application ou None se não encontrada
        """
        try:
            logger.info(f"🔍 Buscando application {application_id}")
            
            application = await database_service.get_application_by_id(application_id)
            
            if application:
                logger.info(f"✅ Application {application_id} encontrada")
                logger.info(f"   Overall Score: {application.get('overall_score')}")
                logger.info(f"   Education Score: {application.get('education_score')}")
                logger.info(f"   Experience Score: {application.get('experience_score')}")
            else:
                logger.warning(f"⚠️ Application {application_id} não encontrada")
            
            return application
            
        except Exception as e:
            logger.error(f"❌ Erro ao buscar application {application_id}: {e}")
            return None

    async def get_database_status(self) -> Dict[str, Any]:
        """Retorna o status da conexão com o banco de dados"""
        try:
            is_connected = await database_service.is_connected()
            return {
                'database_connected': is_connected,
                'status': '✅ Conectado' if is_connected else '❌ Não conectado'
            }
        except Exception as e:
            return {
                'database_connected': False,
                'status': f'❌ Erro: {str(e)}'
            }


# Instância global do serviço
applications_service = ApplicationsService()
