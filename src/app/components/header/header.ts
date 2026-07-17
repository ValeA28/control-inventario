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
  constructor(private router: Router) {}

  estaLogueado(): boolean {
    return localStorage.getItem('usuarioRol') !== null;
  }

  cerrarSesion() {
    localStorage.removeItem('usuarioRol');
    this.router.navigate(['/']);
    window.location.reload(); // Recargamos para que el Dashboard vea el cambio
  }

  irALogin() {
    this.router.navigate(['/login']);
  }
}
