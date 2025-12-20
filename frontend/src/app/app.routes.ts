import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { HomeComponent } from './components/home/home.component';
import { CreatePollComponent } from './components/create-poll/create-poll.component';
import { DiscoverPollsComponent } from './components/discover-polls/discover-polls.component';

export const routes: Routes = [
  {
    path: '',
    component:HomeComponent
  },
  {
    path: 'dashboard',
    component:DashboardComponent,
    canActivate: [authGuard],
  },
  { 
    path: 'polls/create',
    component: CreatePollComponent
  },
  { 
    path: 'discover',
    component: DiscoverPollsComponent },
  {
    path: '**',
    redirectTo: '',
  },
];
