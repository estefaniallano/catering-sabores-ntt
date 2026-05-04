import { Component } from '@angular/core';

type EventoListadoUi = {
  titulo: string;
  fecha: string;
  ubicacion: string;
  cliente: string;
  comensales: number;
  tipo: string;
  estado: 'Confirmado' | 'En preparación' | 'Cancelado';
  badgeClass: string;
};

@Component({
  selector: 'app-comercial-eventos',
  standalone: false,
  templateUrl: './comercial-eventos.component.html',
  styleUrl: './comercial-eventos.component.scss'
})
export class ComercialEventosComponent {
  eventos: EventoListadoUi[] = [
    {
      titulo: 'Boda · Menú mediterráneo',
      fecha: 'Sáb 18/05 · 13:30',
      ubicacion: 'Finca La Encina (Alcalá)',
      cliente: 'M. García',
      comensales: 120,
      tipo: 'Boda',
      estado: 'Confirmado',
      badgeClass: 'text-bg-success'
    },
    {
      titulo: 'Cocktail empresa · Producto de temporada',
      fecha: 'Mar 21/05 · 19:00',
      ubicacion: 'Centro (Madrid)',
      cliente: 'NTT Data',
      comensales: 80,
      tipo: 'Corporativo',
      estado: 'En preparación',
      badgeClass: 'text-bg-warning'
    },
    {
      titulo: 'Cumpleaños · Menú infantil',
      fecha: 'Dom 26/05 · 14:00',
      ubicacion: 'Domicilio cliente',
      cliente: 'L. Pérez',
      comensales: 25,
      tipo: 'Privado',
      estado: 'Cancelado',
      badgeClass: 'text-bg-secondary'
    },
    {
      titulo: 'Comunión · Menú tradicional',
      fecha: 'Sáb 01/06 · 13:00',
      ubicacion: 'Parroquia San Juan',
      cliente: 'A. Ruiz',
      comensales: 60,
      tipo: 'Comunión',
      estado: 'Confirmado',
      badgeClass: 'text-bg-success'
    }
  ];
}
