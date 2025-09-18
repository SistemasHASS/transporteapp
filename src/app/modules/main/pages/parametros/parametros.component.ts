import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DexieService } from '@/app/shared/dixiedb/dexie-db.service';
import { Configuracion, Vehiculos } from '@/app/shared/interfaces/Tables';
import { MaestrasService } from '../../services/maestras.service';
import { UtilsService } from '@/app/shared/utils/utils.service';
import { AlertService } from '@/app/shared/alertas/alerts.service';
import { Usuario } from '@/app/shared/interfaces/Tables';
import { NgSelectModule } from '@ng-select/ng-select';
import { DropdownComponent } from "../../components/dropdown/dropdown.component";
@Component({
  selector: 'app-parametros',
  standalone: true,
  imports: [FormsModule, CommonModule, NgSelectModule, DropdownComponent],
  templateUrl: './parametros.component.html',
  styleUrls: ['./parametros.component.scss']
})
export class ParametrosComponent {

  constructor(
    private dexieService: DexieService,
    private maestrasService: MaestrasService,
    private utilsService: UtilsService,
    private alertService: AlertService
  ) {}

  configuracion: Configuracion = {
    id: '',
    fechaactual: '',
    idempresa: '',
    idfundo: '',
    placa: '',
    capacidad: 0 
  }

  usuario: Usuario = {
    documentoidentidad: '',
    id: '',
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

  placas: any[] = [];
  empresas: any[] = [];
  fundos: any[] = [];
  horarios: any[] = [];
  vehiculos: Vehiculos[] = [];
  localidades: any[] = [];
  showValidation: boolean = false;

  async ngOnInit() {
    await this.getUsuario()
    await this.validarExisteConfiguracion()
  }

  async getUsuario() {
    const usuario = await this.dexieService.showUsuario();
    if (usuario) { this.usuario = usuario } else { console.log('Error', 'Usuario not found', 'error');}
  }

  async validarExisteConfiguracion() {
    const configuracion = await this.dexieService.obtenerPrimeraConfiguracion();
    if(configuracion) {
      this.configuracion = configuracion;
      await this.llenarDropdowns();
    }
    this.configuracion.fechaactual = this.utilsService.formatDate3(new Date());
  }

  async llenarDropdowns() {
    this.empresas = await this.dexieService.showEmpresas();
    this.fundos = await this.dexieService.showFundos();
    this.vehiculos = await this.dexieService.showVehiculos();
    this.localidades = await this.dexieService.showLocalidades();
  }

  async sincronizarTablasMaestras() {
    try {
      const empresas = await this.maestrasService.getEmpresas([])
      if(!!empresas && empresas.length) { 
        await this.dexieService.saveEmpresas(empresas)
        await this.ListarEmpresas()
        this.alertService.showAlert('¡Éxito!','La operación se completó correctamente','success')
      }
      
      const fundos = this.maestrasService.getFundos([{ idempresa: this.usuario.idempresa }])
      fundos.subscribe(async (resp: any) => {
        if (!!resp && resp.length) {
          await this.dexieService.saveFundos(resp);
          await this.ListarFundos();
        }
      })

      const vehiculos = this.maestrasService.getVehiculos([{ idempresa: this.usuario.idempresa }])
      vehiculos.subscribe(async (resp: any) => {
        if (!!resp.data && resp.data.length) {
          await this.dexieService.saveVehiculos(resp.data);
          await this.ListarVehiculos();
        }
      })

      const localidades = this.maestrasService.getLocalidades([{ idempresa: this.usuario.idempresa }])
      localidades.subscribe(async (resp: any) => {
        if (!!resp.data && resp.data.length) {
          await this.dexieService.saveLocalidades(resp.data);
          await this.ListarLocalidades();
        }
      })

      const trabajadores = this.maestrasService.getTrabajadores([{idempresa: this.usuario?.idempresa}])
      trabajadores.subscribe(
        async (resp: any)=> {
          if(!!resp && resp.length) {
            await this.dexieService.saveTrabajadores(resp)
          }
        }
      );
    } catch (error: any) {
      console.error(error);
      this.alertService.showAlert('Error!', '<p>Ocurrio un error</p><p>' + error + '</p>', 'error');
    }
  }

  async ListarEmpresas() { 
    this.empresas = await this.dexieService.showEmpresas();
    this.configuracion.idempresa = this.empresas.find((empresa: any) => empresa.ruc === this.usuario.ruc)?.ruc || '';
  }
  async ListarFundos() { 
    this.fundos = await this.dexieService.showFundos(); 
    if(this.fundos.length == 1){
      this.configuracion.idfundo = this.fundos[0].codigoFundo;
    } 
  }
  async ListarVehiculos() { this.vehiculos = await this.dexieService.showVehiculos(); }
  async ListarLocalidades() { this.localidades = await this.dexieService.showLocalidades(); }
  
  async guardarConfiguracion() {
    this.showValidation = true;
    if(this.configuracion.idempresa === '' || this.configuracion.idfundo === '' || this.configuracion.placa === '' || this.configuracion.capacidad === 0) {
      this.alertService.showAlert('Advertencia!','Debe seleccionar todos los campos','warning')
    } else {
      this.configuracion.id = this.usuario.ruc+this.usuario.documentoidentidad;
      await this.dexieService.saveConfiguracion(this.configuracion)
      this.alertService.showAlert('¡Éxito!','La operación se completó correctamente','success')
    }
  }
}
