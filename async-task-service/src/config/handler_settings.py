from handlers.applications import handler_application_created


# Mapeamento de filas para handlers
QUEUE_HANDLERS = {
    "applications-queue": handler_application_created,
}

# Configuração das filas que serão consumidas
QUEUES_NAMES = QUEUE_HANDLERS.keys()
