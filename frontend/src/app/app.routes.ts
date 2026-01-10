import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { HomeComponent } from './components/home/home.component';
import { DiscoverPollsComponent } from './components/discover-polls/discover-polls.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard],
  },
  { 
    path: 'discover',
    component: DiscoverPollsComponent ,
    canActivate:[authGuard]
  },
  {
    path: '**',
    redirectTo: '',
  },
];
