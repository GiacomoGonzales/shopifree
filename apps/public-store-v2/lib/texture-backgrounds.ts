export interface TextureBackground {
  id: string;
  name: string;
  description: string;
  cssClass: string;
  category: 'subtle' | 'geometric' | 'organic';
}

export const AVAILABLE_TEXTURES: TextureBackground[] = [
  {
    id: 'subtle-dots',
    name: 'Puntos Sutiles',
    description: 'Patrón de puntos muy suaves y elegantes',
    cssClass: 'texture-subtle-dots',
    category: 'subtle'
  },
  {
    id: 'geometric-grid',
    name: 'Cuadrícula Moderna',
    description: 'Patrón de cuadrícula geométrica limpia',
    cssClass: 'texture-geometric-grid',
    category: 'geometric'
  },
  {
    id: 'organic-waves',
    name: 'Ondas Suaves',
    description: 'Formas onduladas naturales y minimalistas',
    cssClass: 'texture-organic-waves',
    category: 'organic'
  },
  {
    id: 'diagonal-lines',
    name: 'Líneas Diagonales',
    description: 'Patrón de líneas diagonales elegantes',
    cssClass: 'texture-diagonal-lines',
    category: 'geometric'
  },
  {
    id: 'fabric-weave',
    name: 'Tejido Sutil',
    description: 'Textura que simula tejido de tela',
    cssClass: 'texture-fabric-weave',
    category: 'subtle'
  },
  {
    id: 'hexagon-pattern',
    name: 'Hexágonos',
    description: 'Patrón hexagonal moderno y sofisticado',
    cssClass: 'texture-hexagon-pattern',
    category: 'geometric'
  },
  {
    id: 'noise-texture',
    name: 'Ruido Suave',
    description: 'Textura de ruido muy sutil y orgánica',
    cssClass: 'texture-noise-texture',
    category: 'organic'
  },
  {
    id: 'floating-bubbles',
    name: 'Burbujas Flotantes',
    description: 'Círculos de diferentes tamaños como burbujas',
    cssClass: 'texture-floating-bubbles',
    category: 'organic'
  },
  {
    id: 'asymmetric-waves',
    name: 'Ondas Asimétricas',
    description: 'Ondas irregulares más naturales',
    cssClass: 'texture-asymmetric-waves',
    category: 'organic'
  },
  {
    id: 'scattered-leaves',
    name: 'Hojas Dispersas',
    description: 'Formas orgánicas inspiradas en hojas',
    cssClass: 'texture-scattered-leaves',
    category: 'organic'
  },
  {
    id: 'paper-texture',
    name: 'Textura de Papel',
    description: 'Simula la textura sutil del papel artesanal',
    cssClass: 'texture-paper-texture',
    category: 'subtle'
  }
];

export function getTextureById(id: string): TextureBackground | null {
  return AVAILABLE_TEXTURES.find(texture => texture.id === id) || null;
}

export function getTexturesByCategory(category: string): TextureBackground[] {
  return AVAILABLE_TEXTURES.filter(texture => texture.category === category);
}
