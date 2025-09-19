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
import { TransporteService } from '../../services/transporte.service';

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

  @ViewChild('modalCantidad') modalCantidad!: ElementRef;
  modalCantidadInstance!: Modal;
  
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
    ruc: '',
    fecharegistro: '',
    horario: '',
    idempresa: '',
    idfundo: '',
    placa: '',
    capacidad: 0,
    cantidad: 0,
    idpuntoinicio: '',
    idpuntofin: '',
    trabajadores: [],
    eliminado: 0,
    cerrado: 0,
    grupo: 0,
    estado: 0
  }
  localidades: any[] = [];
  dni: string = '';
  trabajadoresActivos: any[] = [];


  constructor(private dixiService: DexieService, 
    private alertService: AlertService, 
    private utilsService: UtilsService, 
    private transporteService: TransporteService) 
  { }

  ngAfterViewInit(): void {
    this.modalViajeInstance = new Modal(this.modalViaje.nativeElement);
    this.modalCantidadInstance = new Modal(this.modalCantidad.nativeElement);
  }

  async ngOnInit() {
    this.getUsuario();
    this.getConfiguracion();
    this.getVehiculos();
    this.getLocalidades();
    this.getTrabajadoresActivos();
    this.validarViajeAbierto();
    await this.ListarViajes();
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
    this.localidades = localidades.filter(l => l.idempresa == this.usuario.idempresa);
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
      ruc: '',
      fecharegistro: '',
      horario: '',
      idempresa: '',
      idfundo: '',
      placa: '',
      capacidad: 0,
      cantidad: 0,
      idpuntoinicio: '',
      idpuntofin: '',
      trabajadores: [],
      eliminado: 0,
      cerrado: 0,
      grupo: 0,
      estado: 0 
    }
  }

  async sincronizarViajes() {
    const viajes = await this.dixiService.showViajes();
    const viajescerrados = viajes.filter(v => v.cerrado == 1);
    if(viajescerrados.length==0) {
      this.alertService.showAlert('Alerta!','No hay viajes cerrados para sincronizar','warning');
      return;
    }
    const confirmacion = await this.alertService.showConfirm('Confirmación', '¿Está seguro de sincronizar los viajes?','warning');
    if (confirmacion) {
      console.log('sinc: ', viajescerrados)
      const resultado = await this.transporteService.enviarViajes(viajescerrados)
      console.log('resultado: ', resultado)
      if(!!resultado && resultado.length>0) {
        if (resultado[0].errorgeneral == 0) {
          // Todos correctos
          for (const v of viajescerrados) {
            await this.dixiService.updateViajeSincronizado(v.idviaje, 1);
          }
          await this.ListarViajes();
          this.alertService.showAlert('¡Éxito!','Sincronización correcta','success');
        }
        if (resultado[0].errorgeneral == -1) {
          this.alertService.showAlert('¡Error!','Error al sincronizar los viajes','error');
        }
        if (resultado[0].errorgeneral == 1) {
          const errores = resultado[0].detalle.map((d: any) => d.id);
          for (const v of viajescerrados) {
            if (!errores.includes(v.idviaje)) {
              await this.dixiService.updateViajeSincronizado(v.idviaje, 1);
            }
          }
          await this.ListarViajes();
          const erroresmensaje = resultado[0].detalle;
          const listaErrores = erroresmensaje
            .map((e: any) => `<li><b>${e.id}</b>: ${e.error}</li>`)
            .join('');

          const html = `
            <h1 class="text-danger" style="font-size: 16px;">Error!</h1>
            <br>
            <span>Ocurrió un error al migrar los datos</span>
            <ul style="text-align:left; margin-top:10px;">
              ${listaErrores}
            </ul>
          `;

          this.alertService.showAlertAcept('¡Atención!', html, 'warning');
        }        
      } else {
        this.alertService.showAlert('¡Error!','Error al sincronizar los viajes','error')
      }
    }
  }

  crearFormatoEnvio(viajes: any[]) {
    return   
  }

  async cancelarViaje() {
    await this.ListarViajes();
    this.viajenuevo = false;
  }

  async guardarViaje() {
    this.modalCantidadInstance.hide();
    const confirmacion = await this.alertService.showConfirm('Confirmación', '¿Está seguro de guardar el viaje?','warning');
    if (confirmacion) {
      this.viaje.cerrado = 1;
      this.dixiService.saveViaje(this.viaje);
      this.viajenuevo = false;
      this.ListarViajes();
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
            fecharegistro: this.utilsService.formatDateSec(),
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
            fecharegistro: this.utilsService.formatDateSec(),
            eliminado: 0
          }
        ];
        if (mostrarNotificacion) this.alertService.showAlert('Alerta!','Trabajador agregado como NUEVO','success');
      }
      this.viaje.cantidad = this.viaje.trabajadores.length;
      await this.dixiService.saveViaje(this.viaje);
    }
    this.dni = '';
  }

  async eliminarPersona(persona: any) {
    const confirmacion = await this.alertService.showConfirm('Confirmación', '¿Está seguro de eliminar la persona?','warning');
    if (confirmacion) {
      const trabajador = this.viaje.trabajadores.find(
        (t: any) => t.nrodocumento === persona.nrodocumento
      );
      if (trabajador) {
        trabajador.eliminado = 1;
        this.viaje.cantidad = +this.viaje.cantidad-1;
        await this.dixiService.saveViaje(this.viaje);
        this.alertService.showAlert('Alerta!','Persona eliminada correctamente','success');
      } else {
        this.alertService.showAlert('Alerta!','No se encontró al trabajador en el viaje','error');
      }
    }
  }
  

  closeModalViaje() {
    this.modalViajeInstance.hide();
  }

  async crearViaje() {
    this.modalViajeInstance.hide();
    const horaActual = new Date().getHours();
    const esNoche = horaActual >= 19 || (horaActual >= 0 && horaActual < 6);
    this.viaje.idviaje = this.usuario.ruc+this.usuario.documentoidentidad+this.configuracion.placa+this.utilsService.formatoAnioMesDiaHoraMinSec();
    this.viaje.ruc = this.usuario.ruc;
    this.viaje.horario = esNoche ? 'Noche' : 'Dia';
    this.viaje.idempresa = this.configuracion.idempresa;
    this.viaje.idfundo = this.configuracion.idfundo;
    this.viaje.placa = this.configuracion.placa;
    this.viaje.capacidad = this.configuracion.capacidad;
    this.viaje.cantidad = this.viaje.trabajadores.length;
    this.viaje.fecharegistro = this.utilsService.formatDateSec();
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
    console.log('Editar viaje: ',this.viaje);
    this.viajenuevo = true;
  }

  toggleScanner() {
    try {
      const camaraBridge = (window as any).CamaraBridge;
      if (camaraBridge && typeof camaraBridge.leerDnis === "function") {
        console.log("Llamando a CamaraBridge.leerDnis() desde WebView...");
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

  async validarCantidad() {
    if(this.viaje.trabajadores.length==0){
      this.modalCantidadInstance.show();
    } else {
      this.guardarViaje();
    }
  }

  closeModalCantidad() {
    this.modalCantidadInstance.hide();
  }

  async unirViajes() {
    const confirmacion = await this.alertService.showConfirm(
      'Confirmación',
      '¿Está seguro de unir el viaje?',
      'warning'
    );
    if (confirmacion) {
      const maxGrupo = Math.max(...this.viajes.map(v => v.grupo), 0);
      const nuevoGrupo = maxGrupo + 1;
      this.selectedViajes.forEach(viaje => {
        viaje.grupo = nuevoGrupo;
        this.dixiService.saveViaje(viaje);
      });
      this.alertService.showAlert('Alerta!','Viajes unidos correctamente','success');
      this.selectedViajes.length=0;
      this.ListarViajes();
    }
  }

  liberarViaje() {
    const gruposALiberar = [...new Set(this.selectedViajes.map(v => v.grupo))];
    this.viajes.forEach(viaje => {
      if (gruposALiberar.includes(viaje.grupo)) {
        viaje.grupo = 0;
        this.dixiService.saveViaje(viaje);
      }
    });
    this.alertService.showAlert('Alerta!','Viajes liberados correctamente','success');
    this.selectedViajes.length=0;
    this.ListarViajes();
  }
  
  obtenerCantidadGrupos(): number {
    const grupos = [...new Set(this.viajes.map(v => v.grupo).filter(g => g > 0))];
    return grupos.length;
  }

  get personas() {
    return this.viaje.trabajadores.filter(t => t.eliminado === 0);
  }

  async eliminarViaje(viaje: any) {
    const confirmacion = await this.alertService.showConfirm(
      'Confirmación',
      '¿Está seguro de eliminar el viaje?',
      'warning'
    );
    if(confirmacion) {
      this.dixiService.updateEliminadoViaje(viaje.idviaje,1);
      this.ListarViajes();
    }
  }
  
}
