import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {NotFoundComponent} from './not-found/not-found.component';
import {AuthGuard} from './guards/auth.guard';
import {RedirectComponent} from './redirect/redirect.component';

const routes: Routes = [
  {
    path: 'problem/:problemId',
    component: RedirectComponent
  },
  {
    path: '404',
    component: NotFoundComponent
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardModule),
    canActivate: [AuthGuard]
  },
  {
    path: '',
    loadChildren: () => import('./outer/outer.module').then(m => m.OuterModule)
  },
  {
    path: '**',
    redirectTo: '404'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
