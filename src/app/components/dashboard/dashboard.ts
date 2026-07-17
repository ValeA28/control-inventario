import { UbBadgeDirective } from '@/components/ui/badge';
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { ProductService } from '../../services/product';
import { ProductoInventario } from '../../services/product.model';
import { UbSeparatorDirective } from '@/components/ui/separator';
import { HeaderComponent } from '../header/header';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, UbSeparatorDirective, UbBadgeDirective, HeaderComponent],
  templateUrl: './dashboard.html', 
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent implements OnInit {
  // Variables de estado
  usuarioLogueado = false;
  esAdmin = false;
  private router = inject(Router);
  private productService = inject(ProductService);

  // Signals
  productos = signal<ProductoInventario[]>([]);
  terminoBusqueda = signal<string>('');
  filtroEstado = signal<string>('Todos');
  filtroPrenda = signal<string>('Todos');
  sidebarAbierto = signal<boolean>(false);
  mostrarFormulario = signal<boolean>(false);
  vistaActual = signal<string>('principal');
  nuevoNombre = signal<string>('');
  nuevoPrecioCosto = signal<number>(0); 
  mostrarFormularioEditar = signal<boolean>(false);
  productoSeleccionado = signal<ProductoInventario | null>(null);
  editarNombre = signal<string>('');
  editarPrecioCosto = signal<number>(0);

  // Bancos de imágenes
  private fotosRemeras = ['assets/img/remeras/21147027-j-2-bbfa00f4e637aa7ef117259745550623-1024-1024.jpg', 'assets/img/remeras/images (1).jpg', 'assets/img/remeras/images (2).jpg', 'assets/img/remeras/images.jpg'];
  private fotosPantalones = ['assets/img/pantalones/c05e66a6ce38250e56d673e70b623e86.jpg', 'assets/img/pantalones/images (3).jpg', 'assets/img/pantalones/images (4).jpg', 'assets/img/pantalones/PAULINA-scaled.jpg'];
  private fotosCamisas = ['assets/img/camisas/2a18c5c2219dd7e4772ccfcf7ba4497f.jpg', 'assets/img/camisas/c71a28ac148a64aeea9943a9979c98899df46ce5818f0bd0313a01d1da0264da209199.jpg', 'assets/img/camisas/images (7).jpg', 'assets/img/camisas/images (8).jpg'];
  private fotosCamperas = ['assets/img/camperas/11440067_800.jpg', 'assets/img/camperas/11592499_800.jpg', 'assets/img/camperas/Campera-Termica-Impermeable-Bomberomania-Interior-de-Polar-Coyote-12-1-320x320.jpg', 'assets/img/camperas/images (6).jpg'];
  private fotosBuzos = ['assets/img/buzos/95deb3846a24bbe8ab3727fc941ef56ffd848e9f34a005d825d52b6a5d06c4c029240.jpg', 'assets/img/buzos/11360545_800.jpg', 'assets/img/buzos/D_635366-MLA110431832093_042026-O.jpg', 'assets/img/buzos/images (5).jpg'];

  ngOnInit(): void {
  const rol = localStorage.getItem('usuarioRol');

  // Si HAY usuario logueado, configuramos el admin y cargamos productos
  if (rol) {
    this.esAdmin = (rol === 'admin');
    this.usuarioLogueado = true;
    this.cargarProductos();
  }
  // SI NO HAY ROL, NO HACEMOS NADA. 
  // Así, el componente se carga, muestra la tienda pública, 
  // y no te manda a la fuerza al Login.
}

  cargarProductos(): void {
    const productosGuardados = localStorage.getItem('mis_productos_glow');
    if (productosGuardados) {
      this.productos.set(JSON.parse(productosGuardados));
    } else {
      this.productService.getInventario().subscribe({
        next: (data) => {
          const datosTransformados = data.map((p, index) => ({
            ...p,
            price: p.id < 1000 && p.price > 1000 ? 45 : p.price,
            precioVenta: Math.round((p.id < 1000 && p.price > 1000 ? 45 : p.price) * 1.4),
            category: { ...p.category, name: 'Clothes' }
          }));
          this.productos.set(datosTransformados);
          localStorage.setItem('mis_productos_glow', JSON.stringify(datosTransformados));
        }
      });
    }
  }

  productosFiltrados = computed(() => {
    let resultado = this.productos();
    if (this.terminoBusqueda()) resultado = resultado.filter(p => p.title.toLowerCase().includes(this.terminoBusqueda().toLowerCase()));
    if (this.filtroEstado() !== 'Todos') resultado = resultado.filter(p => p.estadoStock === this.filtroEstado());
    if (this.filtroPrenda() !== 'Todos') resultado = resultado.filter(p => p.title.toLowerCase().includes(this.filtroPrenda().toLowerCase()));
    return resultado;
  });

  costoTotalStock = computed(() => this.productos().reduce((total, p) => total + ((p.price || 0) * (p.stockActual || 0)), 0));
  gananciaTotalEstimada = computed(() => this.productos().reduce((total, p) => total + (((p.price || 0) * 1.4 - (p.price || 0)) * (p.stockActual || 0)), 0));

  private guardarEnLocalStorage(lista: ProductoInventario[]): void {
    localStorage.setItem('mis_productos_glow', JSON.stringify(lista));
  }

  sumarStock(producto: ProductoInventario): void {
    this.productos.update(lista => {
      const nuevaLista = lista.map(p => p.id === producto.id ? { ...p, stockActual: p.stockActual + 1 } : p);
      this.guardarEnLocalStorage(nuevaLista);
      return nuevaLista;
    });
  }

  restarStock(producto: ProductoInventario): void {
    this.productos.update(lista => {
      const nuevaLista = lista.map(p => p.id === producto.id && p.stockActual > 0 ? { ...p, stockActual: p.stockActual - 1 } : p);
      this.guardarEnLocalStorage(nuevaLista);
      return nuevaLista;
    });
  }

  eliminarProducto(id: number): void {
    this.productos.update(lista => {
      const nuevaLista = lista.filter(p => p.id !== id);
      this.guardarEnLocalStorage(nuevaLista);
      return nuevaLista;
    });
  }

  agregarProducto(): void {
    if (!this.nuevoNombre().trim() || this.nuevoPrecioCosto() <= 0) return;
    const nuevoProd: ProductoInventario = { id: Date.now(), title: this.nuevoNombre(), price: this.nuevoPrecioCosto(), precioVenta: Math.round(this.nuevoPrecioCosto() * 1.4), stockActual: 10, estadoStock: 'Disponible', images: ['assets/img/remeras/images.jpg'], description: '', category: { id: 1, name: 'Clothes' } };
    this.productos.update(lista => {
      const nuevaLista = [nuevoProd, ...lista];
      this.guardarEnLocalStorage(nuevaLista);
      return nuevaLista;
    });
    this.mostrarFormulario.set(false);
  }

  seleccionarParaEditar(producto: ProductoInventario): void {
    this.productoSeleccionado.set(producto);
    this.editarNombre.set(producto.title);
    this.editarPrecioCosto.set(producto.price);
    this.mostrarFormularioEditar.set(true);
  }

  guardarEdicion(): void {
    const prod = this.productoSeleccionado();
    if (!prod) return;
    this.productos.update(lista => {
      const nuevaLista = lista.map(p => p.id === prod.id ? { ...p, title: this.editarNombre(), price: this.editarPrecioCosto(), precioVenta: Math.round(this.editarPrecioCosto() * 1.4) } : p);
      this.guardarEnLocalStorage(nuevaLista);
      return nuevaLista;
    });
    this.mostrarFormularioEditar.set(false);
  }
}        