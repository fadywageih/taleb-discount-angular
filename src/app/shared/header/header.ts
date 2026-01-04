// src/app/Components/header/header.component.ts
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { UserResultDto } from '../../core';
import { AccountService } from '../../Services/account/account-service';

@Component({
  selector: 'app-header',
  imports: [CommonModule, RouterModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  isMobileMenuOpen = false;
  currentUser: UserResultDto | null = null;

  constructor(
    private accountService: AccountService,
    private router: Router
  ) {
    this.currentUser = this.accountService.getCurrentUser();
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  logout(): void {
    this.accountService.logout();
    this.router.navigate(['/cover']);
  }
}