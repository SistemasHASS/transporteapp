import { Component, ViewChild, ElementRef } from '@angular/core';
import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { DropdownComponent } from "../../components/dropdown/dropdown.component";
import { Configuracion, Usuario, Vehiculos, Viaje } from '@/app/shared/interfaces/Tables';
import { DexieService } from '@/app/shared/dixiedb/dexie-db.service';
import { FormsModule } from '@angular/forms';
import { AlertService } from '@/app/shared/alertas/alerts.service';
import { Modal } from 'bootstrap';
import { UtilsService } from '@/app/shared/utils/utils.service';
import { CheckboxModule } from 'primeng/checkbox';

@Component({
  selector: 'app-viajes',
  templateUrl: './viajes.component.html',
  imports: [TableModule, CommonModule, DropdownComponent, FormsModule, CheckboxModule],
  standalone: true,
  styleUrl: './viajes.component.scss'
})
export class ViajesComponent {

  @ViewChild('modalViaje') modalViaje!: ElementRef;
  modalViajeInstance!: Modal;
  
  viajes: any[] = [];
  selectedViajes: any[] = [];
  viajenuevo: boolean = false;
  usuario: Usuario = {
    id: '',
    documentoidentidad: '',
    idproyecto: '',
    idrol: '',
    nombre: '',
    proyecto: '',
    razonSocial: '',
    rol: '',
    ruc: '',
    sociedad: 0,
    usuario: '',
    idempresa: ''
  }
  configuracion: Configuracion = {
    id: '',
    fechaactual: '',
    idempresa: '',
    idfundo: '',
    placa: '',
    capacidad: 0 
  }
  vehiculos: Vehiculos[] = [];
  showValidation: boolean = false;
  viaje: Viaje = {
    idviaje: '',
    fechahoraactual: '',
    horario: '',
    idempresa: '',
    idfundo: '',
    placa: '',
    capacidad: 0,
    idpuntoinicio: '',
    idpuntofin: '',
    trabajadores: [],
    eliminado: 0,
    cerrado: 0,
    grupo: 0 
  }
  localidades: any[] = [];
  dni: string = '';
  trabajadoresActivos: any[] = [];


  constructor(private dixiService: DexieService, private alertService: AlertService, private utilsService: UtilsService) { }

  ngAfterViewInit(): void {
    this.modalViajeInstance = new Modal(this.modalViaje.nativeElement);
  }

  ngOnInit(): void {
    this.getUsuario();
    this.getConfiguracion();
    this.getVehiculos();
    this.getLocalidades();
    this.getTrabajadoresActivos();
    this.validarViajeAbierto();
    this.ListarViajes();
  }

  async validarViajeAbierto() {
    const viajes = await this.dixiService.showViajes();
    const viajesAbiertos = viajes.filter(v => v.cerrado === 0);
    if (viajesAbiertos.length > 0) {
      this.viajenuevo = true;
      this.viaje = viajesAbiertos[0];
    }
  }

  async getUsuario() {
    const usuario = await this.dixiService.showUsuario();
    if (usuario) { this.usuario = usuario }
  }

  async getConfiguracion() {
    const configuracion = await this.dixiService.obtenerPrimeraConfiguracion();
    if (configuracion) { this.configuracion = configuracion }
  }

  async ListarViajes() {
    const viajes = await this.dixiService.showViajes();
    this.viajes = viajes;
  }

  getVehiculos() {
    console.log("Obteniendo vehiculos");
  }

  async getLocalidades() {
    const localidades = await this.dixiService.localidades.toArray();
    this.localidades = localidades;
  }

  async getTrabajadoresActivos() {
    const trabajadoresActivos = await this.dixiService.showTrabajadores();
    this.trabajadoresActivos = trabajadoresActivos;
  }

  onRowSelect(event: any) {
    console.log("Postulante seleccionado:", event.data, this.selectedViajes);
  }
  
  nuevoViaje() {
    this.clearViaje()
    this.modalViajeInstance.show();
  }

  clearViaje() {
    this.viaje = {
      idviaje: '',
      fechahoraactual: '',
      horario: '',
      idempresa: '',
      idfundo: '',
      placa: '',
      capacidad: 0,
      idpuntoinicio: '',
      idpuntofin: '',
      trabajadores: [],
      eliminado: 0,
      cerrado: 0,
      grupo: 0 
    }
  }

  sincronizarViajes() {
    console.log("Sincronizar viajes");
  }

  cancelarViaje() {
    this.viajenuevo = false;
  }

