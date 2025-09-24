import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DexieService } from 'src/app/shared/dixiedb/dexie-db.service';
import { ReporteService } from '../../services/reporte.service';
import moment from 'moment';
import * as XLSX from 'xlsx-js-style';
import FileSaver from 'file-saver';
import { AlertService } from '@/app/shared/alertas/alerts.service';
import pdfMake from 'pdfmake/build/pdfmake';
import 'pdfmake/build/vfs_fonts';
import { Usuario, Viaje } from '@/app/shared/interfaces/Tables';
import { TableModule } from 'primeng/table';
import { CheckboxModule } from 'primeng/checkbox';
import { UtilsService } from '@/app/shared/utils/utils.service';
import { BarcodeFormat } from '@zxing/library';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { Modal } from 'bootstrap';
import { ViewChild } from '@angular/core';
import { ElementRef } from '@angular/core';
import { TransporteService } from '../../services/transporte.service';
@Component({
  selector: 'app-aprobaciones-viajes',
  imports: [CommonModule, FormsModule, TableModule, CheckboxModule, ZXingScannerModule],
  templateUrl: './aprobaciones-viajes.component.html',
  styleUrl: './aprobaciones-viajes.component.scss'
})
export class AprobacionesViajesComponent {

  @ViewChild('camaraPlanilla') modalCamara!: ElementRef;
  modalCamaraInstance!: Modal;

  enableScanner: boolean = false;
  currentDevice: MediaDeviceInfo | undefined;
  formatsEnabled: BarcodeFormat[] = [BarcodeFormat.QR_CODE];
  searchTerm: string = '';
  data : any = [];
  columns: any = [];
  body: any = [];
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

  viaje: Viaje = {
    idviaje: '',
    ruc: '',
    conductor: '',
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
    estado: 0,
    aprobado: 0,
    usuario_registro: ''
  }

  fdesde: any;
  fhasta: any;
  activeTab = 'home'; 
  viajes: any[] = [];
  selectedViajes: any[] = [];

  constructor(
    private dexieService: DexieService,
    private reporteService: ReporteService,
    private alertService: AlertService,
    private utilsService: UtilsService,
    private transporteService: TransporteService
  ) { }

