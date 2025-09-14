import os
from handlers.applications import handler_application_created
from handlers.ai_score import handler_ai_score


# Mapeamento de filas para handlers
QUEUE_HANDLERS = {
    "applications-queue": handler_application_created,
    os.getenv('AI_SCORE_QUEUE_NAME', 'ai-score-queue'): handler_ai_score,
}

# Configuração das filas que serão consumidas
QUEUES_NAMES = QUEUE_HANDLERS.keys()
