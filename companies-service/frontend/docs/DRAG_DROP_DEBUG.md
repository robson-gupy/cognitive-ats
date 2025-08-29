# Debug do Drag and Drop - Applications

## Problema Identificado

O drag and drop dos cards de applications parou de funcionar após a implementação da ordenação por `overall_score`.

## Possíveis Causas

### 1. **Configuração dos Sensores**
- Distância de ativação muito alta
- Sensores não configurados corretamente

### 2. **Z-Index e Posicionamento**
- Elementos sobrepondo os cards arrastáveis
- Problemas de layering

### 3. **Ordenação Interferindo**
- A ordenação pode estar criando novos arrays que interferem com o drag and drop

## Correções Implementadas

### 1. **Ajuste dos Sensores**
```typescript
const sensors = useSensors(
  useSensor(PointerSensor, {
    activationConstraint: {
      distance: 3, // Reduzido de 8 para 3
    },
  }),
  useSensor(KeyboardSensor),
);
```

### 2. **Melhorias no Cursor**
```typescript
style={{
  cursor: isDragging ? 'grabbing' : 'grab',
  userSelect: 'none', // Previne seleção de texto
}}
```

### 3. **Ajustes de Z-Index**
```typescript
// Container principal
position: 'relative',
zIndex: 1

// StageColumn
position: 'relative',
zIndex: 2
```

### 4. **Logs de Debug**
```typescript
const handleDragStart = (event: DragStartEvent) => {
  console.log('🔄 Drag start:', event.active.id);
  setActiveId(event.active.id as string);
};

const handleDragEnd = async (event: DragEndEvent) => {
  const { active, over } = event;
  console.log('🔄 Drag end:', { active: active.id, over: over?.id });
  // ...
};
```

## Como Testar

### 1. **Verificar Console**
Abra o console do navegador e tente arrastar um card. Você deve ver:
```
🔄 Drag start: application-id
🔄 Drag end: { active: "application-id", over: "stage-id" }
```

### 2. **Verificar Cursor**
- O cursor deve mudar para `grab` quando passar sobre um card
- Deve mudar para `grabbing` durante o arrasto

### 3. **Verificar Visual**
- O card deve ficar semi-transparente durante o arrasto
- Deve aparecer um overlay de arrasto

## Se Ainda Não Funcionar

### 1. **Verificar Imports**
```typescript
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  KeyboardSensor,
} from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
```

### 2. **Verificar Dependências**
```bash
npm list @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

### 3. **Testar sem Ordenação**
Temporariamente remova a ordenação para verificar se é a causa:
```typescript
const getApplicationsByStage = (stageId: string) => {
  return applications.filter(app => {
    const pendingStageId = pendingStageChanges.get(app.id);
    const effectiveStageId = pendingStageId || app.currentStageId;
    return effectiveStageId === stageId;
  });
  // Remover temporariamente o .sort()
};
```

## Soluções Alternativas

### 1. **Usar Droppable em vez de Sortable**
Se o problema persistir, podemos usar `useDroppable` para as colunas e `useDraggable` para os cards.

### 2. **Implementar Drag Manual**
Como fallback, podemos implementar um sistema de drag manual com eventos de mouse.

### 3. **Usar Biblioteca Alternativa**
Se necessário, podemos migrar para react-beautiful-dnd ou outra biblioteca.

## Status Atual

- ✅ Sensores ajustados
- ✅ Cursor melhorado
- ✅ Z-index configurado
- ✅ Logs de debug adicionados
- 🔄 Testando funcionalidade
