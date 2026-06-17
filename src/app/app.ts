import { Component } from '@angular/core';
import { DashboardComponent } from './components/dashboard/dashboard'; // <-- IMPORTAMOS EL DASHBOARD

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [DashboardComponent], 
  templateUrl: './app.html',    
  styleUrl: './app.css'          
})
export class AppComponent {
  title = 'control-inventario';
}
