import { Routes } from '@angular/router';
import { LoginComponent } from './login/login';
// Asegúrate de importar tu componente del dashboard. 
// Si está en 'components/dashboard/dashboard.component', ajusta la ruta:
import { DashboardComponent } from './components/dashboard/dashboard';
import { RegistroComponent } from './components/registro/registro';

export const routes: Routes = [
  { path: '', component: DashboardComponent }, // Ahora carga la página principal primero
  { path: 'login', component: LoginComponent },
  { path: 'registro', component: RegistroComponent },
  { path: 'dashboard', component: DashboardComponent }
];
