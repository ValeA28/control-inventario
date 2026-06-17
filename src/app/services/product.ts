import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { PlatziProduct, ProductoInventario } from './product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private http = inject(HttpClient); 
  private apiUrl = 'https://api.escuelajs.co/api/v1/products';

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
}