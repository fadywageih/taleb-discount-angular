import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { VendorService } from '../../../Services/vendor/vendor.service';
import { AccountService } from '../../../Services/account/account-service';
import { VendorDto } from '../../../core';
interface NavItem {
  label: string;
  route: string;
  isActive: boolean;
}
@Component({
  selector: 'app-vendor-header',
  templateUrl: './vendor-header.html',
  imports: [CommonModule, RouterLink]
})
export class VendorHeader implements OnInit {
  isMobileMenuOpen = false;
  vendorData: VendorDto | null = null;
  
  navItems: NavItem[] = [
    { label: 'Home', route: '/vendor/home', isActive: true },
    { label: 'Edit', route: '/vendor/edit', isActive: false },
    { label: 'Transactions', route: '/vendor/transactions', isActive: false }, 
  ];

  constructor(
    private vendorService: VendorService,
    private accountService: AccountService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadVendorData();
  }

  loadVendorData() {
    this.vendorService.getVendorProfile().subscribe({
      next: (data) => {
        this.vendorData = data;
      },
      error: (error) => {
        console.error('Error loading vendor data:', error);
      }
    });
  }
  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }
  logout(): void {
    this.accountService.logout();
    this.router.navigate(['/cover']);
  }
}