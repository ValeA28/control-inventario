import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { PlatziProduct, ProductoInventario } from './product.model';
import { Firestore, collection, collectionData, addDoc, doc, updateDoc, deleteDoc, getDocs } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private http = inject(HttpClient);
  private firestore = inject(Firestore); // Inyectamos Firestore
  private apiUrl = 'https://api.escuelajs.co/api/v1/products';

  // Método que ya tenías para la API externa
  getInventario(): Observable<ProductoInventario[]> {
    return this.http.get<PlatziProduct[]>(this.apiUrl).pipe(
      map(productos => {
        return productos.slice(0, 40).map(prod => {
          const stockSimulado = Math.floor(Math.random() * 16);
          const costo = prod.price;
          const ventaCalculada = Math.round(costo * 1.40);
          
          let estado: 'Disponible' | 'Bajo Stock' | 'Sin Stock' = 'Disponible';
          if (stockSimulado === 0) {
            estado = 'Sin Stock';
          } else if (stockSimulado <= 5) {
            estado = 'Bajo Stock';
          }

          return {
            ...prod,
            stockActual: stockSimulado,
            precioVenta: ventaCalculada,
            estadoStock: estado
          };
        });
      })
    );
  }

  // --- MÉTODOS PARA CLOUD FIRESTORE ---

  // 1. Obtener productos desde Firestore en tiempo real
  getProductosFirebase(): Observable<ProductoInventario[]> {
    const productosRef = collection(this.firestore, 'productos');
    return new Observable(observer => {
      getDocs(productosRef).then((snapshot: any) => {
        const productos = snapshot.docs.map((doc: any) => ({
          ...doc.data(),
          idFirebase: doc.id
        })) as ProductoInventario[];
        observer.next(productos);
        observer.complete();
      }).catch((err: any) => {
        observer.error(err);
      });
    });
  }

  // 2. Agregar un nuevo producto a Firestore
  agregarProductoFirebase(producto: ProductoInventario) {
    const productosRef = collection(this.firestore, 'productos');
    return addDoc(productosRef, producto);
  }

  // 3. Actualizar un producto en Firestore
  actualizarProductoFirebase(id: string, producto: Partial<ProductoInventario>) {
    const productoDocRef = doc(this.firestore, `productos/${id}`);
    return updateDoc(productoDocRef, producto);
  }

  // 4. Eliminar un producto de Firestore
  eliminarProductoFirebase(id: string) {
    const productoDocRef = doc(this.firestore, `productos/${id}`);
    return deleteDoc(productoDocRef);
  }

  // --- MÉTODOS PARA VENTAS ---

  registrarVentaFirebase(venta: any) {
    const ventasRef = collection(this.firestore, 'ventas');
    return addDoc(ventasRef, venta);
  }

  getVentasFirebase(): Observable<any[]> {
    const ventasRef = collection(this.firestore, 'ventas');
    return new Observable(observer => {
      getDocs(ventasRef).then((snapshot: any) => {
        const ventas = snapshot.docs.map((doc: any) => ({
          ...doc.data(),
          idFirebase: doc.id
        }));
        observer.next(ventas);
        observer.complete();
      }).catch((err: any) => {
        observer.error(err);
      });
    });
  }

}
