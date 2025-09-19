
export interface Usuario {
    id: string;
    documentoidentidad: string;
    idproyecto: string;
    idrol: string;
    nombre: string;
    proyecto: string;
    razonSocial: string;
    rol: string;
    ruc: string;
    sociedad: number;
    usuario: string;
    idempresa: string;
}
export interface Configuracion {
    id: string
    fechaactual: string
    idempresa: string
    idfundo: string
    placa: string
    capacidad: number
}
export interface Empresa {
    id: string;
    idempresa: string;
    ruc: string;
    razonsocial: string;
    empresa: number;
}
export interface Localidades {
    id: string;
    codigo: string;
    nombre: string;
    descripcion: string;
    estado: number;
    index?: number;
    idempresa: string;
    empresaNombre?: string;
    fechaRegistro: string;
}
export interface Fundo {
    id: string;
    fundo: number;
    empresa: number;
    codigoFundo: string;
    nombreFundo: string
}
export interface Cultivo {
    id: string;
    empresa: number;
    codigo: string;
    descripcion: string;
}
export interface Vehiculos {
    id: string;
    transportista: string;
    codigo: string;
    placa: string;
    tipo_vehiculo: number;
    ruc: string;
    capacidad: number;
    fvsoat: string;
    fvrevisiontecnica: string;
    fvpermiso: string;
    estado: number;
    index?: number;
    transportistaId: number;
    tipoVehiculoId: number;
    cantMinima: number;
    valorAsiento: number;
    empresaNombre: string;
    idempresa: string;
    fechaRegistro: string;
}
export interface Viaje {
    idviaje: string;
    fechahoraactual: string;
    horario: string;
    idempresa: string;
    idfundo: string;
    placa: string;
    capacidad: number;
    idpuntoinicio: string;
    idpuntofin: string;
    trabajadores: any[];
    eliminado: number;
    cerrado: number;
    grupo: number;
    estado: number;
}

export interface Trabajador {
    id: string
    ruc: string
    nrodocumento: string
    nombres: string
    apellidopaterno: string
    apellidomaterno: string
    estado: number
    motivo: string
    bloqueado: number
    eliminado: number
    idmotivo: number
    motivosalida: number
}

