import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable, lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class TransporteService {

  private readonly baseUrl: string = environment.baseUrl;

  constructor(private http: HttpClient) {}

  async enviarViajes(body: any): Promise<any> {
    const url = `${this.baseUrl}/transporte/viajes/guardar-viajes`;
    try {
      return await lastValueFrom(this.http.post<any>(url,body));
    } catch(error:any) {
      throw new Error(error.error?.message || 'Error en el api: viajes');
    }
  }

}
