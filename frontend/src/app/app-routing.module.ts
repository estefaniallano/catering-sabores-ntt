import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ComercialEventosComponent } from './pages/comercial-eventos/comercial-eventos.component';
import { CocinaDashboardComponent } from './pages/cocina-dashboard/cocina-dashboard.component';
import { LoginComponent } from './pages/login/login.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: 'login', component: LoginComponent },
  { path: 'comercial/eventos', component: ComercialEventosComponent },
  { path: 'cocina/dashboard', component: CocinaDashboardComponent },
  { path: '**', redirectTo: 'login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
