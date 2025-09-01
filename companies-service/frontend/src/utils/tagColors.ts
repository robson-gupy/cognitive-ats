export interface TagColorOption {
  backgroundColor: string;
  textColor: string;
  name: string;
  preset: string; // Nome do preset do Ant Design
}

// Cores suaves e pastéis para as tags (tons menos fortes)
export const PREDEFINED_TAG_COLORS: TagColorOption[] = [
  { backgroundColor: '#A3E1D4', textColor: '#1B4D3E', name: 'Verde Água', preset: 'aqua' },
  { backgroundColor: '#F6E1A7', textColor: '#665200', name: 'Amarelo', preset: 'yellow' },
  { backgroundColor: '#F9C9B3', textColor: '#7A3A1D', name: 'Pêssego', preset: 'peach' },
  { backgroundColor: '#F9B3B3', textColor: '#7A1F1F', name: 'Rosa Claro', preset: 'pink' },
  { backgroundColor: '#D1C2F0', textColor: '#3F2A7A', name: 'Lilás', preset: 'lilac' },

  { backgroundColor: '#63C6A7', textColor: '#114D3A', name: 'Verde Claro', preset: 'green' },
  { backgroundColor: '#E6C04E', textColor: '#5A4500', name: 'Amarelo Escuro', preset: 'dark-yellow' },
  { backgroundColor: '#F48C45', textColor: '#663300', name: 'Laranja', preset: 'orange' },
  { backgroundColor: '#E05D5D', textColor: '#5A1F1F', name: 'Vermelho', preset: 'red' },
  { backgroundColor: '#9A7FEA', textColor: '#2E1F66', name: 'Roxo', preset: 'purple' },

  { backgroundColor: '#2F7D5D', textColor: '#FFFFFF', name: 'Verde Escuro', preset: 'dark-green' },
  { backgroundColor: '#8C6D1F', textColor: '#FFFFFF', name: 'Mostarda', preset: 'mustard' },
  { backgroundColor: '#CC4B16', textColor: '#FFFFFF', name: 'Laranja Escuro', preset: 'dark-orange' },
  { backgroundColor: '#B32626', textColor: '#FFFFFF', name: 'Vermelho Escuro', preset: 'dark-red' },
  { backgroundColor: '#5A3AAE', textColor: '#FFFFFF', name: 'Roxo Escuro', preset: 'dark-purple' },

  { backgroundColor: '#D1E6FA', textColor: '#1F4D7A', name: 'Azul Claro', preset: 'light-blue' },
  { backgroundColor: '#B3E5FC', textColor: '#1F4D7A', name: 'Ciano Claro', preset: 'light-cyan' },
  { backgroundColor: '#CDEAA8', textColor: '#3F6600', name: 'Verde Limão', preset: 'lime' },
  { backgroundColor: '#F5B3DA', textColor: '#66224D', name: 'Rosa Pastel', preset: 'pastel-pink' },
  { backgroundColor: '#C4C9D1', textColor: '#2E2E2E', name: 'Cinza Claro', preset: 'gray' },

  { backgroundColor: '#4A90E2', textColor: '#FFFFFF', name: 'Azul', preset: 'blue' },
  { backgroundColor: '#3D9FBF', textColor: '#FFFFFF', name: 'Azul Ciano', preset: 'cyan' },
  { backgroundColor: '#6EA042', textColor: '#FFFFFF', name: 'Verde Médio', preset: 'medium-green' },
  { backgroundColor: '#D25CA4', textColor: '#FFFFFF', name: 'Rosa Forte', preset: 'strong-pink' },
  { backgroundColor: '#707785', textColor: '#FFFFFF', name: 'Cinza Médio', preset: 'dark-gray' },

  { backgroundColor: '#0052CC', textColor: '#FFFFFF', name: 'Azul Escuro', preset: 'dark-blue' },
  { backgroundColor: '#005F73', textColor: '#FFFFFF', name: 'Azul Petróleo', preset: 'petrol' },
  { backgroundColor: '#4F772D', textColor: '#FFFFFF', name: 'Verde Musgo', preset: 'moss-green' },
  { backgroundColor: '#9B3675', textColor: '#FFFFFF', name: 'Magenta Escuro', preset: 'dark-magenta' },
  { backgroundColor: '#495057', textColor: '#FFFFFF', name: 'Cinza Escuro', preset: 'darker-gray' }
]
;

// Função para obter uma cor aleatória da lista
export const getRandomTagColor = (): TagColorOption => {
  const randomIndex = Math.floor(Math.random() * PREDEFINED_TAG_COLORS.length);
  return PREDEFINED_TAG_COLORS[randomIndex];
};

// Função para obter uma cor específica por índice
export const getTagColorByIndex = (index: number): TagColorOption => {
  return PREDEFINED_TAG_COLORS[index % PREDEFINED_TAG_COLORS.length];
};

// Função para obter apenas o nome do preset (para usar com o componente Tag do Ant Design)
export const getTagPreset = (colorOption: TagColorOption): string => {
  return colorOption.preset;
};
