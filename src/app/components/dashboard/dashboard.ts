import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { ProductService } from '../../services/product';
import { ProductoInventario } from '../../services/product.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
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

  // 3. Ciclo de vida asíncrono para escuchar la API
  ngOnInit(): void {
    this.productService.getInventario().subscribe({
      next: (data) => {
        // Componentes para fabricar ropa única de forma dinámica
        const tipos = ['Remera', 'Buzo', 'Campera', 'Pantalón', 'Camisa'];
        
        const colores = [
          'Negro', 'Blanco', 'Gris', 'Beige', 'Azul Denim', 
          'Verde Militar', 'Rosa Pastel', 'Marrón Oxford', 'Blanco Off-White', 'Gris Melange'
        ];
        
        const estilos = ['Classic', 'Oversize', 'Aesthetic', 'Streetwear', 'Premium', 'Minimalist', 'Vintage', 'Modern'];

        // Bancos de imágenes estéticas de Unsplash divididas por tipo de prenda
        const fotosRemeras = [
          'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=150',
          'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=150',
          'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=150',
          'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=150'
        ];

        const fotosBuzos = [
          'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=150',
          'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=150',
          'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=150',
          'https://images.unsplash.com/photo-1578762560072-1590d2c496c8?w=150'
        ];

        const fotosCamperas = [
          'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=150',
          'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=150',
          'https://images.unsplash.com/photo-1544441893-675973e31985?w=150',
          'https://images.unsplash.com/photo-1611312449412-6cefac5dc3e4?w=150'
        ];

        const fotosPantalones = [
          'https://images.unsplash.com/photo-1542272604-787c3835535d?w=150',
          'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=150',
          'https://images.unsplash.com/photo-1582552938357-32b906df43c3?w=150',
          'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=150'
        ];

        const fotosCamisas = [
          'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=150',
          'https://images.unsplash.com/photo-1603252109303-2751441dd157?w=150',
          'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=150',
          'https://images.unsplash.com/photo-1589310243389-96a5483213a8?w=150'
        ];

        const datosTransformados = data.map((p, index) => {
          // Respetamos si el usuario de la API creó manualmente un producto que se llame "camisa"
          const esRopaOriginalValida = p.category.name.toLowerCase() === 'clothes' && 
            (p.title.toLowerCase().includes('shirt') || p.title.toLowerCase().includes('hoodie') || p.title.toLowerCase().includes('camisa'));

          // Calculamos el costo real de base para limpiar las simulaciones previas de la API
          const costoBase = p.id < 1000 && p.price > 1000 ? 45 : p.price;

          if (esRopaOriginalValida) {
            let tituloModificado = p.title;
            if (p.title.toLowerCase().includes('t-shirt') && !p.title.toLowerCase().includes('remera')) tituloModificado = 'Remera ' + p.title;
            if (p.title.toLowerCase().includes('hoodie') && !p.title.toLowerCase().includes('buzo')) tituloModificado = 'Buzo ' + p.title;
            
            const tieneFoto = p.images && p.images[0] && p.images[0].startsWith('http');
            const imgFinal = tieneFoto ? p.images[0] : fotosRemeras[0];

            return { 
              ...p, 
              title: tituloModificado, 
              price: costoBase,
              precioCosto: costoBase,
              costo: costoBase,
              images: [imgFinal] 
            };
          }

          // MEZCLADOR INTELIGENTE
          const tipo = tipos[index % tipos.length];
          const color = colores[(index * 3 + p.id) % colores.length];
          const estilo = estilos[(index * 7) % estilos.length];

          const tituloUnico = `${tipo} ${color} ${estilo}`;

          let fotoFinal = '';
          if (tipo === 'Remera') fotoFinal = fotosRemeras[index % fotosRemeras.length];
          else if (tipo === 'Buzo') fotoFinal = fotosBuzos[index % fotosBuzos.length];
          else if (tipo === 'Campera') fotoFinal = fotosCamperas[index % fotosCamperas.length];
          else if (tipo === 'Pantalón') fotoFinal = fotosPantalones[index % fotosPantalones.length];
          else if (tipo === 'Camisa') fotoFinal = fotosCamisas[index % fotosCamisas.length];

          return {
            ...p,
            title: tituloUnico,
            price: costoBase,
            precioCosto: costoBase,
            costo: costoBase,
            images: [fotoFinal],
            category: {
              ...p.category,
              name: 'Clothes'
            }
          };
        });

        this.productos.set(datosTransformados);
        console.log('Inventario boutique 100% variado cargado y normalizado:', datosTransformados);
      },
      error: (err) => {
        console.error('Error al descargar datos de la API:', err);
      }
    });
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

  // 5. FUNCIONES PARA LOS BOTONES DE JULIETA (Incrementar y Decrementar Stock)
  sumarStock(producto: ProductoInventario): void {
    this.productos.update(lista => 
      lista.map(p => {
        if (p.id === producto.id) {
          const nuevoStock = p.stockActual + 1;
          return {
            ...p,
            stockActual: nuevoStock,
            estadoStock: nuevoStock > 5 ? 'Disponible' : nuevoStock > 0 ? 'Bajo Stock' : 'Sin Stock'
          };
        }
        return p;
      })
    );
  }

  restarStock(producto: ProductoInventario): void {
    this.productos.update(lista => 
      lista.map(p => {
        if (p.id === producto.id && p.stockActual > 0) {
          const nuevoStock = p.stockActual - 1;
          return {
            ...p,
            stockActual: nuevoStock,
            estadoStock: nuevoStock > 5 ? 'Disponible' : nuevoStock > 0 ? 'Bajo Stock' : 'Sin Stock'
          };
        }
        return p;
      })
    );
  }

  // Función para eliminar un producto de forma local/simulada
  eliminarProducto(id: number): void {
    this.productos.update(lista => lista.filter(p => p.id !== id));
    console.log('Producto eliminado localmente. ID:', id);
  }
  
  // Función para simular el guardado de un nuevo producto
  agregarProducto(): void {
    if (!this.nuevoNombre().trim() || this.nuevoPrecioCosto() <= 0) return;

    const costo = this.nuevoPrecioCosto();
    const venta = Math.round(costo * 1.4); // 40% ganancia

    const nuevoProd: ProductoInventario = {
      id: Date.now(),
      title: this.nuevoNombre(),
      price: costo,
      precioCosto: costo,
      precioVenta: venta,
      stockActual: 10,
      estadoStock: 'Disponible',
      images: ['https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=150'],
      description: 'Prenda exclusiva de la nueva colección Glow & Style.', // <-- NUEVO: Agregá esta línea acá
      category: { 
        id: 1,
        name: 'Clothes' 
      }
    };

    // Lo metemos al principio de la lista
    this.productos.update(lista => [nuevoProd, ...lista]);

    // Limpiamos los campos y cerramos el formulario
    this.nuevoNombre.set('');
    this.nuevoPrecioCosto.set(0);
    this.mostrarFormulario.set(false);
    console.log('Nuevo producto agregado localmente:', nuevoProd);
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

    this.productos.update(lista =>
      lista.map(p => {
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
      })
    );

    // Cerramos el modal y limpiamos el producto seleccionado
    this.mostrarFormularioEditar.set(false);
    this.productoSeleccionado.set(null);
    console.log('Producto editado con éxito!');
  }
}