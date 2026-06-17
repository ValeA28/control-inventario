export interface PlatziProduct {
  id: number;
  title: string;
  price: number;
  description: string;
  images: string[];
  category: {
    id: number;
    name: string;
  };
}

export interface ProductoInventario extends PlatziProduct {
  stockActual: number;
  precioVenta: number;
  estadoStock: 'Disponible' | 'Bajo Stock' | 'Sin Stock';
}

