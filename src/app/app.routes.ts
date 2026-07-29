import { Routes } from '@angular/router';
import { LoginComponent } from './login/login';
import { DashboardComponent } from './components/dashboard/dashboard';
import { RegistroComponent } from './components/registro/registro';
import { CheckoutComponent } from './components/checkout/checkout';
import { authGuard } from './guards/auth-guard';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'registro', component: RegistroComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'checkout', component: CheckoutComponent, canActivate: [authGuard] }
];