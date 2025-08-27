# Prompts Externos - Documentação

## Visão Geral

Os prompts do sistema foram extraídos dos arquivos Python e organizados em arquivos de texto separados com extensão `.prompt`. Isso melhora a manutenibilidade, permite edição mais fácil e separa a lógica de negócio dos prompts de IA.

## Estrutura dos Prompts

### 📁 **Core/Resume**
- **`resume_parse.prompt`**: Prompt para parsing de currículos
  - **Arquivo**: `core/resume/resume_parse.prompt`
  - **Uso**: Extração de informações estruturadas de currículos PDF
  - **Variáveis**: `{pdf_text}`

### 📁 **Core/Jobs**
- **`job_creation.prompt`**: Prompt para criação de jobs
  - **Arquivo**: `core/jobs/job_creation.prompt`
  - **Uso**: Criação de jobs a partir de descrições
  - **Variáveis**: `{user_prompt}`

- **`job_questions.prompt`**: Prompt para geração de perguntas
  - **Arquivo**: `core/jobs/job_questions.prompt`
  - **Uso**: Geração de perguntas para avaliação de candidatos
  - **Variáveis**: `{num_questions}`, `{job}`

- **`job_stages.prompt`**: Prompt para geração de estágios
  - **Arquivo**: `core/jobs/job_stages.prompt`
  - **Uso**: Geração de estágios para processo seletivo
  - **Variáveis**: `{num_stages}`, `{job}`

- **`job_description_enhancement.prompt`**: Prompt para melhoria de descrição
  - **Arquivo**: `core/jobs/job_description_enhancement.prompt`
  - **Uso**: Melhoria de descrições de jobs
  - **Variáveis**: `{job}`, `{enhancement_prompt}`

- **`job_requirements_enhancement.prompt`**: Prompt para melhoria de requisitos
  - **Arquivo**: `core/jobs/job_requirements_enhancement.prompt`
  - **Uso**: Melhoria de requisitos de jobs
  - **Variáveis**: `{job}`, `{enhancement_prompt}`

- **`job_title_enhancement.prompt`**: Prompt para melhoria de título
  - **Arquivo**: `core/jobs/job_title_enhancement.prompt`
  - **Uso**: Melhoria de títulos de jobs
  - **Variáveis**: `{job}`, `{enhancement_prompt}`

## Vantagens da Nova Estrutura

### ✅ **Separação de Responsabilidades**
- **Código Python**: Lógica de negócio e controle de fluxo
- **Arquivos .prompt**: Conteúdo e instruções para IA

### ✅ **Manutenibilidade**
- Prompts podem ser editados sem tocar no código
- Versionamento mais claro dos prompts
- Fácil de revisar e aprovar mudanças

### ✅ **Reutilização**
- Prompts podem ser compartilhados entre diferentes partes do sistema
- Templates podem ser reutilizados com diferentes variáveis

### ✅ **Testabilidade**
- Prompts podem ser testados independentemente
- Fácil de criar testes A/B com diferentes versões

## Como Funciona

### **1. Leitura do Arquivo**
```python
def _create_resume_parse_prompt(self, pdf_text: str) -> str:
    try:
        # Lê o prompt do arquivo externo
        prompt_file_path = os.path.join(os.path.dirname(__file__), 'resume_parse.prompt')
        
        with open(prompt_file_path, 'r', encoding='utf-8') as file:
            prompt_template = file.read()
        
        # Substitui a variável {pdf_text} no template
        return prompt_template.format(pdf_text=pdf_text)
        
    except FileNotFoundError:
        raise ResumeParsingError("Arquivo de prompt 'resume_parse.prompt' não encontrado")
    except Exception as e:
        raise ResumeParsingError(f"Erro ao ler arquivo de prompt: {str(e)}")
```

### **2. Template com Variáveis**
```text
Texto do currículo:
{pdf_text}

Por favor, retorne apenas um JSON válido...
```

### **3. Substituição de Variáveis**
```python
# O método format() substitui {pdf_text} pelo texto real
prompt_template.format(pdf_text=pdf_text)
```

## Convenções de Nomenclatura

### **Arquivos de Prompt**
- **Formato**: `nome_do_servico.prompt`
- **Localização**: Mesma pasta do arquivo Python que o utiliza
- **Encoding**: UTF-8 para suporte a caracteres especiais

### **Variáveis nos Prompts**
- **Formato**: `{nome_da_variavel}`
- **Nomenclatura**: camelCase ou snake_case consistente
- **Documentação**: Sempre documentadas no código

## Tratamento de Erros

### **FileNotFoundError**
- Arquivo de prompt não encontrado
- Erro crítico que impede o funcionamento
- Mensagem clara sobre qual arquivo está faltando

### **Erros de Encoding**
- Problemas com caracteres especiais
- Fallback para encoding padrão do sistema

### **Erros de Formatação**
- Variáveis não encontradas no template
- Validação antes da substituição

## Exemplo de Uso

### **Antes (Prompt Hardcoded)**
```python
def _create_prompt(self, text: str) -> str:
    return f"""
    Você é um especialista...
    Texto: {text}
    ...
    """
```

### **Depois (Prompt Externo)**
```python
def _create_prompt(self, text: str) -> str:
    try:
        prompt_file_path = os.path.join(os.path.dirname(__file__), 'meu_prompt.prompt')
        with open(prompt_file_path, 'r', encoding='utf-8') as file:
            prompt_template = file.read()
        return prompt_template.format(text=text)
    except FileNotFoundError:
        raise MyError("Arquivo de prompt não encontrado")
```

## Manutenção e Evolução

### **Edição de Prompts**
1. Abra o arquivo `.prompt` em um editor de texto
2. Faça as alterações necessárias
3. Teste com diferentes inputs
4. Commit das mudanças

### **Versionamento**
- Prompts são versionados junto com o código
- Mudanças significativas devem ser documentadas
- Histórico de evolução dos prompts

### **Testes**
- Testes unitários para validação de prompts
- Testes de integração com diferentes inputs
- Validação de formato de saída esperado

## Benefícios para a Equipe

### 👥 **Desenvolvedores**
- Código mais limpo e focado na lógica
- Prompts podem ser ajustados sem deploy
- Fácil de debugar problemas de prompt

### 👥 **Especialistas de IA**
- Controle direto sobre os prompts
- Experimentação mais fácil
- Ajustes finos sem risco de quebrar código

### 👥 **QA**
- Prompts podem ser testados independentemente
- Validação de diferentes cenários
- Testes de regressão mais eficientes

## Conclusão

A extração dos prompts para arquivos externos representa uma melhoria significativa na arquitetura do sistema. Essa abordagem:

- **Separa** lógica de negócio de conteúdo de IA
- **Facilita** manutenção e evolução dos prompts
- **Melhora** testabilidade e debug
- **Permite** colaboração mais eficiente entre equipes

Esta estrutura segue as melhores práticas de desenvolvimento de software e torna o sistema mais profissional e escalável.
