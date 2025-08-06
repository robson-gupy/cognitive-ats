# Parse de Currículos com IA

Esta funcionalidade permite extrair informações estruturadas de currículos em PDF usando a API da OpenAI.

## Funcionalidades

- Extração automática de texto de arquivos PDF
- Análise inteligente do conteúdo do currículo
- Estruturação dos dados em formato JSON
- Conversão para o modelo `Resume` do sistema

## Dependências

Certifique-se de ter as seguintes dependências instaladas:

```bash
pip install -r requirements.txt
```

As dependências incluem:
- `PyPDF2==3.0.1` - Para extração de texto de PDFs
- `openai==1.97.1` - Para integração com a API da OpenAI

## Configuração

1. Configure a variável de ambiente `OPENAI_API_KEY`:
```bash
export OPENAI_API_KEY="sua-chave-api-aqui"
```

2. Ou passe a chave diretamente ao criar o serviço:
```python
ai_service = AIService(
    provider=AIProvider.OPENAI,
    api_key="sua-chave-api-aqui"
)
```

## Uso

### Função Principal

```python
from services.ai_service import AIService, AIProvider

# Cria o serviço de IA
ai_service = AIService(provider=AIProvider.OPENAI)

# Faz o parse do currículo
resume = await ai_service.parse_resume_from_pdf(
    pdf_path="/caminho/para/curriculo.pdf",
    application_id="id-da-aplicacao"
)
```

### Exemplo Completo

```python
import asyncio
from services.ai_service import AIService, AIProvider

async def processar_curriculo():
    ai_service = AIService(provider=AIProvider.OPENAI)
    
    resume = await ai_service.parse_resume_from_pdf(
        pdf_path="curriculo.pdf",
        application_id="123e4567-e89b-12d3-a456-426614174000"
    )
    
    print(f"Resumo: {resume.summary}")
    print(f"Experiências: {len(resume.professional_experiences)}")
    print(f"Formações: {len(resume.academic_formations)}")

# Executa o exemplo
asyncio.run(processar_curriculo())
```

## Estrutura de Dados Extraída

A função extrai as seguintes informações do currículo:

### Resume
- `application_id`: ID da aplicação
- `summary`: Resumo profissional
- `professional_experiences`: Lista de experiências profissionais
- `academic_formations`: Lista de formações acadêmicas
- `achievements`: Lista de conquistas
- `languages`: Lista de idiomas

### ResumeProfessionalExperience
- `company_name`: Nome da empresa
- `position`: Cargo
- `start_date`: Data de início
- `end_date`: Data de fim (null se atual)
- `is_current`: Se é o cargo atual
- `description`: Descrição do cargo
- `responsibilities`: Responsabilidades
- `achievements`: Conquistas

### ResumeAcademicFormation
- `institution`: Nome da instituição
- `course`: Nome do curso
- `degree`: Grau acadêmico
- `start_date`: Data de início
- `end_date`: Data de fim (null se atual)
- `is_current`: Se é a formação atual
- `status`: Status da formação
- `description`: Descrição do curso

### ResumeAchievement
- `title`: Título da conquista
- `description`: Descrição da conquista

### ResumeLanguage
- `language`: Nome do idioma
- `proficiency_level`: Nível de proficiência

## Tratamento de Erros

A função inclui tratamento robusto de erros:

- **Erro de leitura do PDF**: Se o arquivo não existir ou estiver corrompido
- **Erro da API OpenAI**: Se houver problemas de conectividade ou quota
- **Erro de parse JSON**: Se a resposta da IA não for um JSON válido
- **Erro de conversão de datas**: Se as datas não estiverem no formato esperado

## Limitações

1. **Qualidade do PDF**: PDFs com imagens ou formatação complexa podem ter extração limitada
2. **Idioma**: Funciona melhor com currículos em português ou inglês
3. **Tamanho**: PDFs muito grandes podem exceder o limite de tokens da OpenAI
4. **Formato**: Funciona melhor com currículos em formato texto (não apenas imagens)

## Exemplo de Execução

Execute o exemplo incluído:

```bash
cd ai-service
python example_resume_parser.py
```

Certifique-se de:
1. Ter um arquivo PDF de currículo válido
2. Configurar a variável `OPENAI_API_KEY`
3. Ajustar o caminho do PDF no exemplo

## Integração com o Sistema

A função retorna um objeto `Resume` que pode ser usado diretamente com:

- APIs do sistema de aplicações
- Armazenamento no banco de dados
- Análise de compatibilidade com vagas
- Geração de relatórios 