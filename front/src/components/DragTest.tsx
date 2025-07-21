import React, { useState } from 'react';
import { Card, Typography } from 'antd';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  MouseSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const { Title } = Typography;

interface TestItem {
  id: string;
  name: string;
}

const SortableTestItem: React.FC<{
  item: TestItem;
  index: number;
}> = ({ item, index }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 'auto',
  };

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        border: '1px solid #d9d9d9',
        borderRadius: '8px',
        marginBottom: '8px',
        padding: '16px',
        backgroundColor: '#fafafa',
        cursor: 'grab',
      }}
      {...attributes}
      {...listeners}
    >
      <div style={{ fontWeight: 'bold' }}>
        Item {index + 1}: {item.name}
      </div>
    </div>
  );
};

export const DragTest: React.FC = () => {
  const [items, setItems] = useState<TestItem[]>([
    { id: '1', name: 'Primeiro Item' },
    { id: '2', name: 'Segundo Item' },
    { id: '3', name: 'Terceiro Item' },
    { id: '4', name: 'Quarto Item' },
  ]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(MouseSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    console.log('Test drag end event:', { active: active.id, over: over?.id });

    if (active.id !== over?.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over?.id);
        
        console.log('Test reordering:', { oldIndex, newIndex });
        
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <Title level={2}>Teste de Drag and Drop</Title>
        <p>Arraste os itens para reordená-los:</p>
        
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={items.map(item => item.id)}
            strategy={verticalListSortingStrategy}
          >
            <div style={{ minHeight: '100px' }}>
              {items.map((item, index) => (
                <SortableTestItem
                  key={item.id}
                  item={item}
                  index={index}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
        
        <div style={{ marginTop: '16px' }}>
          <h4>Ordem atual:</h4>
          <ol>
            {items.map((item) => (
              <li key={item.id}>{item.name}</li>
            ))}
          </ol>
        </div>
      </Card>
    </div>
  );
}; 