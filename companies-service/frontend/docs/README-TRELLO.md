# 🎯 Interface Trello para Gerenciamento de Candidatos

## 📋 Visão Geral

A nova interface de listagem de candidatos foi transformada em um **board estilo Trello**, onde cada coluna representa
uma etapa do processo seletivo. Os candidatos são exibidos como cards que podem ser arrastados entre as etapas.

## ✨ Funcionalidades

### 🎯 **Colunas por Etapa**

- Cada etapa da vaga vira uma coluna no board
- Colunas são ordenadas pela sequência configurada na vaga
- Contador de candidatos em cada etapa
- Descrição da etapa exibida no cabeçalho

### 🎴 **Cards de Candidatos**

- **Nome completo** do candidato
- **Informações de contato** (email e telefone)
- **Score da IA** com cores indicativas:
    - 🟢 Verde: Score ≥ 8.0
    - 🟡 Amarelo: Score 6.0-7.9
    - 🔴 Vermelho: Score < 6.0
- **Data de inscrição**
- **Botões de ação**:
    - 📄 Ver currículo (se disponível)
    - 💬 Ver respostas das questões (se houver)

### 🖱️ **Drag & Drop**

- **Arrastar candidatos** entre etapas
- **Feedback visual** durante o arrasto
- **Modal de confirmação** antes da mudança
- **Campo de observações** opcional

## 🚀 Como Usar

### 1. **Acessar a Lista de Candidatos**

```
Navegue para: /jobs/{jobId}/applications
```

### 2. **Visualizar o Board**

- Cada coluna representa uma etapa da vaga
- Cards mostram os candidatos em cada etapa
- Contador no cabeçalho indica quantos candidatos há

### 3. **Mover Candidatos**

1. **Clique e arraste** um card de candidato
2. **Solte** na coluna da etapa desejada
3. **Confirme** a mudança no modal
4. **Adicione observações** (opcional)
5. **Clique em "Confirmar"**

### 4. **Ações nos Cards**

- **Clique em "CV"** para abrir o currículo
- **Clique em "X respostas"** para ver as respostas das questões
- **Arraste o card** para mudar de etapa

## 🎨 Interface Visual

### **Layout Responsivo**

- Scroll horizontal para ver todas as etapas
- Altura adaptável ao conteúdo
- Cards compactos com informações essenciais

### **Cores e Indicadores**

- **Score da IA**: Cores baseadas na performance
- **Badges**: Contadores em cada coluna
- **Estados visuais**: Hover, drag, loading

### **Feedback Visual**

- **Durante o arrasto**: Card com rotação e borda azul
- **Confirmação**: Modal com detalhes da mudança
- **Sucesso/Erro**: Mensagens toast

## 🔧 Configuração

### **Etapas Padrão**

Toda nova vaga é criada com 3 etapas padrão:

1. **Triagem** - Avaliação inicial
2. **Entrevista** - Entrevista com candidatos
3. **Contratação** - Processo final

### **Personalização**

- Etapas podem ser editadas na criação da vaga
- Ordem das etapas é mantida
- Etapas inativas não aparecem no board

## 📊 Histórico de Mudanças

Todas as mudanças de etapa são registradas automaticamente:

- **De qual etapa veio**
- **Para qual etapa foi**
- **Quem fez a mudança**
- **Quando foi feita**
- **Observações adicionadas**

## 🎯 Benefícios

### **Para Recrutadores**

- **Visão clara** do pipeline de candidatos
- **Movimento intuitivo** entre etapas
- **Controle total** do processo
- **Histórico completo** de mudanças

### **Para o Processo**

- **Organização visual** do fluxo
- **Facilidade** de gerenciamento
- **Rastreabilidade** completa
- **Eficiência** operacional

## 🔄 Fluxo de Trabalho

```
1. Candidato se inscreve → Etapa "Triagem"
2. Recrutador avalia → Move para "Entrevista"
3. Entrevista realizada → Move para "Contratação"
4. Processo finalizado → Candidato contratado
```

## 🛠️ Tecnologias Utilizadas

- **@dnd-kit/core**: Drag and drop funcional
- **@dnd-kit/sortable**: Ordenação de elementos
- **@dnd-kit/utilities**: Utilitários CSS
- **Ant Design**: Componentes de UI
- **React**: Framework base

## 🎉 Resultado

Uma interface moderna e intuitiva que transforma o gerenciamento de candidatos em uma experiência visual e eficiente,
similar ao Trello, mas específica para processos seletivos! 🚀
