"""
Handler para processar mensagens de aplicações de candidatos
"""
from typing import Dict, Any

from services.resume_orchestrator import ResumeOrchestrator
from utils.logger import logger


async def handler_application_created(payload: Dict[str, Any]) -> None:
    """
    Handler para processar mensagens de aplicação criada

    Formato do payload:
    {
        "applicationId": "APP_ID",
        "resumeUrl": "path/to/resume.pdf",
        "eventType": "APPLICATION_CREATED",
        "timestamp": "2025-09-12T18:26:52.877Z"
    }
    """
    logger.info(f"📝 Processando aplicação criada: {payload}")

    try:
        # Extrai dados do payload
        application_id = payload.get("applicationId")
        job_id = payload.get("jobId")
        resume_url_path = payload.get("resumeUrl")
        event_type = payload.get("eventType")

        if not application_id:
            raise ValueError("applicationId é obrigatório")

        if not resume_url_path:
            raise ValueError("resumeUrl é obrigatório")

        if event_type != "APPLICATION_CREATED":
            logger.warning(f"Evento não é APPLICATION_CREATED: {event_type}")
            return

        logger.info(f"🆔 Application ID: {application_id}")
        logger.info(f"📄 Resume URL Path: {resume_url_path}")

        # Cria orquestrador para processamento
        orchestrator = ResumeOrchestrator()

        # Processa o currículo usando o orquestrador
        result = await orchestrator.process_resume_from_url(resume_url_path, application_id, job_id)

        if result.success:
            logger.info(f"✅ Currículo processado com sucesso para aplicação: {application_id}")
            logger.info(f"📊 Tempo de processamento: %.2f segund{result.processing_time}")

            if result.backend_success:
                logger.info("✅ Dados enviados com sucesso para o backend")
            else:
                logger.warning(f"⚠️ Falha ao enviar dados para o backend: {result.backend_error}")

            if result.score_queue_success:
                logger.info("✅ Dados enviados com sucesso para a fila de scores")
            else:
                logger.warning(f"⚠️ Falha ao enviar dados para a fila de scores: {result.score_queue_error}")
        else:
            logger.error(f"❌ Falha no processamento do currículo: {result.error}")
            raise Exception(f"Erro no processamento: {result.error}")

    except Exception as e:
        logger.error(f"❌ Erro ao processar aplicação {payload.get('applicationId', 'unknown')}: {str(e)}")
        raise
