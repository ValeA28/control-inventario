import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { routes } from './app.routes';

// Importaciones de Firebase
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';

import { getAuth, provideAuth } from '@angular/fire/auth';
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    // Firebase configurado
    provideFirebaseApp(() => {
      console.log("Configuración Firebase cargada:", environment.firebaseConfig);
      return initializeApp(environment.firebaseConfig);
    }),
    provideAuth(() => getAuth())
  ]
};