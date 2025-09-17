import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable, lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class MaestrasService {

  private readonly baseUrl: string = environment.baseUrl;
  private readonly apiMaestra: string = environment.apiMaestra;

  constructor(private http: HttpClient) {}

  async getEmpresas(body: any): Promise<any>{
    const url = `${this.apiMaestra}/api/Maestros/get_empresas`;
    try {
      return await lastValueFrom(this.http.post<any>(url,body));
    } catch(error:any) {
      throw new Error(error.error?.message || 'Error en el api: empresas');
    }
  }

  getFundos(body: any): Observable<any> {
    const url = `${this.apiMaestra}/api/Maestros/get-fundos`;
    try {
      return this.http.post<any>(url,body);
    } catch (error: any) {
      throw new Error(error.error?.message || 'Error obteniendo fundos');
    }
  }

  getVehiculos(body: any): Observable<any> {
    const url = `${this.baseUrl}/transporte/vehiculos/listado`;
    try {
      return this.http.post<any>(url,body);
    } catch (error: any) {
      throw new Error(error.error?.message || 'Error obteniendo vehiculos');
    }
  }

  getLocalidades(body: any): Observable<any> {
    const url = `${this.baseUrl}/transporte/localidad/listado`;
    try {
      return this.http.post<any>(url,body);
    } catch (error: any) {
      throw new Error(error.error?.message || 'Error obteniendo localidades');
    }
  }
}