  async guardarViaje() {
    const confirmacion = await this.alertService.showConfirm('Confirmación', '¿Está seguro de guardar el viaje?','warning');
    if (confirmacion) {
      this.viaje.cerrado = 1;
      this.dixiService.saveViaje(this.viaje);
      this.viajenuevo = false;
      this.alertService.showAlert('Alerta!','Viaje guardado correctamente','success');
    }
  }

  private esCapacidadMaximaAlcanzada(): boolean {
    const cantidadActual = this.viaje.trabajadores.length;
    const capacidad = this.configuracion.capacidad;
    if (cantidadActual > capacidad) {
      return true;
    }
    return false;
  }

  async agregarPersona(mostrarNotificacion:boolean = true) {
    if (this.esCapacidadMaximaAlcanzada()) {
      this.alertService.showAlert('Alerta!','Capacidad máxima alcanzada','error');
      return;
    }
    if (!/^\d+$/.test(this.dni)) {
      if (mostrarNotificacion) this.alertService.showAlert('Alerta!','El Nro Documento debe contener solo dígitos numéricos','error');
      return;
    }
    if (this.dni.length < 8 || this.dni.length > 12) {
      if (mostrarNotificacion) this.alertService.showAlert('Alerta!','El Nro Documento debe contener entre 8 y 12 dígitos numéricos','error');
      return;
    }

    const trabajadorExistente = this.viaje.trabajadores.find(t => t.nrodocumento == this.dni);
    if (!trabajadorExistente) {
      const trabajador = this.trabajadoresActivos.find(t => String(t.nrodocumento).trim() === String(this.dni).trim());
      if (trabajador) {
        this.viaje.trabajadores = [
          ...this.viaje.trabajadores,
          {
            ruc: trabajador.ruc,
            nrodocumento: trabajador.nrodocumento,
            nombre: trabajador.nombre,
            hora: this.utilsService.formatDateSec(),
            eliminado: 0
          }
        ];
        if (mostrarNotificacion) { this.alertService.showAlert('Alerta!','Trabajador agregado correctamente','success');}
      } else {
        this.viaje.trabajadores = [
          ...this.viaje.trabajadores,
          {
            ruc: this.usuario.ruc,
            nrodocumento: this.dni,
            nombre: 'Registro Observado',
            hora: this.utilsService.formatDateSec(),
            eliminado: 0
          }
        ];
        if (mostrarNotificacion) this.alertService.showAlert('Alerta!','Trabajador agregado como NUEVO','success');
      }
      this.viaje.capacidad = this.viaje.trabajadores.length;
      await this.dixiService.saveViaje(this.viaje);
    }
    this.dni = '';
  }

  eliminarPersona(persona: any) {
    console.log("Eliminar persona", persona);
  }

  closeModalViaje() {
    this.modalViajeInstance.hide();
  }

  async crearViaje() {
    this.modalViajeInstance.hide();
    const horaActual = new Date().getHours();
    const esNoche = horaActual >= 19 || (horaActual >= 0 && horaActual < 6);
    this.viaje.idviaje = this.usuario.ruc+this.usuario.documentoidentidad+this.utilsService.formatoAnioMesDiaHoraMinSec();
    this.viaje.horario = esNoche ? 'Noche' : 'Dia';
    this.viaje.idempresa = this.configuracion.idempresa;
    this.viaje.idfundo = this.configuracion.idfundo;
    this.viaje.placa = this.configuracion.placa;
    this.viaje.capacidad = this.viaje.trabajadores.length;
    this.viaje.fechahoraactual = this.utilsService.formatDateSec();
    this.viaje.eliminado = 0;
    this.viaje.cerrado = 0;
    this.viaje.grupo = 0;
    await this.dixiService.saveViaje(this.viaje);
    this.viajenuevo = true;
  }

  formatoHora(hora: string) {
    return this.utilsService.formatoTotalMinutosSegundos(hora);
  }

  editarViaje(viaje: any) {
    this.viaje = viaje;
    this.viajenuevo = true;
  }

  toggleScanner() {
    try {
      const camaraBridge = (window as any).CamaraBridge;
  
      if (camaraBridge && typeof camaraBridge.leerDnis === "function") {
        console.log("📲 Llamando a CamaraBridge.leerDnis() desde WebView...");
        (window as any).onDniLeido = async (codigo: string) => {
          this.dni = codigo;
          await this.agregarPersona(false);
        };
        camaraBridge.leerDnis();
      } else {
        this.alertService.showAlert('Alerta!','CamaraBridge no está disponible','error');
      }
    } catch (error) {
      this.alertService.showAlert('Alerta!','Error al leer el DNI','error');
    }
  }
}
