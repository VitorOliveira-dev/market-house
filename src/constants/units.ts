/**
 * Units Constants
 * Define available measurement units for items
 */

export interface Unit {
  value: string;
  label: string;
  category: 'weight' | 'volume' | 'quantity' | 'other';
}

export const AVAILABLE_UNITS: Unit[] = [
  // Peso
  { value: 'kg', label: 'Quilograma (kg)', category: 'weight' },
  { value: 'g', label: 'Grama (g)', category: 'weight' },
  { value: 'mg', label: 'Miligrama (mg)', category: 'weight' },
  
  // Volume
  { value: 'L', label: 'Litro (L)', category: 'volume' },
  { value: 'ml', label: 'Mililitro (ml)', category: 'volume' },
  
  // Quantidade
  { value: 'un', label: 'Unidade', category: 'quantity' },
  { value: 'dz', label: 'Dúzia', category: 'quantity' },
  { value: 'cx', label: 'Caixa', category: 'quantity' },
  { value: 'pct', label: 'Pacote', category: 'quantity' },
  { value: 'lata', label: 'Lata', category: 'quantity' },
  { value: 'garrafa', label: 'Garrafa', category: 'quantity' },
  { value: 'saco', label: 'Saco', category: 'quantity' },
  { value: 'bandeja', label: 'Bandeja', category: 'quantity' },
  
  // Outros
  { value: 'm', label: 'Metro (m)', category: 'other' },
  { value: 'cm', label: 'Centímetro (cm)', category: 'other' },
  { value: 'rolo', label: 'Rolo', category: 'other' },
];

// Unidades sugeridas por tipo de categoria
export const SUGGESTED_UNITS_BY_TYPE = {
  bebidas: ['L', 'ml', 'lata', 'garrafa', 'un'],
  limpeza: ['L', 'ml', 'un'],
  alimentos: ['kg', 'g', 'L', 'ml', 'un', 'pct'],
  laticinios: ['L', 'ml', 'kg', 'g', 'un'],
  carnes: ['kg', 'g', 'bandeja', 'un'],
  frutas_legumes: ['kg', 'g', 'un'],
  higiene: ['un', 'ml', 'L', 'g'],
  padaria: ['un', 'kg', 'g', 'pct'],
  congelados: ['kg', 'g', 'un', 'cx'],
  enlatados: ['lata', 'un', 'g', 'ml'],
} as const;

/**
 * Get unit label by value
 */
export function getUnitLabel(value: string): string {
  const unit = AVAILABLE_UNITS.find(u => u.value === value);
  return unit?.label || value;
}

/**
 * Get units by category
 */
export function getUnitsByCategory(category: Unit['category']): Unit[] {
  return AVAILABLE_UNITS.filter(u => u.category === category);
}
