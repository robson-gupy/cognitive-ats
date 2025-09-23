import os
from handlers.applications import handler_application_created
from handlers.ai_score import handler_ai_score
from handlers.question_responses import handler_question_responses


# Mapeamento de filas para handlers
QUEUE_HANDLERS = {
    os.getenv('APPLICATIONS_QUEUE_NAME', 'applications-queue'): handler_application_created,
    os.getenv('AI_SCORE_QUEUE_NAME', 'ai-score-queue'): handler_ai_score,
    os.getenv('QUESTION_RESPONSES_QUEUE_NAME', 'question-responses-queue'): handler_question_responses,
}

# Configuração das filas que serão consumidas
QUEUES_NAMES = QUEUE_HANDLERS.keys()
