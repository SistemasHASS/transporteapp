import { Routes } from '@angular/router';
import { Error404PageComponent } from './shared/pages/error404-page/error404-page.component';
import { LayoutComponent } from './modules/main/pages/layout/layout.component';
import { ParametrosComponent } from './modules/main/pages/parametros/parametros.component';
import { AuthGuard } from './modules/auth/guard/auth.guard';
import { ViajesComponent } from './modules/main/pages/viajes/viajes.component';
import { ReporteViajesComponent } from './modules/main/pages/reporte-viajes/reporte-viajes.component';
import { ReporteViajesDetalladoComponent } from './modules/main/pages/reporte-viajes-detallado/reporte-viajes-detallado.component';
import { AprobacionesViajesComponent } from './modules/main/pages/aprobaciones-viajes/aprobaciones-viajes.component';
import { ViajesAdministracionComponent } from './modules/main/pages/viajes-administracion/viajes-administracion.component';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./modules/auth/auth.module').then(m => m.AuthModule),
  },
  {
    path: '404',
    component: Error404PageComponent,
  },
  {
    path: '',
    redirectTo: 'auth/login',
    pathMatch: 'full'
  },
  {
    path: 'main',
    component: LayoutComponent,
    children: [
      { path: 'parametros', component: ParametrosComponent },
      { path: 'viajes', component: ViajesComponent },
      { path: 'reporte-viajes', component: ReporteViajesComponent },
      { path: 'reporte-viajes-detallado', component: ReporteViajesDetalladoComponent },
      { path: 'aprobaciones-viajes', component: AprobacionesViajesComponent },
      { path: 'viajes-administracion', component: ViajesAdministracionComponent },
      { path: '**', redirectTo: 'auth/login' },
    ],
    canActivate: [AuthGuard]
  },
  {
    path: '**',
    redirectTo: '404',
  }
];
