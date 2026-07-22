import { Injectable, signal } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface Resena {
  id?: string;
  usuarioEmail: string;
  calificacion: number;
  comentario: string;
  fecha: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private STORAGE_KEY = 'resenas_tienda_glow';

  // Reseñas de ejemplo por defecto para que la pantalla no se vea vacía
  private resenasIniciales: Resena[] = [
    {
      usuarioEmail: 'camila@email.com',
      calificacion: 5,
      comentario: '¡Excelente calidad de las prendas! La remera me llegó super rápido.',
      fecha: '15/07/2026'
    },
    {
      usuarioEmail: 'sofia.m@email.com',
      calificacion: 4,
      comentario: 'Hermosas las camperas, muy buena atención.',
      fecha: '18/07/2026'
    }
  ];

  constructor() {
    // Si no hay reseñas guardadas en el navegador, guardamos las de prueba
    if (!localStorage.getItem(this.STORAGE_KEY)) {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.resenasIniciales));
    }
  }

  // Obtener todas las opiniones guardadas localmente
  getResenas(): Observable<Resena[]> {
    const data = localStorage.getItem(this.STORAGE_KEY);
    const lista: Resena[] = data ? JSON.parse(data) : [];
    return of(lista); // Retornamos un Observable simulado
  }

  // Guardar una nueva reseña en localStorage
  async agregarResena(resena: Resena): Promise<void> {
    const data = localStorage.getItem(this.STORAGE_KEY);
    const lista: Resena[] = data ? JSON.parse(data) : [];
    
    // Agregamos la nueva reseña al principio de la lista
    lista.unshift(resena);
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(lista));
  }
}