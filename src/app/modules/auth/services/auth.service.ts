import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@/environments/environment';
import { lastValueFrom  } from 'rxjs';
import { DexieService } from '@/app/shared/dixiedb/dexie-db.service';

@Injectable({
  providedIn: 'root'
})

export class AuthService {

  private readonly baseUrl: string = environment.baseUrl;
  private readonly apiMaestra: string = environment.apiMaestra;

  constructor(
    private http: HttpClient,
    private dexieService: DexieService
  ) {}

  async login(usuario: string, clave: string, aplicacion: string): Promise<any> {
    
    const url = `${this.apiMaestra}/api/Maestros/get-usuarios`;

    const body = [{ usuario, clave, aplicacion }];
  
    try {
      const response = await lastValueFrom(this.http.post<any>(url, body));
      return response;
    } catch (error: any) {
      throw new Error(error.error?.message || 'Error de autenticación');
    }
  }

  async getRecuperarViajes(body: any){
    const url = `${this.baseUrl}/transporte/viajes/recuperar-viajes`;
    return await lastValueFrom(this.http.post<any>(url, body));
  }

  async isLoggedIn(){
    const user = await this.dexieService.showUsuario();
    return !!user
  }
}
