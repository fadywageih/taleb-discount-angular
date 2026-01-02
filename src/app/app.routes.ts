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
import { VendorHome } from './Components/vendor/vendor-home/vendor-home';
import { VendorEdit } from './Components/vendor/vendor-edit/vendor-edit';
import { vendorGuard } from './guards/vendor.guard';
import { CreateProduct } from './Components/Product/create-product/create-product';
import { EditProduct } from './Components/Product/edit-product/edit-product';
import { ViewProduct } from './Components/Product/view-product/view-product';
import { About } from './Components/about/about';

export const routes: Routes = [
  { path: '', component: Cover },
  { path: 'home', component: Home, canActivate: [authGuard] },
  { path: 'products', component: ViewProduct, canActivate: [authGuard] },
  { path: 'cover', component: Cover },
  { path: 'login', component: Login },
    { path: 'about', component: About },
  { path: 'register/school', component: RegisterSchool },
  { path: 'register/vendor', component: RegisterVendor },
  { path: 'register/university', component: RegisterUniversity },
  { path: 'forgot-password', component: ForgotPassword },
  { path: 'reset-password', component: ResetPassword },
  
  // Vendor Routes مع VendorGuard
  { path: 'vendor/home', component: VendorHome, canActivate: [vendorGuard] },
  { path: 'vendor/edit', component: VendorEdit, canActivate: [vendorGuard] },
  { path: 'vendor/products/create', component: CreateProduct, canActivate: [vendorGuard] },
  {path: 'vendor/products/edit/:id',component: EditProduct,canActivate: [vendorGuard]},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }