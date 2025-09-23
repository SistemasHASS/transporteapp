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
        const formato = await this.getFormatoReporte()
        const result = await this.reporteService.getReporteViajes(formato)
        this.alertService.cerrarModalCarga();
        if(result.length>0) {
          this.data = result
        } else {
          this.data.length = 0
          this.alertService.showAlert('Importante!', 'No existe un reporte para mostrar', 'info');
        }
        break;
      }
    }
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


  async getFormatoReporte() {
    return [{
      ruc: this.usuario.ruc,
      conductor: this.usuario.idrol.includes('CHOTRA')?this.usuario.documentoidentidad: '',
      desde: this.formatDateViaje(this.fdesde),
      hasta: this.formatDateViaje(this.fhasta)
    }]
  }

  getDate() {
    return moment(new Date()).format('YYYY-MM-DD')
  }

  formatDateViaje(date: any) {
    return moment(date).format('YYYYMMDD')
  }

  exportarPDF() {
    const encabezados = [
      '#','Fecha Registro','Horario', 'Punto Inicio', 'Punto Fin','# Pasajeros'
    ];
  
    const body = this.data.map((row: any, i: any) => [
      i + 1,
      row.fecharegistro,
      row.horario_in,
      row.puntoinicio,
      row.puntofin,
      row.cantidad_in
    ]);
  
    // Tomamos valores únicos del primer registro
    const conductor = this.data.length > 0 ? this.data[0].conductor : '';
    const placa = this.data.length > 0 ? this.data[0].placa_in : '';
    const ruc = this.data.length > 0 ? this.data[0].ruc : '';
    const dni = this.data.length > 0 ? this.data[0].DNI_conductor : '';
  
    const docDefinition: any = {
      content: [
        { text: 'Reporte de Rendimiento', style: 'header' },
  
        // 👇 sección de datos fijos
        {
          columns: [
            { text: `RUC: ${ruc}`, style: 'subHeader' }
          ],
          margin: [0, 0, 0, 10]
        },
        {
          columns: [
            { text: `Conductor: ${conductor}`, style: 'subHeader' },
            { text: `Placa: ${placa}`, style: 'subHeader', alignment: 'right' }
          ],
          margin: [0, 0, 0, 5]
        },
        {
          columns: [
            { text: `DNI: ${dni}`, style: 'subHeader' }
          ],
          margin: [0, 0, 0, 10]
        },
  
        // 👇 tabla sin RUC, DNI, Conductor ni Placa
        {
          table: {
            headerRows: 1,
            widths: [
              'auto','auto','auto','auto',
              'auto','auto'
            ],
            body: [
              encabezados.map(h => ({ text: h, style: 'tableHeader' })),
              ...body
            ]
          },
          layout: {
            fillColor: (rowIndex: number) => {
              return rowIndex === 0
                ? '#337ab7'      // cabecera azul
                : rowIndex % 2 === 0
                  ? '#f2f2f2'   // zebra gris
                  : null;       // fila blanca
            }
          }
        }
      ],
      styles: {
        header: {
          fontSize: 16,
          bold: true,
          alignment: 'center',
          margin: [0, 0, 0, 10]
        },
        subHeader: {
          fontSize: 11,
          bold: true
        },
        tableHeader: {
          bold: true,
          fontSize: 10,
          color: 'white',
          alignment: 'center'
        }
      },
      defaultStyle: {
        fontSize: 9
      }
    };
  
    pdfMake.createPdf(docDefinition).open();
  }

  exportarExcel(): void {
      const nombreArchivo = `reporte_detallado_${new Date().toISOString().slice(0,10)}.xlsx`;
      
      // convierte data a hoja de Excel
      const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.data);
    
      // crea libro y agrega hoja
      const wb: XLSX.WorkBook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Reporte');
    
      // genera Excel en base64
      const excelBase64 = XLSX.write(wb, { bookType: 'xlsx', type: 'base64' });
    
      // crea un Data URI
      const dataUri = "data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64," + excelBase64;
    
      // 👇 en WebView Android esto abre el Excel en otra app
      window.open(dataUri, "_blank");
    }
}
