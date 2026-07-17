import { Component, inject } from '@angular/core'; // Añadimos inject
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth, signInWithEmailAndPassword } from '@angular/fire/auth'; // Añadimos esto
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html', // Asegúrate de que coincida con el nombre de tu archivo html
  styleUrls: ['./login.css']
})
export class LoginComponent {
  email = '';
  password = '';

  // Inyectamos Auth y Router
  private auth = inject(Auth);
  private router = inject(Router);

  // Convertimos a async porque la comunicación con Firebase toma un instante
  async iniciarSesion() {
  try {
    await signInWithEmailAndPassword(this.auth, this.email, this.password);
    
    // --- AGREGA ESTAS LÍNEAS AQUÍ ---
    localStorage.setItem('usuarioRol', 'admin'); // O 'invitado', según corresponda
    // --------------------------------
    
    console.log('¡Sesión iniciada correctamente!');
    this.router.navigate(['/dashboard']); 
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    alert('Email o contraseña incorrectos');
  }
}
}
