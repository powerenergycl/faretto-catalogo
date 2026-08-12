import {
  Zap, Plug, Activity, Sun, Thermometer, Lightbulb, Palette, Aperture,
  Gauge, Cpu, CircuitBoard, ShieldCheck, Clock, Layers, Ruler, BadgeCheck,
  HelpCircle
} from 'lucide-react';

// Mismo lenguaje visual que las fichas tecnicas de faretto.cl: cada spec con
// su icono. No hay forma de mapear 1:1 los iconos originales (son arte propio
// de Faretto) - este es un set limpio equivalente con lucide-react, que ya es
// dependencia del proyecto.
const ICONS_BY_LABEL = {
  'Potencia': Zap,
  'Voltaje': Plug,
  'Corriente': Activity,
  'Lúmenes': Sun,
  'Temperatura': Thermometer,
  'Tipo de Luz': Lightbulb,
  'CRI': Palette,
  'Apertura de Haz': Aperture,
  'Factor de Potencia': Gauge,
  'Driver': Cpu,
  'Chip': CircuitBoard,
  'Grado de Protección': ShieldCheck,
  'Vida Media': Clock,
  'Material': Layers,
  'Medidas': Ruler,
  'Garantía': BadgeCheck
};

export function iconForSpec(label) {
  return ICONS_BY_LABEL[label] || HelpCircle;
}
