import { Component, inject, signal, NgZone } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Auth, signInWithEmailAndPassword } from '@angular/fire/auth';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
  email = '';
  password = '';
  
  // Guardamos qué pestaña seleccionó el usuario
  tipoIngreso = signal<'cliente' | 'vendedor'>('cliente');

  private auth = inject(Auth);
  private router = inject(Router);
  private ngZone = inject(NgZone); // <--- Inyectamos NgZone para sincronizar con Angular

  private correosAdmin = [
    'vale@gmail.com',
    'juliettacalderon10@gmail.com'
  ];

  async iniciarSesion() {
    try {
      const emailLimpio = this.email.trim().toLowerCase();
      const esCorreoAdmin = this.correosAdmin.includes(emailLimpio);

      // Validación: Si intenta entrar por la pestaña de vendedor con un mail común
      if (this.tipoIngreso() === 'vendedor' && !esCorreoAdmin) {
        Swal.fire({
          icon: 'warning',
          title: 'Acceso Restringido',
          text: 'Este correo no está registrado como Administrador.',
          background: '#171717',
          color: '#ffffff',
          confirmButtonColor: '#10b981'
        });
        return;
      }

      await signInWithEmailAndPassword(this.auth, this.email, this.password);

      // Si entra como cliente o como admin, le asignamos el rol
      const rolDefinitivo = (this.tipoIngreso() === 'vendedor' && esCorreoAdmin) ? 'admin' : 'cliente';

      // Usamos ngZone.run para asegurarnos de que Angular procese los datos y la navegación
      this.ngZone.run(() => {
        localStorage.setItem('usuarioRol', rolDefinitivo);
        localStorage.setItem('usuarioEmail', emailLimpio);

        this.router.navigate(['/dashboard']); 
      });

    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      Swal.fire({
        icon: 'error',
        title: '¡Error de inicio!',
        text: 'Email o contraseña incorrectos.',
        background: '#171717',
        color: '#ffffff',
        confirmButtonColor: '#10b981'
      });
    }
  }
}