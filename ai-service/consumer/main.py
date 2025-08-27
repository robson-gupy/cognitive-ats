#!/usr/bin/env python3
"""
Consumer SQS para processamento assíncrono de currículos e scores

Este é o ponto de entrada principal que orquestra todos os serviços
para processar mensagens SQS de currículos e scores de forma modular e organizada.
"""

import asyncio
import sys
import os
from dotenv import load_dotenv

# Carrega variáveis de ambiente
load_dotenv()

# Adiciona o diretório pai ao path para importar os módulos
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from consumer.config.settings import settings
from consumer.utils.logger import logger
from consumer.handlers.message_handler import MessageHandler
from consumer.handlers.ai_score_message_handler import AIScoreMessageHandler


async def main():
    """Função principal do consumer com dois listeners"""
    print("=== SQS Consumer - CVs e Scores ===")
    print(f"Versão: {getattr(settings, '__version__', '1.0.0')}")
    print()
    
    # Valida configurações
    if not settings.validate():
        logger.error("❌ Configurações inválidas")
        logger.error("   Verifique as variáveis de ambiente obrigatórias")
        sys.exit(1)
    
    # Exibe informações de configuração
    logger.info("🔧 Configurações carregadas")
    logger.info(f"   Fila SQS CVs: {settings.sqs.queue_name}")
    logger.info(f"   Fila SQS Scores: {settings.ai_score_sqs.queue_name}")
    logger.info(f"   Endpoint SQS: {settings.sqs.endpoint_url}")
    logger.info(f"   Backend: {settings.backend.url}")
    logger.info(f"   Database: {settings.database.host}:{settings.database.port}/{settings.database.name}")
    logger.info(f"   Max Retries: {settings.sqs.max_retries}")
    logger.info(f"   Log Level: {settings.logging.level}")
    print()
    
    try:
        # Cria os handlers de mensagens
        resume_handler = MessageHandler()
        score_handler = AIScoreMessageHandler()
        
        # Exibe status dos serviços
        resume_status = await resume_handler.get_status()
        score_status = await score_handler.get_status()
        
        logger.info("📊 Status dos serviços:")
        logger.info(f"   SQS CVs: {'✅ Conectado' if resume_status['sqs'] else '❌ Não conectado'}")
        logger.info(f"   SQS Scores: {'✅ Conectado' if score_status['sqs'] else '❌ Não conectado'}")
        logger.info(f"   Backend: {'✅ Disponível' if resume_status['backend']['available'] else '❌ Indisponível'}")
        logger.info(f"   IA Service CVs: {'✅ Inicializado' if resume_status['ai_service'] == 'initialized' else '❌ Não inicializado'}")
        logger.info(f"   IA Service Scores: {'✅ Inicializado' if score_status['ai_service'] == 'initialized' else '❌ Não inicializado'}")
        logger.info(f"   Database: {resume_status['database']['status']}")
        print()
        
        # Inicia os dois listeners em paralelo
        logger.info("🚀 Iniciando listeners em paralelo...")
        
        await asyncio.gather(
            resume_handler.process_messages(),
            score_handler.process_messages()
        )
        
    except KeyboardInterrupt:
        logger.info("⏹️ Consumer interrompido pelo usuário")
    except Exception as e:
        logger.critical(f"💥 Erro crítico no consumer: {e}")
        sys.exit(1)


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n⏹️ Consumer interrompido")
        sys.exit(0)
    except Exception as e:
        print(f"💥 Erro fatal: {e}")
        sys.exit(1)
