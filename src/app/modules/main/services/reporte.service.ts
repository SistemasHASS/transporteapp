import { inject, Injectable } from '@angular/core';
import { HttpClient,HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { lastValueFrom } from 'rxjs';
import { DexieService } from 'src/app/shared/dixiedb/dexie-db.service';

@Injectable({
  providedIn: 'root'
})

export class ReporteService {
  private readonly baseUrl: string = environment.baseUrl;

  constructor(private http: HttpClient) {}

  async getReporteViajes(body: any): Promise<any> {
    const url = `${this.baseUrl}/transporte/viajes/reporte-viajes`;
    try {
      return await lastValueFrom(this.http.post<any>(url,body));
    } catch(error:any) {
      throw new Error(error.error?.message || 'Error en el api: viajes');
    }
  }

  async getReporteViajesDetallado(body: any): Promise<any> {
    const url = `${this.baseUrl}/transporte/viajes/reporte-viajes-detallado`;
    try {
      return await lastValueFrom(this.http.post<any>(url,body));
    } catch(error:any) {
      throw new Error(error.error?.message || 'Error en el api: viajes');
    }
  }

  async getViajeById(body: any): Promise<any> {
    const url = `${this.baseUrl}/transporte/viajes/recuperar-viaje`;
    try {
      return await lastValueFrom(this.http.post<any>(url,body));
    } catch(error:any) {
      throw new Error(error.error?.message || 'Error en el api: recuperar viaje');
    }
  }
}
