import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.html'
})
export class HeaderComponent {
  mostrarModalConfirmacion = false;

  constructor(private router: Router) {}

  estaLogueado(): boolean {
    return localStorage.getItem('usuarioRol') !== null;
  }

  abrirConfirmacion(): void {
    this.mostrarModalConfirmacion = true;
  }

  cancelarCierre(): void {
    this.mostrarModalConfirmacion = false;
  }

  confirmarCierreSesion(): void {
    localStorage.removeItem('usuarioRol');
    localStorage.removeItem('usuarioEmail');
    this.mostrarModalConfirmacion = false;
    this.router.navigate(['/login']);
  }

  irALogin(): void {
    this.router.navigate(['/login']);
  }
}