  clearViaje() {
    this.viaje = {
      idviaje: '',
      ruc: '',
      conductor: '',
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
      estado: 0,
      aprobado: 0,
      usuario_registro: ''
    }
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  ngAfterViewInit(): void {
    this.modalCamaraInstance = new Modal(this.modalCamara.nativeElement);
  }

  async ngOnInit() {
    const usuario = await this.dexieService.showUsuario();
    if (usuario) {
      this.usuario = usuario;
    }
    await this.ListarViajes();
  }

  onRowSelect(event: any) {
    console.log("Postulante seleccionado:", event.data, this.selectedViajes);
  }

  formatoHora(hora: string) {
    return this.utilsService.formatoTotalMinutosSegundos(hora);
  }

  openApp() {
    this.enableScanner = true
    this.modalCamaraInstance.show();
  }

  closeModalCamara(): void {
    this.enableScanner = false
    this.modalCamaraInstance.hide();
  }

  async onCodeResult(result: any ='') {
    this.searchTerm = result;
    this.closeModalCamara()
    if(!!this.searchTerm) {
      this.clearViaje();
      this.viaje.idviaje = this.searchTerm;
      await this.dexieService.saveViajeAprobado(this.viaje);
      await this.validarViajesRemotos();
      await this.ListarViajes();
    }
  }

  async validarViajesRemotos() {
    const viajes = await this.dexieService.showViajesAprobados();
    for (const viaje of viajes) {
      if (this.isSoloIdViaje(viaje)) {
        const viajeRemoto = await this.reporteService.getViajeById([{idviaje: viaje.idviaje}]);
        if(viajeRemoto.length > 0) {
          viajeRemoto[0].usuario_registro = this.usuario.usuario;
          await this.dexieService.saveViajeAprobado(viajeRemoto[0]);
        }
      }
    }
  }

  private isSoloIdViaje(viaje: any): boolean {
    if (!viaje.idviaje) {
      return false;
    }
    for (const key of Object.keys(viaje)) {
      if (key === 'idviaje' || key === 'trabajadores') continue;
      const value = viaje[key];
      if (value !== null && value !== '' && value !== 0 && value !== undefined) {
        return false;
      }
    }
    return true;
  }

  async ListarViajes() {
    this.viajes = await this.dexieService.showViajesAprobados();
  }

  onCamerasFound(devices: MediaDeviceInfo[]) {
    if (devices.length > 0) {
      this.currentDevice = devices.find(device => /back|rear|environment/i.test(device.label)) || devices[0];
    }
  }

  onCamerasNotFound() {
    console.error('No se encontraron cámaras.');
  }

  onScanError(error: any) {
    console.error('Error de escaneo:', error);
  }

  async rechazarViaje() {
    if(this.selectedViajes.length == 0) {
      this.alertService.showAlert('Alerta!','No hay viajes seleccionados','warning');
      return;
    }
    const confirmacion = await this.alertService.showConfirm('Confirmación', '¿Está seguro de rechazar los viajes?','warning');
    if (confirmacion) {
      if(this.selectedViajes.length > 0) {
        for (const viaje of this.selectedViajes) {
          await this.dexieService.updateAprobadoViajeAprobado(viaje.idviaje, 0);
        }
        await this.ListarViajes();
      }
    }
  }

  async aprobarViaje() {
    if(this.selectedViajes.length == 0) {
      this.alertService.showAlert('Alerta!','No hay viajes seleccionados','warning');
      return;
    }
    const confirmacion = await this.alertService.showConfirm('Confirmación', '¿Está seguro de aprobar los viajes?','warning');
    if (confirmacion) {
      if(this.selectedViajes.length > 0) {
        for (const viaje of this.selectedViajes) {
          await this.dexieService.updateAprobadoViajeAprobado(viaje.idviaje, 1);
          await this.dexieService.updateViajeAprobadoSincronizado(viaje.idviaje, 0);
        }
        await this.ListarViajes();
      }
    }
  }

  async sincronizarViajes() {
    const viajes = await this.dexieService.showViajesAprobados();
    const viajessincronizados = viajes.filter(v => v.estado == 0);
    if(viajessincronizados.length==0) {
      this.alertService.showAlert('Alerta!','No hay viajes para sincronizar','warning');
      return;
    }
    const confirmacion = await this.alertService.showConfirm('Confirmación', '¿Está seguro de sincronizar los viajes?','warning');
    if (confirmacion) {
      console.log('sinc: ',viajessincronizados);
      const resultado = await this.transporteService.enviarViajes(viajessincronizados)
      console.log('resultado: ',resultado);
      if(!!resultado && resultado.length>0) {
        if (resultado[0].errorgeneral == 0) {
          for (const v of viajessincronizados) {
            await this.dexieService.updateViajeAprobadoSincronizado(v.idviaje, 1);
          }
          await this.ListarViajes();
          this.alertService.showAlert('¡Éxito!','Sincronización correcta','success');
        }
        if (resultado[0].errorgeneral == -1) {
          this.alertService.showAlert('¡Error!','Error al sincronizar los viajes','error');
        }
        if (resultado[0].errorgeneral == 1) {
          const errores = resultado[0].detalle.map((d: any) => d.id);
          for (const v of viajessincronizados) {
            if (!errores.includes(v.idviaje)) {
              await this.dexieService.updateViajeAprobadoSincronizado(v.idviaje, 1);
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

  async eliminarViaje(viaje: any) {
    const confirmacion = await this.alertService.showConfirm(
      'Confirmación',
      '¿Está seguro de eliminar el viaje?',
      'warning'
    );
    if(confirmacion) {
      this.dexieService.updateEliminadoViajeAprobado(viaje.idviaje,1);
      this.ListarViajes();
    }
  }

}
