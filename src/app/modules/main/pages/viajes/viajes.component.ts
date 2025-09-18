import { Component } from '@angular/core';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-viajes',
  templateUrl: './viajes.component.html',
  imports: [TableModule],
  standalone: true,
  styleUrl: './viajes.component.scss'
})
export class ViajesComponent {

  constructor() { }

  viajes: any[] = [];
  selectedViajes: any[] = [];

  onRowSelect(event: any) {
    console.log("Postulante seleccionado:", event.data, this.selectedViajes);
  }
  
  nuevoViaje() {
    console.log("Nuevo viaje");
  }
}
