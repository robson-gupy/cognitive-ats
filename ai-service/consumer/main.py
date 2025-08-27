#!/usr/bin/env python3
"""
Consumer SQS para processamento assíncrono de currículos

Este é o ponto de entrada principal que orquestra todos os serviços
para processar mensagens SQS de currículos de forma modular e organizada.
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


async def main():
    """Função principal do consumer"""
    print("=== SQS Resume Consumer ===")
    print(f"Versão: {getattr(settings, '__version__', '1.0.0')}")
    print()
    
    # Valida configurações
    if not settings.validate():
        logger.error("❌ Configurações inválidas")
        logger.error("   Verifique as variáveis de ambiente obrigatórias")
        sys.exit(1)
    
    # Exibe informações de configuração
    logger.info("🔧 Configurações carregadas")
    logger.info(f"   Fila SQS: {settings.sqs.queue_name}")
    logger.info(f"   Endpoint SQS: {settings.sqs.endpoint_url}")
    logger.info(f"   Backend: {settings.backend.url}")
    logger.info(f"   Max Retries: {settings.sqs.max_retries}")
    logger.info(f"   Log Level: {settings.logging.level}")
    print()
    
    try:
        # Cria e inicia o handler de mensagens
        message_handler = MessageHandler()
        
        # Exibe status dos serviços
        status = message_handler.get_status()
        logger.info("📊 Status dos serviços:")
        logger.info(f"   SQS: {'✅ Conectado' if status['sqs'] else '❌ Não conectado'}")
        logger.info(f"   Backend: {'✅ Disponível' if status['backend']['available'] else '❌ Indisponível'}")
        logger.info(f"   IA Service: {'✅ Inicializado' if status['ai_service'] == 'initialized' else '❌ Não inicializado'}")
        print()
        
        # Inicia o processamento de mensagens
        await message_handler.process_messages()
        
    except KeyboardInterrupt:
        logger.info("⏹️ Consumer interrompido pelo usuário")
    except Exception as e:
        logger.critical("💥 Erro crítico no consumer", error=str(e))
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
