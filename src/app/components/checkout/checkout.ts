import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CartService } from '../../services/cart';
import { jsPDF } from 'jspdf';
import { HeaderComponent } from '../header/header';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent],
  template: `
    <app-header></app-header>
    
    <!-- Modal Contenedor con Fondo Oscuro Clickeable para cerrar -->
    <div 
      class="min-h-screen bg-black/80 backdrop-blur-sm p-4 md:p-10 flex items-center justify-center relative"
      (click)="cerrarModal()"
    >
      
      <!-- Ventana Principal -->
      <div 
        class="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-3xl p-6 md:p-8 shadow-2xl relative text-neutral-100"
        (click)="$event.stopPropagation()"
      >
        
        <!-- Cruz para cerrar -->
        <button 
          (click)="cerrarModal()"
          class="absolute top-5 right-5 text-neutral-400 hover:text-white bg-neutral-800 hover:bg-neutral-700 w-9 h-9 rounded-full flex items-center justify-center font-bold text-lg transition-colors"
          title="Cerrar y volver al inventario"
        >
          ✕
        </button>

        <h2 class="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500 mb-6 flex items-center gap-2">
          🛍️ Finalizar Compra y Carrito
        </h2>

        <!-- SI EL CARRITO ESTÁ VACÍO -->
        <div *ngIf="cartService.items().length === 0" class="text-center py-12">
          <div class="text-5xl mb-4">🛒</div>
          <p class="text-neutral-400 text-lg mb-6">Tu carrito está vacío.</p>
          <button 
            (click)="cerrarModal()" 
            class="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-neutral-950 font-bold rounded-xl text-sm transition-all"
          >
            Volver a los Productos
          </button>
        </div>

        <!-- SI HAY PRODUCTOS EN EL CARRITO -->
        <div *ngIf="cartService.items().length > 0">
          
          <!-- INDICADOR DE 3 PASOS -->
          <div class="flex items-center justify-center gap-2 md:gap-4 mb-8 border-b border-neutral-800 pb-4 text-[11px] md:text-xs font-bold uppercase tracking-wider">
            <span [class.text-emerald-400]="pasoActual() === 1" [class.text-neutral-500]="pasoActual() !== 1">1. Productos</span>
            <span class="text-neutral-600">➔</span>
            <span [class.text-emerald-400]="pasoActual() === 2" [class.text-neutral-500]="pasoActual() !== 2">2. Entrega</span>
            <span class="text-neutral-600">➔</span>
            <span [class.text-emerald-400]="pasoActual() === 3" [class.text-neutral-500]="pasoActual() !== 3">3. Método de Pago</span>
          </div>

          <!-- ================= PASO 1: PRODUCTOS ================= -->
          <div *ngIf="pasoActual() === 1">
            <div class="divide-y divide-neutral-800 max-h-72 overflow-y-auto pr-2 mb-6">
              <div *ngFor="let item of cartService.items()" class="py-3 flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <img [src]="item.producto.images[0]" class="w-12 h-12 object-cover rounded-lg border border-neutral-800" />
                  <div>
                    <h4 class="font-semibold text-neutral-200 text-sm">{{ item.producto.title }}</h4>
                    <p class="text-xs text-neutral-400">c/u: \${{ item.producto.precioVenta }}</p>
                  </div>
                </div>

                <div class="flex items-center gap-3">
                  <div class="flex items-center border border-neutral-800 rounded-lg bg-neutral-950 overflow-hidden">
                    <button (click)="cartService.restarUnidad(item.producto.id)" class="px-2.5 py-1 text-neutral-300 hover:bg-neutral-800 font-bold">-</button>
                    <span class="px-3 text-xs font-mono font-bold text-white">{{ item.cantidad }}</span>
                    <button (click)="cartService.sumarUnidad(item.producto.id)" class="px-2.5 py-1 text-neutral-300 hover:bg-neutral-800 font-bold">+</button>
                  </div>
                  <button (click)="cartService.eliminarDelCarrito(item.producto.id)" class="text-red-400 text-xs hover:underline">Eliminar</button>
                </div>
              </div>
            </div>

            <div class="border-t border-neutral-800 pt-4 flex justify-between items-center mb-6">
              <span class="text-sm font-bold text-neutral-400">Subtotal Productos:</span>
              <span class="text-2xl font-mono font-black text-emerald-400">\${{ cartService.totalPrecio() }}</span>
            </div>

            <div class="flex gap-3 justify-end">
              <button (click)="cerrarModal()" class="px-4 py-2.5 rounded-xl bg-neutral-800 text-neutral-300 text-xs font-semibold hover:bg-neutral-700">
                Seguir Comprando
              </button>
              <button (click)="pasoActual.set(2)" class="px-6 py-2.5 rounded-xl bg-emerald-500 text-neutral-950 font-bold text-xs hover:bg-emerald-400">
                Continuar a Entrega ➔
              </button>
            </div>
          </div>

          <!-- ================= PASO 2: FORMA DE ENTREGA ================= -->
          <div *ngIf="pasoActual() === 2">
            <div class="bg-neutral-950 border border-neutral-800 rounded-xl p-5 mb-6">
              <h3 class="text-xs font-bold text-neutral-300 uppercase tracking-wider mb-4">📦 Seleccione Forma de Entrega</h3>
              
              <div class="grid grid-cols-2 gap-3 mb-4">
                <button 
                  (click)="tipoEnvio.set('sucursal')"
                  class="p-4 rounded-xl border text-xs font-bold transition-all text-center"
                  [class.border-emerald-500]="tipoEnvio() === 'sucursal'"
                  [class.bg-emerald-500\/10]="tipoEnvio() === 'sucursal'"
                  [class.text-emerald-400]="tipoEnvio() === 'sucursal'"
                  [class.border-neutral-800]="tipoEnvio() !== 'sucursal'"
                  [class.text-neutral-400]="tipoEnvio() !== 'sucursal'"
                >
                  🏢 Retiro en Sucursal (Gratis)
                </button>

                <button 
                  (click)="tipoEnvio.set('envio')"
                  class="p-4 rounded-xl border text-xs font-bold transition-all text-center"
                  [class.border-emerald-500]="tipoEnvio() === 'envio'"
                  [class.bg-emerald-500\/10]="tipoEnvio() === 'envio'"
                  [class.text-emerald-400]="tipoEnvio() === 'envio'"
                  [class.border-neutral-800]="tipoEnvio() !== 'envio'"
                  [class.text-neutral-400]="tipoEnvio() !== 'envio'"
                >
                  🚚 Envío a Domicilio (+\$1500)
                </button>
              </div>

              <div *ngIf="tipoEnvio() === 'envio'" class="space-y-3 pt-2">
                <div>
                  <label class="text-[10px] text-neutral-400 block mb-1">Dirección Completa</label>
                  <input type="text" [(ngModel)]="direccionEnvio" placeholder="Calle, número, piso, dpto..." class="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-xs text-neutral-200 focus:outline-none focus:border-emerald-500" />
                </div>
                <div>
                  <label class="text-[10px] text-neutral-400 block mb-1">Localidad / Ciudad</label>
                  <input type="text" [(ngModel)]="ciudadEnvio" placeholder="Ej: San Martín, Mendoza" class="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-xs text-neutral-200 focus:outline-none focus:border-emerald-500" />
                </div>
              </div>
            </div>

            <div class="border-t border-neutral-800 pt-4 flex justify-between items-center mb-6">
              <span class="text-sm font-bold text-neutral-400">Total Acumulado:</span>
              <span class="text-2xl font-mono font-black text-emerald-400">\${{ calcularTotalFinal() }}</span>
            </div>

            <div class="flex gap-3 justify-end">
              <button (click)="pasoActual.set(1)" class="px-4 py-2.5 rounded-xl bg-neutral-800 text-neutral-300 text-xs font-semibold hover:bg-neutral-700">
                ⬅ Volver a Productos
              </button>
              <button (click)="irAlPaso3()" class="px-6 py-2.5 rounded-xl bg-emerald-500 text-neutral-950 font-bold text-xs hover:bg-emerald-400">
                Continuar al Pago ➔
              </button>
            </div>
          </div>

          <!-- ================= PASO 3: MÉTODO DE PAGO ================= -->
          <div *ngIf="pasoActual() === 3">
            <div class="bg-neutral-950 border border-neutral-800 rounded-xl p-5 mb-6">
              <h3 class="text-xs font-bold text-neutral-300 uppercase tracking-wider mb-4">💳 Elija su Método de Pago</h3>
              
              <div class="grid grid-cols-3 gap-2 mb-4">
                <button 
                  (click)="metodoPago.set('tarjeta')"
                  class="p-3 rounded-xl border text-xs font-bold transition-all text-center"
                  [class.border-emerald-500]="metodoPago() === 'tarjeta'"
                  [class.text-emerald-400]="metodoPago() === 'tarjeta'"
                  [class.border-neutral-800]="metodoPago() !== 'tarjeta'"
                  [class.text-neutral-400]="metodoPago() !== 'tarjeta'"
                >
                  💳 Tarjeta
                </button>

                <button 
                  (click)="metodoPago.set('transferencia')"
                  class="p-3 rounded-xl border text-xs font-bold transition-all text-center"
                  [class.border-emerald-500]="metodoPago() === 'transferencia'"
                  [class.text-emerald-400]="metodoPago() === 'transferencia'"
                  [class.border-neutral-800]="metodoPago() !== 'transferencia'"
                  [class.text-neutral-400]="metodoPago() !== 'transferencia'"
                >
                  🏦 Transferencia
                </button>

                <button 
                  (click)="metodoPago.set('efectivo')"
                  class="p-3 rounded-xl border text-xs font-bold transition-all text-center"
                  [class.border-emerald-500]="metodoPago() === 'efectivo'"
                  [class.text-emerald-400]="metodoPago() === 'efectivo'"
                  [class.border-neutral-800]="metodoPago() !== 'efectivo'"
                  [class.text-neutral-400]="metodoPago() !== 'efectivo'"
                >
                  💵 Efectivo
                </button>
              </div>

              <div *ngIf="metodoPago() === 'tarjeta'" class="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                <div>
                  <label class="text-[10px] text-neutral-400 block mb-1">Número de Tarjeta</label>
                  <input type="text" placeholder="4532 •••• •••• 8900" class="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2 text-xs text-neutral-200 focus:outline-none focus:border-emerald-500" />
                </div>
                <div>
                  <label class="text-[10px] text-neutral-400 block mb-1">Titular de la Tarjeta</label>
                  <input type="text" placeholder="Valentina Gómez" class="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2 text-xs text-neutral-200 focus:outline-none focus:border-emerald-500" />
                </div>
                <div>
                  <label class="text-[10px] text-neutral-400 block mb-1">Vencimiento</label>
                  <input type="text" placeholder="MM/AA" class="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2 text-xs text-neutral-200 focus:outline-none focus:border-emerald-500" />
                </div>
                <div>
                  <label class="text-[10px] text-neutral-400 block mb-1">CVC / CVV</label>
                  <input type="password" placeholder="123" maxlength="4" class="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2 text-xs text-neutral-200 focus:outline-none focus:border-emerald-500" />
                </div>
              </div>

              <div *ngIf="metodoPago() === 'transferencia'" class="bg-neutral-900 p-3 rounded-lg text-xs space-y-1 text-neutral-300">
                <p><strong class="text-emerald-400">CBU:</strong> 0000003100045281920381</p>
                <p><strong class="text-emerald-400">Alias:</strong> GLOW.STYLE.BOUTIQUE</p>
                <p><strong class="text-emerald-400">Titular:</strong> Glow & Style S.R.L.</p>
              </div>

              <div *ngIf="metodoPago() === 'efectivo'" class="bg-neutral-900 p-3 rounded-lg text-xs text-neutral-300">
                <p>💵 Podrás abonar directamente al retirar en nuestra sucursal o al entregar la prenda.</p>
              </div>
            </div>

            <div class="border-t border-neutral-800 pt-4 flex justify-between items-center mb-6">
              <span class="text-sm font-bold text-neutral-400">Total Final:</span>
              <span class="text-2xl font-mono font-black text-emerald-400">\${{ calcularTotalFinal() }}</span>
            </div>

            <div class="flex gap-3 justify-end">
              <button (click)="pasoActual.set(2)" class="px-4 py-2.5 rounded-xl bg-neutral-800 text-neutral-300 text-xs font-semibold hover:bg-neutral-700">
                ⬅ Volver a Entrega
              </button>
              <button (click)="pagarYGenerarPDF()" class="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-neutral-950 font-bold text-xs shadow-lg hover:opacity-90">
                Confirmar Pago y Descargar PDF 📄
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  `
})
export class CheckoutComponent {
  cartService = inject(CartService);
  router = inject(Router);

