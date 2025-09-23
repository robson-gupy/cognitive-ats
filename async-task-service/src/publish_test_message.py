import json
import logging
import os
from datetime import datetime
from uuid import uuid4

import redis
from dotenv import load_dotenv


def _get_env(name: str, default: str) -> str:
    value = os.getenv(name, default)
    if value is None:
        raise RuntimeError(f"Variável de ambiente obrigatória ausente: {name}")
    return value


def create_redis_client() -> redis.Redis:
    redis_url = "redis://localhost:6379/0"
    if redis_url:
        return redis.from_url(redis_url, decode_responses=True)  # type: ignore[return-value]
    host = "localhost"
    port = int(_get_env("REDIS_PORT", "6379"))
    db = int(_get_env("REDIS_DB", "0"))
    return redis.Redis(host=host, port=port, db=db, decode_responses=True)


def main() -> None:
    load_dotenv()
    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s - %(message)s")
    queue_name = "question-responses-queue"
    client = create_redis_client()

    message = {"eventType": "MULTIPLE_QUESTION_RESPONSES_CREATED", "timestamp": "2025-09-23T22:34:06.907Z", "data": {"totalResponses": 2, "responses": [{"questionResponseId": "e501d5d4-fa15-445e-82c1-94f910152064", "jobQuestionId": "7506b2f2-a510-4f5e-aad3-6b2a0fba577b", "question": "Descreva uma situação em que você precisou organizar múltiplas tarefas administrativas com prazos conflitantes. Como priorizou as atividades e qual foi o resultado?", "answer": "Em uma ocasião recente, precisei lidar com várias tarefas administrativas com prazos conflitantes. Entre elas estavam a consolidação de relatórios financeiros para a diretoria, a organização de uma reunião com diferentes áreas e a atualização de contratos no sistema. Todos tinham prazos próximos e impacto relevante.\n\nPara priorizar, avaliei três critérios principais: impacto estratégico, dependências externas e nível de urgência. Primeiro, concluí as tarefas que eram pré-requisito para outras pessoas avançarem (como a preparação dos contratos). Em seguida, foquei nos relatórios financeiros, que tinham prazo rígido para apresentação ao conselho. Por último, organizei a reunião, que tinha mais flexibilidade de agenda.\n\nO resultado foi positivo: consegui entregar todas as atividades dentro do prazo, evitei gargalos para os colegas que dependiam das informações e garanti que a diretoria tivesse os dados a tempo para a tomada de decisão. Essa experiência reforçou a importância de alinhar prioridades de forma objetiva e comunicar com clareza os prazos a todos os envolvidos.", "createdAt": "2025-09-23T22:34:06.902Z"}, {"questionResponseId": "3faa3611-e760-41be-967b-61f80ddd5d64", "jobQuestionId": "8dd7e47b-5a20-4825-ab28-e0f10e164554", "question": "Qual sua experiência prática com Excel e sistemas de gestão (ERP)? Cite funções, fórmulas ou relatórios que você costuma usar e dê um exemplo de como usou essas ferramentas para resolver um problema administrativo.", "answer": "Tenho bastante experiência com Excel, especialmente para organizar e analisar informações administrativas e financeiras. Utilizo com frequência funções como PROCV/XLOOKUP para cruzar dados de diferentes planilhas, TABELA DINÂMICA para gerar relatórios gerenciais de forma rápida e fórmulas como SE, SOMASES e ÍNDICE/CORRESP para criar análises condicionais e consolidadas. Também costumo aplicar filtros avançados, validação de dados e formatação condicional para dar mais clareza às informações.\n\nEm relação a sistemas de gestão (ERP), já atuei no uso de módulos financeiros e de compras para registrar lançamentos, controlar contas a pagar/receber e gerar relatórios de fluxo de caixa e de posição de estoque.\n\nUm exemplo prático: em uma ocasião, havia divergências entre os valores de estoque no ERP e o inventário físico. Para resolver, exportei os dados do sistema e montei uma planilha no Excel que comparava automaticamente as quantidades por código de produto, destacando as diferenças com formatação condicional. Isso permitiu identificar rapidamente onde estavam os erros de registro e ajustar o ERP. O resultado foi um controle de estoque mais preciso e redução de perdas administrativas", "createdAt": "2025-09-23T22:34:06.902Z"}], "applicationId": "fb49a93f-7b4b-488b-bb9a-bd49ac7c4f49", "jobId": "c964db08-36da-4e87-84d8-dff5cf708f2f", "companyId": "12f9c2a1-d01b-492b-a6e9-207507815e5f"}, "job": {"id": "c964db08-36da-4e87-84d8-dff5cf708f2f", "title": "Auxiliar de Escritório - Suporte Administrativo", "slug": "auxiliar-de-escritorio-suporte-administrativo", "description": "Buscamos um Auxiliar de Escritório para prestar suporte administrativo às rotinas do departamento, garantindo organização, agilidade e qualidade nos serviços. Principais responsabilidades: - Atendimento telefônico e por e-mail a clientes e fornecedores; - Organização e arquivamento de documentos físicos e digitais; - Controle de agendas, marcação de reuniões e apoio logístico a eventos internos; - Lançamentos e conferência de dados em planilhas (apontamentos simples, controle de notas fiscais e recibos); - Emissão e organização de correspondências e relatórios básicos; - Controle de materiais de escritório e solicitação de compras quando necessário; - Apoio às rotinas de faturamento e conferência de documentos para contabilidade; - Manter processos e cadastros atualizados em sistemas internos (ERP ou ferramentas de gestão); - Executar demandas administrativas eventuais solicitadas pela liderança. Oferecemos ambiente dinâmico, orientação inicial e oportunidade de desenvolvimento na área administrativa.", "requirements": "Ensino Médio completo; experiência mínima de 6 meses em funções administrativas ou de escritório; conhecimento prático de Microsoft Office (Word e Excel; Excel nível básico-intermediário para fórmulas simples, filtros e uso de tabelas); digitação ágil e organização de arquivos digitais; boa comunicação verbal e escrita; atenção a detalhes e capacidade de organizar prioridades; proatividade e comprometimento com prazos; disponibilidade para trabalhar em horário comercial (incluir flexibilidade ocasional); desejável, mas não obrigatório: experiência com sistemas ERP, emissão/controle de notas fiscais ou rotinas de faturamento."}, "company": {"id": "12f9c2a1-d01b-492b-a6e9-207507815e5f", "name": "Gupy", "slug": "gupy"}, "application": {"id": "fb49a93f-7b4b-488b-bb9a-bd49ac7c4f49", "firstName": "Joana", "lastName": "Mendes", "email": "testerererer@teste.com", "phone": "11971380507", "createdAt": "2025-09-23T22:33:37.898Z"}}
    payload = json.dumps(message, ensure_ascii=False)
    client.rpush(queue_name, payload)
    logging.info(f"Mensagem publicada na fila '{queue_name}': {payload}")


if __name__ == "__main__":
    main()
