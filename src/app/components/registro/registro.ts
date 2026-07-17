import { Component, inject } from '@angular/core';
import { Auth, createUserWithEmailAndPassword } from '@angular/fire/auth'; // Asegúrate de tener esta importación
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './registro.html'
})
export class RegistroComponent {
  private auth = inject(Auth);
  private router = inject(Router);
  
  email = '';
  password = '';

  async registrarse() {
    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, this.email, this.password);
      // Aquí asignamos el rol de cliente al usuario recién creado
      localStorage.setItem('usuarioRol', 'cliente'); 
      console.log('Usuario registrado:', userCredential.user);
      this.router.navigate(['/dashboard']);
    } catch (error) {
      console.error('Error al registrarse:', error);
      alert('Hubo un error al registrarte. Intenta de nuevo.');
    }
  }
}
