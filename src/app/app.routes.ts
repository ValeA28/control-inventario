import { Routes } from '@angular/router';
import { LoginComponent } from './login/login';
// Asegúrate de importar tu componente del dashboard. 
// Si está en 'components/dashboard/dashboard.component', ajusta la ruta:
import { DashboardComponent } from './components/dashboard/dashboard';
import { RegistroComponent } from './components/registro/registro';
import { CheckoutComponent } from './components/checkout/checkout';
import { authGuard } from './guards/auth-guard';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'registro', component: RegistroComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'checkout', component: CheckoutComponent }
];
