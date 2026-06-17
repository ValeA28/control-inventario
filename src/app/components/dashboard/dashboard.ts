import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { ProductService } from '../../services/product';
import { ProductoInventario } from '../../services/product.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.html', // <-- CORREGIDO: Tu archivo se llama dashboard.html
  styleUrls: ['./dashboard.css']   // <-- CORREGIDO: Tu archivo se llama dashboard.css
})
export class DashboardComponent implements OnInit {
  // 1. Inyectamos el servicio de productos
  private productService = inject(ProductService);

  // 2. Signals para manejar el estado de los datos (Estándar de Angular v21)
  productos = signal<ProductoInventario[]>([]);
  terminoBusqueda = signal<string>('');
  filtroEstado = signal<string>('Todos');

  // 3. El ciclo de vida que explica el profesor en el PDF para suscribirse a la API
  ngOnInit(): void {
    this.productService.getInventario().subscribe({
      next: (data) => {
        this.productos.set(data);
        console.log('Datos cargados con éxito desde la API:', data);
      },
      error: (err) => {
        console.error('Error al consumir la API:', err);
      }
    });
  }

  // 4. Lógica de filtrado en tiempo real
  productosFiltrados = computed(() => {
    let resultado = this.productos();

    if (this.terminoBusqueda()) {
      const termino = this.terminoBusqueda().toLowerCase();
      resultado = resultado.filter(p => 
        p.title.toLowerCase().includes(termino) || 
        p.category.name.toLowerCase().includes(termino)
      );
    }

    if (this.filtroEstado() !== 'Todos') {
      resultado = resultado.filter(p => p.estadoStock === this.filtroEstado());
    }

    return resultado;
  });
}
