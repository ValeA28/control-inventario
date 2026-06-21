import { UbBadgeDirective } from '@/components/ui/badge';
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { ProductService } from '../../services/product';
import { ProductoInventario } from '../../services/product.model';
import { UbSeparatorDirective } from '@/components/ui/separator';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, UbSeparatorDirective, UbBadgeDirective],
  templateUrl: './dashboard.html', 
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent implements OnInit {
  // 1. Inyectamos el servicio utilizando el estándar moderno
  private productService = inject(ProductService);

  // 2. Signals reactivos obligatorios para el manejo de estado y filtros
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

  // 📸 BANCOS DE IMÁGENES GLOBALES PARA LA ROTACIÓN AUTOMÁTICA (Manera 2)
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

  // 3. Ciclo de vida asíncrono para escuchar la API o cargar desde el disco local
  ngOnInit(): void {
    // Intentamos levantar los datos guardados previamente en la computadora del usuario
    const productosGuardados = localStorage.getItem('mis_productos_glow');

    if (productosGuardados) {
      this.productos.set(JSON.parse(productosGuardados));
      console.log('Datos persistentes recuperados desde localStorage con éxito.');
    } else {
      // Si no hay datos previos guardados en el disco, le pegamos a la API normalmente
      this.productService.getInventario().subscribe({
        next: (data) => {
          // Componentes para fabricar ropa única de forma dinámica
          const tipos = ['Remera', 'Buzo', 'Campera', 'Pantalón', 'Camisa'];
          
          const colores = [
            'Negro', 'Blanco', 'Gris', 'Beige', 'Azul Denim', 
            'Verde Militar', 'Rosa Pastel', 'Marrón Oxford', 'Blanco Off-White', 'Gris Melange'
          ];
          
          const estilos = ['Classic', 'Oversize', 'Aesthetic', 'Streetwear', 'Premium', 'Minimalist', 'Vintage', 'Modern'];

          const datosTransformados = data.map((p, index) => {
            // Respetamos si el usuario de la API creó manualmente un producto que se llame "camisa"
            const esRopaOriginalValida = p.category.name.toLowerCase() === 'clothes' && 
              (p.title.toLowerCase().includes('shirt') || p.title.toLowerCase().includes('hoodie') || p.title.toLowerCase().includes('camisa'));

            // Calculamos el costo real de base para limpiar las simulaciones previas de la API
            const costoBase = p.id < 1000 && p.price > 1000 ? 45 : p.price;

            // DETECTAMOS EL TIPO SEGÚN EL ORDEN LINEAL
            const tipo = tipos[index % tipos.length];
            const color = colores[(index * 3 + p.id) % colores.length];
            const estilo = estilos[(index * 7) % estilos.length];

            let tituloUnico = `${tipo} ${color} ${estilo}`;

            if (esRopaOriginalValida) {
              if (p.title.toLowerCase().includes('t-shirt') && !p.title.toLowerCase().includes('remera')) tituloUnico = 'Remera ' + p.title;
              else if (p.title.toLowerCase().includes('hoodie') && !p.title.toLowerCase().includes('buzo')) tituloUnico = 'Buzo ' + p.title;
              else tituloUnico = 'Camisa ' + p.title;
            }

            // 🔄 TU FÓRMULA CORREGIDA CON EL APUNTADO CORRETO (% 4 FIJO)
            const posicion = index % 4;
            let fotoFinal = '';
            
            if (tituloUnico.startsWith('Remera')) {
              fotoFinal = this.fotosRemeras[posicion];
            } else if (tituloUnico.startsWith('Buzo')) {
              fotoFinal = this.fotosBuzos[posicion];
            } else if (tituloUnico.startsWith('Campera')) {
              fotoFinal = this.fotosCamperas[posicion];
            } else if (tituloUnico.startsWith('Pantalón')) {
              fotoFinal = this.fotosPantalones[posicion];
            } else {
              fotoFinal = this.fotosCamisas[posicion];
            }

            return {
              ...p,
              title: tituloUnico,
              price: costoBase,
              precioCosto: costoBase,
              costo: costoBase,
              precioVenta: Math.round(costoBase * 1.4),
              images: [fotoFinal],
              category: {
                ...p.category,
                name: 'Clothes'
              }
            };
          });

          this.productos.set(datosTransformados);
          // Guardamos el estado inicial en el disco la primera vez
          localStorage.setItem('mis_productos_glow', JSON.stringify(datosTransformados));
          console.log('Inventario boutique 100% variado cargado y normalizado:', datosTransformados);
        },
        error: (err) => {
          console.error('Error al descargar datos de la API:', err);
        }
      });
    }
  }
  
  // 4. Lógica calculada de filtrado en tiempo real
  productosFiltrados = computed(() => {
    let resultado = this.productos();

    // 1. Filtro por texto básico (Buscador)
    if (this.terminoBusqueda()) {
      const termino = this.terminoBusqueda().toLowerCase();
      resultado = resultado.filter(p => p.title.toLowerCase().includes(termino));
    }

    // 2. Filtro por Estado de Stock
    if (this.filtroEstado() !== 'Todos') {
      resultado = resultado.filter(p => p.estadoStock === this.filtroEstado());
    }

    // 3. Filtro inteligente por tipo de prenda (Busca la palabra en el título)
    if (this.filtroPrenda() !== 'Todos') {
      resultado = resultado.filter(p => p.title.toLowerCase().includes(this.filtroPrenda().toLowerCase()));
    }

    return resultado;
  }); 
  
  // Variables nuevas y aisladas para el análisis (No modifican ningún producto)
  costoTotalStock = computed(() => {
    return this.productos().reduce((total, p) => {
      const costo = p.price || 0;
      const stock = p.stockActual || 0;
      return total + (costo * stock);
    }, 0);
  });

  gananciaTotalEstimada = computed(() => {
    return this.productos().reduce((total, p) => {
      const costo = p.price || 0;
      const venta = costo * 1.4;
      const stock = p.stockActual || 0;
      return total + ((venta - costo) * stock);
    }, 0);
  });

  // Auxiliar para automatizar el guardado en disco sin repetir líneas de código
  private guardarEnLocalStorage(listaActualizada: ProductoInventario[]): void {
    localStorage.setItem('mis_productos_glow', JSON.stringify(listaActualizada));
  }

  // 5. FUNCIONES PARA LOS BOTONES DE JULIETA (Incrementar y Decrementar Stock)
  sumarStock(producto: ProductoInventario): void {
    this.productos.update(lista => {
      const nuevaLista = lista.map(p => {
        if (p.id === producto.id) {
          const nuevoStock = p.stockActual + 1;
          const nuevoEstado: 'Disponible' | 'Bajo Stock' | 'Sin Stock' = nuevoStock > 5 ? 'Disponible' : nuevoStock > 0 ? 'Bajo Stock' : 'Sin Stock';
          return {
            ...p,
            stockActual: nuevoStock,
            estadoStock: nuevoEstado
          };
        }
        return p;
      });
      this.guardarEnLocalStorage(nuevaLista);
      return nuevaLista;
    });
  }

  restarStock(producto: ProductoInventario): void {
    this.productos.update(lista => {
      const nuevaLista = lista.map(p => {
        if (p.id === producto.id && p.stockActual > 0) {
          const nuevoStock = p.stockActual - 1;
          const nuevoEstado: 'Disponible' | 'Bajo Stock' | 'Sin Stock' = nuevoStock > 5 ? 'Disponible' : nuevoStock > 0 ? 'Bajo Stock' : 'Sin Stock';
          return {
            ...p,
            stockActual: nuevoStock,
            estadoStock: nuevoEstado
          };
        }
        return p;
      });
      this.guardarEnLocalStorage(nuevaLista);
      return nuevaLista;
    });
  }

  // Función para eliminar un producto de forma local/simulada
  eliminarProducto(id: number): void {
    this.productos.update(lista => {
      const nuevaLista = lista.filter(p => p.id !== id);
      this.guardarEnLocalStorage(nuevaLista);
      return nuevaLista;
    });
    console.log('Producto eliminado localmente. ID:', id);
  }
  
  // Función para simular el guardado de un nuevo producto con rotación inteligente de fotos
  agregarProducto(): void {
    if (!this.nuevoNombre().trim() || this.nuevoPrecioCosto() <= 0) return;

    const costo = this.nuevoPrecioCosto();
    const venta = Math.round(costo * 1.4); // 40% ganancia

    // 🕵️‍♂️ Detectamos qué tipo de prenda eligió el usuario en el desplegable
    const tipoElegido = this.filtroPrenda(); 
    let fotoAutomatica = this.fotosRemeras[0]; // Foto comodín por si el filtro está en "Todos"

    // Contamos cuántos productos del mismo tipo ya existen para elegir la siguiente foto de la lista
    const nombreLower = this.nuevoNombre().toLowerCase();

const cantidadMismoTipo = this.productos().filter(p => {
  const titulo = p.title.toLowerCase();

  if (nombreLower.includes('remera')) {
    return titulo.includes('remera');
  }

  if (nombreLower.includes('buzo')) {
    return titulo.includes('buzo');
  }

  if (nombreLower.includes('campera')) {
    return titulo.includes('campera');
  }

  if (nombreLower.includes('pantalón') || nombreLower.includes('pantalon')) {
    return titulo.includes('pantalón') || titulo.includes('pantalon');
  }

  if (nombreLower.includes('camisa')) {
    return titulo.includes('camisa');
  }

  return false;
}).length;

    // 🔄 SE MANTIENE TU LÓGICA DE AGREGAR USANDO % 4 FIJO BASADO EN TUS ARREGLOS DE 4 ELEMENTOS
    if (nombreLower.includes('remera')) {
  fotoAutomatica = this.fotosRemeras[cantidadMismoTipo % this.fotosRemeras.length];
} else if (nombreLower.includes('buzo')) {
  fotoAutomatica = this.fotosBuzos[cantidadMismoTipo % this.fotosBuzos.length];
} else if (nombreLower.includes('campera')) {
  fotoAutomatica = this.fotosCamperas[cantidadMismoTipo % this.fotosCamperas.length];
} else if (nombreLower.includes('pantalón') || nombreLower.includes('pantalon')) {
  fotoAutomatica = this.fotosPantalones[cantidadMismoTipo % this.fotosPantalones.length];
} else if (nombreLower.includes('camisa')) {
  fotoAutomatica = this.fotosCamisas[cantidadMismoTipo % this.fotosCamisas.length];
}
    const nuevoProd: ProductoInventario = {
      id: Date.now(),
      title: this.nuevoNombre(),
      price: costo,
      precioVenta: venta,
      stockActual: 10,
      estadoStock: 'Disponible',
      images: [fotoAutomatica], // Asigna la foto rotativa ideal
      description: 'Prenda exclusiva de la nueva colección Glow & Style.', 
      category: { 
        id: 1,
        name: 'Clothes' 
      }
    };

    // Lo metemos al principio de la lista y actualizamos localStorage
    this.productos.update(lista => {
      const nuevaLista = [nuevoProd, ...lista];
      this.guardarEnLocalStorage(nuevaLista);
      return nuevaLista;
    });

    // Limpiamos los campos y cerramos el formulario
    this.nuevoNombre.set('');
    this.nuevoPrecioCosto.set(0);
    this.mostrarFormulario.set(false);
    console.log('Nuevo producto agregado con rotación inteligente:', nuevoProd);
  }

  // Función para abrir el modal con los datos del producto ya cargados
  seleccionarParaEditar(producto: ProductoInventario): void {
    this.productoSeleccionado.set(producto);
    this.editarNombre.set(producto.title);
    
    // RESPALDO: Si no encuentra 'price', busca en 'precioCosto' o cualquier propiedad cruzada
    const costoReal = producto.price || (producto as any).precioCosto || (producto as any).costo || 0;
    this.editarPrecioCosto.set(costoReal);
    
    this.mostrarFormularioEditar.set(true);
  }

  // Función para guardar los cambios en la lista
  guardarEdicion(): void {
    const prod = this.productoSeleccionado();
    if (!prod || !this.editarNombre().trim() || this.editarPrecioCosto() <= 0) return;

    const costo = this.editarPrecioCosto();
    const venta = Math.round(costo * 1.4); // Calculamos el 40% de ganancia automático

    this.productos.update(lista => {
      const nuevaLista = lista.map(p => {
        if (p.id === prod.id) {
          return {
            ...p,
            title: this.editarNombre(),
            price: costo,
            precioCosto: costo,   // <-- ASEGURAMOS EL RESPALDO AL GUARDAR
            costo: costo,
            precioVenta: venta
          };
        }
        return p;
      });
      this.guardarEnLocalStorage(nuevaLista);
      return nuevaLista;
    });

    // Cerramos el modal y limpiamos el producto seleccionado
    this.mostrarFormularioEditar.set(false);
    this.productoSeleccionado.set(null);
    console.log('Producto editado con éxito!');
  }
}