export interface TagColorOption {
  backgroundColor: string;
  textColor: string;
  name: string;
  preset: string; // Nome do preset do Ant Design
}

// Cores baseadas nos presets do Ant Design (já têm bom contraste garantido)
export const PREDEFINED_TAG_COLORS: TagColorOption[] = [
  { backgroundColor: '#f50', textColor: '#ffffff', name: 'Laranja', preset: 'orange' },
  { backgroundColor: '#2db7f5', textColor: '#ffffff', name: 'Azul', preset: 'blue' },
  { backgroundColor: '#87d068', textColor: '#ffffff', name: 'Verde', preset: 'green' },
  { backgroundColor: '#108ee9', textColor: '#ffffff', name: 'Azul Escuro', preset: 'geekblue' },
  { backgroundColor: '#722ed1', textColor: '#ffffff', name: 'Roxo', preset: 'purple' },
  { backgroundColor: '#eb2f96', textColor: '#ffffff', name: 'Rosa', preset: 'magenta' },
  { backgroundColor: '#fa8c16', textColor: '#ffffff', name: 'Laranja Escuro', preset: 'orange' },
  { backgroundColor: '#a0d911', textColor: '#ffffff', name: 'Lima', preset: 'lime' },
  { backgroundColor: '#13c2c2', textColor: '#ffffff', name: 'Ciano', preset: 'cyan' },
  { backgroundColor: '#fa541c', textColor: '#ffffff', name: 'Vermelho Laranja', preset: 'volcano' },
  { backgroundColor: '#f5222d', textColor: '#ffffff', name: 'Vermelho', preset: 'red' },
  { backgroundColor: '#faad14', textColor: '#ffffff', name: 'Amarelo', preset: 'gold' },
  { backgroundColor: '#52c41a', textColor: '#ffffff', name: 'Verde Escuro', preset: 'green' },
  { backgroundColor: '#1890ff', textColor: '#ffffff', name: 'Azul Claro', preset: 'blue' },
  { backgroundColor: '#722ed1', textColor: '#ffffff', name: 'Violeta', preset: 'purple' },
  { backgroundColor: '#eb2f96', textColor: '#ffffff', name: 'Rosa Escuro', preset: 'magenta' },
  { backgroundColor: '#13c2c2', textColor: '#ffffff', name: 'Teal', preset: 'cyan' },
  { backgroundColor: '#fa8c16', textColor: '#ffffff', name: 'Laranja Claro', preset: 'orange' },
  { backgroundColor: '#a0d911', textColor: '#ffffff', name: 'Verde Lima', preset: 'lime' },
  { backgroundColor: '#1890ff', textColor: '#ffffff', name: 'Azul Sky', preset: 'blue' },
  { backgroundColor: '#52c41a', textColor: '#ffffff', name: 'Verde Emerald', preset: 'green' },
];

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
