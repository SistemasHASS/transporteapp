import { Injectable } from '@angular/core';
import { Usuario,Configuracion,Fundo,Cultivo,Vehiculos, Empresa, Localidades, Trabajador,Viaje} from '../interfaces/Tables'
import Dexie from 'dexie';

@Injectable({
  providedIn: 'root'
})

export class DexieService extends Dexie {
  public usuarios!: Dexie.Table<Usuario, string>;
  public configuracion!: Dexie.Table<Configuracion, string>;
  public fundos!: Dexie.Table<Fundo, string>;
  public cultivos!: Dexie.Table<Cultivo, string>;
  public vehiculos!: Dexie.Table<Vehiculos, string>;
  public empresas!: Dexie.Table<Empresa, string>;
  public localidades!: Dexie.Table<Localidades, string>;
  public trabajadores!: Dexie.Table<Trabajador, string>;
  public viajes!: Dexie.Table<Viaje, string>;
  
  constructor() {
    super('Transporte');
    console.log('DexieService Constructor - Base de datos inicializada');
    this.version(1).stores({
      usuarios: `id,sociedad,ruc,razonSocial,idProyecto,proyecto,documentoidentidad,usuario,
      clave,nombre,idrol,rol`,
      configuracion: `id,idfundo,idcultivo,idacopio,fechatareo,idceco,idlabor,fechainiciorefrigerio,
      horainiciorefrigerio,fechafinrefrigerio,horafinrefrigerio,horainiciojornada,idturno`,
      fundos: `id,codigoFundo,empresa,fundo,nombreFundo`,
      cultivos: `id,cultivo,codigo,descripcion,empresa`,
      vehiculos: `id,transportista,codigo,placa,tipo_vehiculo,ruc,capacidad,fvsoat,fvrevisiontecnica,
      fvpermiso,estado,index,transportistaId,tipoVehiculoId,cantMinima,valorAsiento,empresaNombre,idempresa,
      fechaRegistro`,
      empresas: `id,idempresa,ruc,razonsocial,empresa`,
      localidades: `id,idempresa,codigo,nombre,descripcion,estado,index,empresaNombre,fechaRegistro`,
      trabajadores: `id,nombres,apellidopaterno,apellidomaterno,estado,index,empresaNombre,fechaRegistro`,
      viajes: `idviaje,fechahoraactual,horario,idempresa,idfundo,placa,capacidad,idpuntoinicio,idpuntofin,trabajadores`,
    });

    this.usuarios = this.table('usuarios');
    this.configuracion = this.table('configuracion');
    this.fundos = this.table('fundos');
    this.cultivos = this.table('cultivos');
    this.vehiculos = this.table('vehiculos');
    this.empresas = this.table('empresas');
    this.localidades = this.table('localidades');
    this.trabajadores = this.table('trabajadores');
    this.viajes = this.table('viajes');
  }

  async saveUsuario(usuario: Usuario) {await this.usuarios.put(usuario);}
  async saveUsuarios(usuarios: Usuario[]) {await this.usuarios.bulkPut(usuarios);}
  async showUsuario() {return await this.usuarios.toCollection().first()}
  async clearUsuario() {await this.usuarios.clear();}
  //
  async saveConfiguracion(configuracion: Configuracion) { await this.configuracion.put(configuracion); }
  async obtenerConfiguracion() {return await this.configuracion.toArray();} 
  async obtenerPrimeraConfiguracion() { return await this.configuracion.toCollection().first(); }
  async clearConfiguracion() {await this.configuracion.clear();}
  //
  async saveEmpresa(empresa: Empresa) {await this.empresas.put(empresa);}
  async saveEmpresas(empresas: Empresa[]) {await this.empresas.bulkPut(empresas);}
  async showEmpresas() {return await this.empresas.orderBy('razonsocial').toArray();}
  async showEmpresaById(id: string) {return await this.empresas.where('id').equals(id).first()}
  async clearEmpresas() {await this.empresas.clear();}
  //
  async saveVehiculo(vehiculo: Vehiculos) {await this.vehiculos.put(vehiculo);}
  async saveVehiculos(vehiculos: Vehiculos[]) {await this.vehiculos.bulkPut(vehiculos);}
  async showVehiculos() {return await this.vehiculos.toArray();}
  async showVehiculoById(id: string) {return await this.vehiculos.where('id').equals(id).first()}
  async clearVehiculos() {await this.vehiculos.clear();}
  //
  async saveFundo(fundo: Fundo) {await this.fundos.put(fundo);}
  async saveFundos(fundos: Fundo[]) {await this.fundos.bulkPut(fundos);}
  async showFundos() {return await this.fundos.toArray();}
  async showFundoById(id: string) {return await this.fundos.where('id').equals(id).first()}
  async clearFundos() {await this.fundos.clear();}
  //
  async saveCultivo(cultivo: Cultivo) {await this.cultivos.put(cultivo);}  
  async saveCultivos(cultivos: Cultivo[]) {await this.cultivos.bulkPut(cultivos);}
  async showCultivos() {return await this.cultivos.toArray();}
  async showCultivoById(id: string) {return await this.cultivos.where('id').equals(id).first()}
  async clearCultivos() {await this.cultivos.clear();}
  //
  async saveLocalidad(localidad: Localidades) {await this.localidades.put(localidad);}
  async saveLocalidades(localidades: Localidades[]) {await this.localidades.bulkPut(localidades);}
  async showLocalidades() {return await this.localidades.toArray();}
  async showLocalidadById(id: string) {return await this.localidades.where('id').equals(id).first()}
  async clearLocalidades() {await this.localidades.clear();}
  //
  async saveTrabajadores(params: Trabajador[]) {await this.trabajadores.bulkPut(params);}
  async saveTrabajador(params: Trabajador) {await this.trabajadores.put(params);}
  async showTrabajadorById(id: any) { return await this.trabajadores.where('id').equals(id).first(); }
  async showTrabajadores() { return await this.trabajadores.toArray(); }
  async deleteTrabajador(id: any) { return await this.trabajadores.where('id').equals(id).delete(); }
  async clearTrabajadores() {await this.trabajadores.clear();}
  //
  async saveViaje(viaje: Viaje) {await this.viajes.put(viaje);}
  async saveViajes(viajes: Viaje[]) {await this.viajes.bulkPut(viajes);}
  async showViajes() {return await this.viajes.toArray();}
  async showViajeById(id: string) {return await this.viajes.where('id').equals(id).first()}
  async clearViajes() {await this.viajes.clear();}
  //
  async clearMaestras() {
    await this.clearFundos();
    await this.clearCultivos();
    await this.clearEmpresas();
    await this.clearVehiculos();
    await this.clearLocalidades();
    await this.clearTrabajadores();
    await this.clearViajes();
    console.log('Todas las tablas de configuracion han sido limpiadas en indexedDB.');
  }
  

}