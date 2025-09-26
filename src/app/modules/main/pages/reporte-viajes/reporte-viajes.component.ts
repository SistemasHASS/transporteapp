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
import { Usuario } from '@/app/shared/interfaces/Tables';

@Component({
  selector: 'app-reporte-viajes',
  imports: [CommonModule, FormsModule],
  templateUrl: './reporte-viajes.component.html',
  styleUrl: './reporte-viajes.component.scss'
})
export class ReporteViajesComponent {

  data : any = [];
  columns: any = [];
  body: any = [];
  columnas: string[] = [];
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

  fdesde: any;
  fhasta: any;
  activeTab = 'home'; 

  constructor(
    private dexieService: DexieService,
    private reporteService: ReporteService,
    private alertService: AlertService
  ) { }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  async ngOnInit() {
    const usuario = await this.dexieService.showUsuario();
    if (usuario) {
      this.usuario = usuario;
    }
    this.fdesde = this.getDate();
    this.fhasta = this.getDate();
  }

  async listarReporte() {
    this.alertService.mostrarModalCarga();
    switch(this.activeTab){
      case "home": {
        let formato
        if(this.usuario.idrol.includes('CHOTRA')){
          formato = await this.getFormatoReporte()
        }
        if(this.usuario.idrol.includes('PROVTRA')){
          formato = await this.getFormatoReporteProv()
        }
        if(this.usuario.idrol.includes('ADTRA')){
          formato = await this.getFormatoReporteAdministrador()
        }
        const result = await this.reporteService.getReporteViajes(formato)
        this.alertService.cerrarModalCarga();
        if(result.length>0) {
          this.data = result
          this.columnas = Object.keys(this.data[0]);
        } else {
          this.data.length = 0
          this.alertService.showAlert('Importante!', 'No existe un reporte para mostrar', 'info');
        }
        break;
      }
    }
  }

  async getFormatoReporte() {
    return [{
      ruc: this.usuario.ruc,
      desde: this.formatDateViaje(this.fdesde),
      hasta: this.formatDateViaje(this.fhasta),
      conductor: this.usuario.documentoidentidad,
      proveedor: '',
      idrol: 'CHOTRA'
    }]
  }

  async getFormatoReporteProv() {
    return [{
      ruc: this.usuario.ruc,
      desde: this.formatDateViaje(this.fdesde),
      hasta: this.formatDateViaje(this.fhasta),
      conductor: '',
      proveedor: this.usuario.documentoidentidad,
      idrol: 'PROVTRA'
    }]
  }

  async getFormatoReporteAdministrador() {
    return [{
      ruc: this.usuario.ruc,
      desde: this.formatDateViaje(this.fdesde),
      hasta: this.formatDateViaje(this.fhasta),
      conductor: '',
      proveedor: '',
      idrol: 'ADTRA'
    }]
  }

  get reportesKeys(): string[] {
    return Object.keys(this.data[0]);
  }

  getReporteData(key: string): any[] {
    return this.data[0][key];
  }

  getHeaders(data: any[]): string[] {
    return data.length > 0 ? Object.keys(data[0]) : [];
  }

