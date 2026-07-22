import { UbBadgeDirective } from '@/components/ui/badge';
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { Router, RouterLink } from '@angular/router';
import { ProductService } from '../../services/product';
import { ProductoInventario } from '../../services/product.model';
import { UbSeparatorDirective } from '@/components/ui/separator';
import { HeaderComponent } from '../header/header';
import { CartService } from '../../services/cart';
import { ReviewService, Resena } from '../../services/review';
import Swal from 'sweetalert2';
import { Chart, registerables } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';   // Chart y registerables desde chart.js

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    RouterLink, 
    UbSeparatorDirective, 
    UbBadgeDirective, 
    HeaderComponent,
    BaseChartDirective // <--- Agregamos la directiva para los gráficos
  ],
  templateUrl: './dashboard.html', 
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent implements OnInit {
  // Variables de estado
  usuarioLogueado = false;
  esAdmin = false;
  public router = inject(Router);
  private productService = inject(ProductService);
  public cartService = inject(CartService);
  private reviewService = inject(ReviewService);

  // Reseñas (variables simples compatibles con ngModel)
  resenas = signal<Resena[]>([]);
  nuevaCalificacion = 5;
  nuevoComentario = '';

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
  private fotosRemeras = [
    'assets/img/remeras/21147027-j-2-bbfa00f4e637aa7ef117259745550623-1024-1024.jpg', 
    'assets/img/remeras/images (1).jpg', 
    'assets/img/remeras/images (2).jpg', 
    'assets/img/remeras/images.jpg'
  ];
  private fotosPantalones = [
    'assets/img/pantalones/c05e66a6ce38250e56d673e70b623e86.jpg', 
    'assets/img/pantalones/images (3).jpg', 
    'assets/img/pantalones/images (4).jpg', 
    'assets/img/pantalones/PAULINA-scaled.jpg'
  ];
  private fotosCamisas = [
    'assets/img/camisas/2a18c5c2219dd7e4772ccfcf7ba4497f.jpg', 
    'assets/img/camisas/c71a28ac148a64aeea9943a9979c98899df46ce5818f0bd0313a01d1da0264da209199.jpg', 
    'assets/img/camisas/images (7).jpg', 
    'assets/img/camisas/images (8).jpg'
  ];
  private fotosCamperas = [
    'assets/img/camperas/11440067_800.jpg', 
    'assets/img/camperas/11592499_800.jpg', 
    'assets/img/camperas/Campera-Termica-Impermeable-Bomberomania-Interior-de-Polar-Coyote-12-1-320x320.jpg', 
    'assets/img/camperas/images (6).jpg'
  ];
  private fotosBuzos = [
    'assets/img/buzos/95deb3846a24bbe8ab3727fc941ef56ffd848e9f34a005d825d52b6a5d06c4c029240.jpg', 
    'assets/img/buzos/11360545_800.jpg', 
    'assets/img/buzos/D_635366-MLA110431832093_042026-O.jpg', 
    'assets/img/buzos/images (5).jpg'
  ];

  // Extrae el nombre a partir del mail para mostrar un saludo personalizado
  usuarioNombre = computed(() => {
    const email = localStorage.getItem('usuarioEmail');
    if (!email) return 'Administradora';
    const nombre = email.split('@')[0];
    return nombre.charAt(0).toUpperCase() + nombre.slice(1);
  });

  // ==========================================
  // CONFIGURACIÓN DE GRÁFICOS DINÁMICOS (CHART.JS)
  // ==========================================

  // Gráfico 1: Torta/Dona de Distribución por Categoría
  public doughnutChartType: ChartType = 'doughnut';
  public doughnutChartData = computed<ChartData<'doughnut'>>(() => {
    const prods = this.productos();
    const categoriasCount: { [key: string]: number } = {
      'Remeras': 0, 'Pantalones': 0, 'Camisas': 0, 'Camperas': 0, 'Buzos': 0
    };

    prods.forEach(p => {
      const title = p.title.toLowerCase();
      if (title.includes('remera')) categoriasCount['Remeras'] += (p.stockActual || 0);
      else if (title.includes('pantalón') || title.includes('pantalon') || title.includes('jean')) categoriasCount['Pantalones'] += (p.stockActual || 0);
      else if (title.includes('camisa')) categoriasCount['Camisas'] += (p.stockActual || 0);
      else if (title.includes('campera')) categoriasCount['Camperas'] += (p.stockActual || 0);
      else if (title.includes('buzo')) categoriasCount['Buzos'] += (p.stockActual || 0);
    });

    return {
      labels: Object.keys(categoriasCount),
      datasets: [{
        data: Object.values(categoriasCount),
        backgroundColor: ['#10b981', '#f59e0b', '#3b82f6', '#ec4899', '#8b5cf6'],
        borderWidth: 2,
        borderColor: '#171717'
      }]
    };
  });

  // Gráfico 2: Barras de Stock por Producto
  public barChartType: ChartType = 'bar';
  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      legend: { display: false }
    },
    scales: {
      x: { ticks: { color: '#a3a3a3' }, grid: { color: '#262626' } },
      y: { ticks: { color: '#a3a3a3' }, grid: { color: '#262626' } }
    }
  };

  public barChartData = computed<ChartData<'bar'>>(() => {
    // Ordenamos de menor a mayor stock para priorizar alertas de bajo stock
    const prods = [...this.productos()]
      .sort((a, b) => (a.stockActual || 0) - (b.stockActual || 0))
      .slice(0, 10);

    return {
      labels: prods.map(p => p.title.length > 12 ? p.title.substring(0, 12) + '...' : p.title),
      datasets: [{
        data: prods.map(p => p.stockActual || 0),
        label: 'Unidades en Stock',
        backgroundColor: prods.map(p => {
          const s = p.stockActual || 0;
          if (s === 0) return '#ef4444'; // Rojo si está sin stock
          if (s <= 5) return '#f59e0b';  // Naranja si está en bajo stock
          return '#10b981';             // Verde si está disponible
        }),
        borderRadius: 8
      }]
    };
  });

  ngOnInit(): void {
    const rol = localStorage.getItem('usuarioRol');

    // Cargar las reseñas
    this.cargarResenas();

    // Si hay usuario logueado, configuramos el admin y cargamos productos
    if (rol) {
      this.esAdmin = (rol === 'admin');
      this.usuarioLogueado = true;
      this.cargarProductos();
    }

    // Verificar si volvemos del checkout para mantener la vista en 'stock'
    const vistaGuardada = localStorage.getItem('vistaInicial');
    if (vistaGuardada) {
      this.vistaActual.set(vistaGuardada);
      localStorage.removeItem('vistaInicial');
    }
  }

  cargarResenas(): void {
    this.reviewService.getResenas().subscribe({
      next: (data) => this.resenas.set(data),
      error: (err) => console.error('Error al cargar reseñas:', err)
    });
  }

  enviarResena(): void {
    if (!this.nuevoComentario.trim()) return;

    const email = localStorage.getItem('usuarioEmail') || 'Cliente Anónimo';

    const nuevaResena: Resena = {
      usuarioEmail: email,
      calificacion: Number(this.nuevaCalificacion),
      comentario: this.nuevoComentario.trim(),
      fecha: new Date().toLocaleDateString('es-AR')
    };

    this.reviewService.agregarResena(nuevaResena).then(() => {
      this.nuevoComentario = '';
      this.nuevaCalificacion = 5;

      Swal.fire({
        icon: 'success',
        title: '¡Gracias por tu opinión!',
        text: 'Tu reseña fue publicada correctamente.',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        background: '#171717',
        color: '#10b981'
      });
    }).catch(err => {
      console.error(err);

      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo publicar la reseña.',
        background: '#171717',
        color: '#ffffff',
        confirmButtonColor: '#10b981'
      });
    });
  }

  cargarProductos(): void {
    const productosGuardados = localStorage.getItem('mis_productos_glow');
    if (productosGuardados) {
      this.productos.set(JSON.parse(productosGuardados));
    } else {
      this.productService.getInventario().subscribe({
        next: (data) => {
          const datosTransformados = data.map((p) => ({
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
    if (this.terminoBusqueda()) {
      resultado = resultado.filter(p => p.title.toLowerCase().includes(this.terminoBusqueda().toLowerCase()));
    }
    if (this.filtroEstado() !== 'Todos') {
      resultado = resultado.filter(p => p.estadoStock === this.filtroEstado());
    }
    if (this.filtroPrenda() !== 'Todos') {
      resultado = resultado.filter(p => p.title.toLowerCase().includes(this.filtroPrenda().toLowerCase()));
    }
    return resultado;
  });

  costoTotalStock = computed(() => 
    this.productos().reduce((total, p) => total + ((p.price || 0) * (p.stockActual || 0)), 0)
  );
  
  gananciaTotalEstimada = computed(() => 
    this.productos().reduce((total, p) => total + (((p.price || 0) * 1.4 - (p.price || 0)) * (p.stockActual || 0)), 0)
  );

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
    Swal.fire({
      title: '¿Eliminar producto?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#262626',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      background: '#171717',
      color: '#ffffff'
    }).then((result) => {
      if (result.isConfirmed) {
        this.productos.update(lista => {
          const nuevaLista = lista.filter(p => p.id !== id);
          this.guardarEnLocalStorage(nuevaLista);
          return nuevaLista;
        });

        Swal.fire({
          icon: 'success',
          title: 'Eliminado',
          text: 'El producto fue removido.',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 2000,
          background: '#171717',
          color: '#ef4444'
        });
      }
    });
  }

  // Detecta el tipo de prenda por el nombre y devuelve una imagen correspondiente
  private obtenerImagenSegunNombre(nombre: string): string {
    const nombreMinuscula = nombre.toLowerCase();

    if (nombreMinuscula.includes('buzo') || nombreMinuscula.includes('hoodie')) {
      return this.fotosBuzos[Math.floor(Math.random() * this.fotosBuzos.length)];
    }
    if (nombreMinuscula.includes('pantalón') || nombreMinuscula.includes('pantalon') || nombreMinuscula.includes('jean')) {
      return this.fotosPantalones[Math.floor(Math.random() * this.fotosPantalones.length)];
    }
    if (nombreMinuscula.includes('camisa')) {
      return this.fotosCamisas[Math.floor(Math.random() * this.fotosCamisas.length)];
    }
    if (nombreMinuscula.includes('campera') || nombreMinuscula.includes('tapado') || nombreMinuscula.includes('chaqueta')) {
      return this.fotosCamperas[Math.floor(Math.random() * this.fotosCamperas.length)];
    }

    // Por defecto usa remeras
    return this.fotosRemeras[Math.floor(Math.random() * this.fotosRemeras.length)];
  }

  agregarProducto(): void {
    if (!this.nuevoNombre().trim() || this.nuevoPrecioCosto() <= 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos incompletos',
        text: 'Por favor completá el nombre y un precio válido.',
        background: '#171717',
        color: '#ffffff',
        confirmButtonColor: '#10b981'
      });
      return;
    }

    const imagenSeleccionada = this.obtenerImagenSegunNombre(this.nuevoNombre());

    const nuevoProd: ProductoInventario = { 
      id: Date.now(), 
      title: this.nuevoNombre().trim(), 
      price: this.nuevoPrecioCosto(), 
      precioVenta: Math.round(this.nuevoPrecioCosto() * 1.4), 
      stockActual: 10, 
      estadoStock: 'Disponible', 
      images: [imagenSeleccionada], 
      description: '', 
      category: { id: 1, name: 'Clothes' } 
    };

    this.productos.update(lista => {
      const nuevaLista = [nuevoProd, ...lista];
      this.guardarEnLocalStorage(nuevaLista);
      return nuevaLista;
    });

    this.nuevoNombre.set('');
    this.nuevoPrecioCosto.set(0);
    this.mostrarFormulario.set(false);

    Swal.fire({
      icon: 'success',
      title: '¡Producto Agregado!',
      text: 'La nueva prenda ya está en el catálogo.',
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 2500,
      background: '#171717',
      color: '#10b981'
    });
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
      const nuevaLista = lista.map(p => {
        if (p.id === prod.id) {
          const nuevaImagen = this.obtenerImagenSegunNombre(this.editarNombre());
          return { 
            ...p, 
            title: this.editarNombre().trim(), 
            price: this.editarPrecioCosto(), 
            precioVenta: Math.round(this.editarPrecioCosto() * 1.4),
            images: [nuevaImagen]
          };
        }
        return p;
      });
      this.guardarEnLocalStorage(nuevaLista);
      return nuevaLista;
    });

    this.mostrarFormularioEditar.set(false);

    Swal.fire({
      icon: 'success',
      title: 'Cambios guardados',
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 2000,
      background: '#171717',
      color: '#10b981'
    });
  }

  agregarAlCarrito(producto: ProductoInventario): void {
    this.cartService.agregarAlCarrito(producto);
  }

  irAlStock(): void {
    this.vistaActual.set('stock');
  }

  irAlCheckout(): void {
    this.router.navigate(['/checkout']);
  }

  cerrarSesion(): void {
    Swal.fire({
      title: '¿Cerrar sesión?',
      text: 'Vas a salir de tu cuenta.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#262626',
      confirmButtonText: 'Sí, salir',
      cancelButtonText: 'Cancelar',
      background: '#171717',
      color: '#ffffff'
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem('usuarioRol');
        localStorage.removeItem('usuarioEmail');
        this.usuarioLogueado = false;
        this.esAdmin = false;
        this.router.navigate(['/login']);
      }
    });
  }
}