  pasoActual = signal<number>(1);
  tipoEnvio = signal<'sucursal' | 'envio'>('sucursal');
  metodoPago = signal<'tarjeta' | 'transferencia' | 'efectivo'>('tarjeta');

  direccionEnvio = '';
  ciudadEnvio = '';

  calcularTotalFinal(): number {
    const subtotal = this.cartService.totalPrecio();
    return this.tipoEnvio() === 'envio' ? subtotal + 1500 : subtotal;
  }

  cerrarModal() {
    localStorage.setItem('vistaInicial', 'stock');
    this.router.navigate(['/dashboard']);
  }

  irAlPaso3() {
    if (this.tipoEnvio() === 'envio' && (!this.direccionEnvio.trim() || !this.ciudadEnvio.trim())) {
      Swal.fire({
        icon: 'warning',
        title: 'Datos Incompletos',
        text: 'Por favor ingresá tu dirección y ciudad para realizar el envío.',
        background: '#171717',
        color: '#ffffff',
        confirmButtonColor: '#10b981'
      });
      return;
    }
    this.pasoActual.set(3);
  }

  pagarYGenerarPDF() {
    const doc = new jsPDF();
    const items = this.cartService.items();
    const total = this.calcularTotalFinal();

    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(16, 185, 129);
    doc.text("Glow & Style Boutique", 20, 20);

    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text("Comprobante Oficial de Compra", 20, 28);

    doc.setLineWidth(0.5);
    doc.line(20, 32, 190, 32);

    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 20, 42);
    doc.text(`Método de Pago: ${this.metodoPago().toUpperCase()}`, 20, 48);
    doc.text(`Tipo de Entrega: ${this.tipoEnvio() === 'envio' ? 'Envío a Domicilio (' + this.direccionEnvio + ')' : 'Retiro en Sucursal'}`, 20, 54);

