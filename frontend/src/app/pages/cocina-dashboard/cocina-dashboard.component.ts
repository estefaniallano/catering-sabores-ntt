import { Component } from '@angular/core';

type ProduccionFilaUi = {
  evento: string;
  ubicacion: string;
  hora: string;
  comensales: number;
  menu: string;
  estado: 'OK' | 'Atención' | 'Crítico';
  badgeClass: string;
};

@Component({
  selector: 'app-cocina-dashboard',
  standalone: false,
  templateUrl: './cocina-dashboard.component.html',
  styleUrl: './cocina-dashboard.component.scss'
})
export class CocinaDashboardComponent {
  filas: ProduccionFilaUi[] = [
    {
      evento: 'Boda · Menú mediterráneo',
      ubicacion: 'Finca La Encina (Alcalá)',
      hora: '13:30',
      comensales: 120,
      menu: 'Entrantes + Paella + Postre',
      estado: 'OK',
      badgeClass: 'text-bg-success'
    },
    {
      evento: 'Cocktail empresa',
      ubicacion: 'Centro (Madrid)',
      hora: '19:00',
      comensales: 80,
      menu: 'Finger food + Barra bebidas',
      estado: 'Atención',
      badgeClass: 'text-bg-warning'
    },
    {
      evento: 'Comunión',
      ubicacion: 'Parroquia San Juan',
      hora: '13:00',
      comensales: 60,
      menu: 'Menú tradicional',
      estado: 'OK',
      badgeClass: 'text-bg-success'
    },
    {
      evento: 'Evento privado',
      ubicacion: 'Domicilio cliente',
      hora: '14:00',
      comensales: 25,
      menu: 'Menú infantil',
      estado: 'Crítico',
      badgeClass: 'text-bg-danger'
    }
  ];
}
