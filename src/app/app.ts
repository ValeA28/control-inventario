import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/header/header'; // <--- 1. Importa el archivo

@Component({
  selector: 'app-root',
  standalone: true,
  // 2. Agrega HeaderComponent aquí:
  imports: [RouterOutlet, HeaderComponent], 
  templateUrl: './app.html'
})
export class AppComponent {
  title = 'control-inventario';
}