    let y = 68;
    doc.setFont("helvetica", "bold");
    doc.text("Producto", 20, y);
    doc.text("Cant", 120, y);
    doc.text("Subtotal", 160, y);
    
    doc.setFont("helvetica", "normal");
    y += 8;

    items.forEach(item => {
      doc.text(item.producto.title.substring(0, 35), 20, y);
      doc.text(item.cantidad.toString(), 120, y);
      doc.text(`\$${item.producto.precioVenta * item.cantidad}`, 160, y);
      y += 8;
    });

    if (this.tipoEnvio() === 'envio') {
      doc.text("Costo de Envío a Domicilio", 20, y);
      doc.text("1", 120, y);
      doc.text("\$1500", 160, y);
      y += 8;
    }

    doc.line(20, y + 2, 190, y + 2);
    y += 10;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text(`Total Abonado: \$${total}`, 20, y);

    doc.save("comprobante-glow-style.pdf");

    this.cartService.vaciarCarrito();

    Swal.fire({
      icon: 'success',
      title: '¡Pago Realizado con Éxito! 🎉',
      text: 'Comprobante descargado correctamente. ¡Gracias por tu compra!',
      background: '#171717',
      color: '#ffffff',
      confirmButtonColor: '#10b981',
      confirmButtonText: 'Aceptar',
      customClass: {
        popup: 'rounded-2xl border border-neutral-800 shadow-2xl'
      }
    }).then(() => {
      localStorage.setItem('vistaInicial', 'stock');
      this.router.navigate(['/dashboard']);
    });
  }
}