  exportToExcel(key: string) {
    const dataToExport = this.getReporteData(key);
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = { Sheets: { [key]: worksheet }, SheetNames: [key] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blobData = new Blob([excelBuffer], { type: 'application/octet-stream' });
    FileSaver.saveAs(blobData, `${key}.xlsx`);
  }

  getDate() {
    return moment(new Date()).format('YYYY-MM-DD')
  }

  formatDateViaje(date: any) {
    return moment(date).format('YYYYMMDD')
  }

  exportarPDF() {
    if (!this.data || this.data.length === 0) {
      return;
    }
  
    // 1. Obtener las columnas de forma dinámica (todas las claves del primer objeto)
    const columnas = Object.keys(this.data[0]);
  
    // 2. Generar encabezados con títulos legibles
    const encabezados = columnas.map(col => ({
      text: col.toUpperCase().replace(/_/g, ' '), // "DNI_conductor" → "DNI CONDUCTOR"
      style: 'tableHeader'
    }));
  
    // 3. Generar las filas dinámicas
    const body = this.data.map((row: any) =>
      columnas.map(col => {
        if (col.toLowerCase() === 'aprobado') {
          return row[col] ? 'Aprobado' : 'No Aprobado';
        }
        return row[col] ?? '';
      })
    );
  
    // 4. Construir definición del documento
    const docDefinition: any = {
      content: [
        { text: 'Reporte Dinámico', style: 'header' },
        {
          table: {
            headerRows: 1,
            widths: columnas.map(() => 'auto'),
            body: [
              encabezados, // cabeceras
              ...body      // filas
            ]
          },
          layout: {
            fillColor: (rowIndex: number) => {
              return rowIndex === 0 ? '#337ab7' : rowIndex % 2 === 0 ? '#f2f2f2' : null;
            }
          }
        }
      ],
      styles: {
        header: { fontSize: 16, bold: true, alignment: 'center', margin: [0, 0, 0, 10] },
        tableHeader: { bold: true, fontSize: 10, color: 'white', alignment: 'center' }
      },
      defaultStyle: { fontSize: 9 }
    };
  
    // 5. Guardar o descargar
    const camaraBridge = (window as any).CamaraBridge;
    if (camaraBridge && typeof camaraBridge.savePdf === 'function') {
      pdfMake.createPdf(docDefinition).getBase64((base64Data: string) => {
        camaraBridge.savePdf(base64Data, 'reporte.pdf');
      });
    } else {
      pdfMake.createPdf(docDefinition).download('reporte.pdf');
    }
  }
  

  // exportarPDF() {
  //   const encabezados = [
  //     '#','Fecha Registro','Horario', 'Punto Inicio', 'Punto Fin','# Pasajeros'
  //   ];
  
  //   const body = this.data.map((row: any, i: any) => [
  //     i + 1,
  //     row.fecharegistro,
  //     row.horario,
  //     row.puntoinicio,
  //     row.puntofin,
  //     row.cantidad
  //   ]);
  
  //   const conductor = this.data.length > 0 ? this.data[0].conductor : '';
  //   const placa = this.data.length > 0 ? this.data[0].placa : '';
  //   const ruc = this.data.length > 0 ? this.data[0].ruc : '';
  //   const dni = this.data.length > 0 ? this.data[0].DNI_conductor : '';
  
  //   const docDefinition: any = {
  //     content: [
  //       { text: 'Reporte de Rendimiento', style: 'header' },
  //       { columns: [{ text: `RUC: ${ruc}`, style: 'subHeader' }], margin: [0,0,0,10] },
  //       {
  //         columns: [
  //           { text: `Conductor: ${conductor}`, style: 'subHeader' },
  //           { text: `Placa: ${placa}`, style: 'subHeader', alignment: 'right' }
  //         ],
  //         margin: [0,0,0,5]
  //       },
  //       { columns: [{ text: `DNI: ${dni}`, style: 'subHeader' }], margin: [0,0,0,10] },
  //       {
  //         table: {
  //           headerRows: 1,
  //           widths: ['auto','auto','auto','auto','auto','auto'],
  //           body: [
  //             encabezados.map(h => ({ text: h, style: 'tableHeader' })),
  //             ...body
  //           ]
  //         },
  //         layout: {
  //           fillColor: (rowIndex: number) => {
  //             return rowIndex === 0 ? '#337ab7' : rowIndex % 2 === 0 ? '#f2f2f2' : null;
  //           }
  //         }
  //       }
  //     ],
  //     styles: {
  //       header: { fontSize: 16, bold: true, alignment: 'center', margin: [0,0,0,10] },
  //       subHeader: { fontSize: 11, bold: true },
  //       tableHeader: { bold: true, fontSize: 10, color: 'white', alignment: 'center' }
  //     },
  //     defaultStyle: { fontSize: 9 }
  //   };
  
  //   const camaraBridge = (window as any).CamaraBridge;
  
  //   if (camaraBridge && typeof camaraBridge.savePdf === "function") {
  //     pdfMake.createPdf(docDefinition).getBase64((base64Data: string) => {
  //       camaraBridge.savePdf(base64Data, "reporte.pdf");
  //     });
  //   } else {
  //     pdfMake.createPdf(docDefinition).download("reporte.pdf");
  //   }
  // }
  
  exportarExcel(): void {
    try {
      const nombreArchivo = `reporte_viajes_${new Date().toISOString().slice(0,10)}.xlsx`;
      const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.data);
      const wb: XLSX.WorkBook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Reporte');
      const excelBuffer: any = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
      FileSaver.saveAs(blob, nombreArchivo);
    } catch (error) {
      console.log(error);
      this.alertService.showAlert('Importante!', 'No existe herramienta para excel', 'info');
    }
  }
  
}
