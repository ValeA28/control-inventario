import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Auth, createUserWithEmailAndPassword } from '@angular/fire/auth';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './registro.html',
  styleUrls: ['./registro.css']
})
export class RegistroComponent {
  email = '';
  password = '';
  confirmPassword = '';

  private auth = inject(Auth);
  private router = inject(Router);

  private correosAdmin = [
    'admin@glow.com',
    'vendedor@glow.com'
  ];

  async registrarse() {
    // 1. Validar largo de contraseña
    if (this.password.length < 6) {
      Swal.fire({
        icon: 'warning',
        title: 'Contraseña muy corta',
        text: 'La contraseña debe tener al menos 6 caracteres.',
        background: '#171717',
        color: '#ffffff',
        confirmButtonColor: '#10b981',
        customClass: {
          popup: 'rounded-2xl border border-neutral-800 shadow-2xl'
        }
      });
      return;
    }

    // 2. Validar coincidencia de contraseñas
    if (this.password !== this.confirmPassword) {
      Swal.fire({
        icon: 'warning',
        title: 'Las contraseñas no coinciden',
        text: 'Por favor verificá que ambas contraseñas sean iguales.',
        background: '#171717',
        color: '#ffffff',
        confirmButtonColor: '#10b981',
        customClass: {
          popup: 'rounded-2xl border border-neutral-800 shadow-2xl'
        }
      });
      return;
    }

    try {
      await createUserWithEmailAndPassword(this.auth, this.email, this.password);
      
      const emailLimpio = this.email.trim().toLowerCase();

      const esAdmin = this.correosAdmin.includes(emailLimpio);
      const rolDefinitivo = esAdmin ? 'admin' : 'cliente';

      localStorage.setItem('usuarioRol', rolDefinitivo);
      localStorage.setItem('usuarioEmail', emailLimpio);
      
      Swal.fire({
        icon: 'success',
        title: '¡Cuenta creada con éxito! 🎉',
        text: 'Bienvenida a Glow & Style.',
        background: '#171717',
        color: '#ffffff',
        confirmButtonColor: '#10b981',
        confirmButtonText: 'Ir a la Tienda',
        customClass: {
          popup: 'rounded-2xl border border-neutral-800 shadow-2xl'
        }
      }).then(() => {
        this.router.navigate(['/dashboard']);
      });

    } catch (error: any) {
      console.error(error);
      if (error.code === 'auth/weak-password') {
        Swal.fire({
          icon: 'error',
          title: 'Contraseña débil',
          text: 'La contraseña es demasiado fácil de adivinar.',
          background: '#171717',
          color: '#ffffff',
          confirmButtonColor: '#10b981',
          customClass: {
            popup: 'rounded-2xl border border-neutral-800 shadow-2xl'
          }
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error al registrarse',
          text: 'Ocurrió un problema al crear tu cuenta. Intentá de nuevo.',
          background: '#171717',
          color: '#ffffff',
          confirmButtonColor: '#10b981',
          customClass: {
            popup: 'rounded-2xl border border-neutral-800 shadow-2xl'
          }
        });
      }
    }
  }
}