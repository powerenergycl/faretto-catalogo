import {
  Lightbulb, MapPin, Cable, LayoutGrid, Flashlight, Zap, LayoutList,
  MessageCircle, Building2, ShoppingCart, Tag, Package, Truck, Phone,
  Mail, Star
} from 'lucide-react';

// Mismo set curado que ACCESS_ICON_OPTIONS en sitio_power (AdminPage.jsx) -
// el admin guarda el nombre exacto del icono de lucide-react en
// metadata.icono, este mapa lo resuelve al componente real.
const ICONS_BY_NAME = {
  Lightbulb,
  MapPin,
  Cable,
  LayoutGrid,
  Flashlight,
  Zap,
  LayoutList,
  MessageCircle,
  Building2,
  ShoppingCart,
  Tag,
  Package,
  Truck,
  Phone,
  Mail,
  Star
};

export function iconForAccess(name) {
  return ICONS_BY_NAME[name] || LayoutList;
}
