
import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { Cover } from './Components/cover/cover';
import { Login } from './Components/auth/login/login';
import { Home } from './home/home';
import { authGuard } from './guards/auth.guard';
import { RegisterSchool } from './Components/auth/register-school/register-school';
import { RegisterVendor } from './Components/auth/register-vendor/register-vendor';
import { RegisterUniversity } from './Components/auth/register-university/register-university';
import { ForgotPassword } from './Components/auth/forgot-password/forgot-password';
import { ResetPassword } from './Components/auth/reset-password/reset-password';

export const routes: Routes = [
  { path: '', component: Cover },
    { path: 'home', component: Home, canActivate: [authGuard] },

  {path: 'cover', component: Cover},
  {path:'login',component:Login},
  // Register Routes
  { path: 'register/school', component: RegisterSchool },
  { path: 'register/vendor', component: RegisterVendor },
  {path: 'register/university', component: RegisterUniversity},
    { path: 'forgot-password', component: ForgotPassword },
  { path: 'reset-password', component: ResetPassword},
];
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
