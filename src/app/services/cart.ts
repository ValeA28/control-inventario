import { Injectable, signal, computed } from '@angular/core';
import { ProductoInventario } from './product.model';

export interface CartItem {
  producto: ProductoInventario;
  cantidad: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  items = signal<CartItem[]>([]);

  totalItems = computed(() => this.items().reduce((acc, item) => acc + item.cantidad, 0));
  totalPrecio = computed(() => this.items().reduce((acc, item) => acc + (item.producto.precioVenta * item.cantidad), 0));

  agregarAlCarrito(producto: ProductoInventario) {
    this.items.update(actuales => {
      const existe = actuales.find(i => i.producto.id === producto.id);
      if (existe) {
        return actuales.map(i => i.producto.id === producto.id ? { ...i, cantidad: i.cantidad + 1 } : i);
      }
      return [...actuales, { producto, cantidad: 1 }];
    });
  }

  sumarUnidad(productoId: number) {
    this.items.update(actuales => 
      actuales.map(i => i.producto.id === productoId ? { ...i, cantidad: i.cantidad + 1 } : i)
    );
  }

  restarUnidad(productoId: number) {
    this.items.update(actuales => {
      const item = actuales.find(i => i.producto.id === productoId);
      if (item && item.cantidad > 1) {
        return actuales.map(i => i.producto.id === productoId ? { ...i, cantidad: i.cantidad - 1 } : i);
      }
      return actuales.filter(i => i.producto.id !== productoId);
    });
  }

  eliminarDelCarrito(productoId: number) {
    this.items.update(actuales => actuales.filter(i => i.producto.id !== productoId));
  }

  vaciarCarrito() {
    this.items.set([]);
  }
}