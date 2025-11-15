// src/app/home/home.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AccountService } from '../Services/account/account-service';
import { UserResultDto } from '../core/types/auth.types'; 

@Component({
  selector: 'app-home',
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gray-100 p-8">
      <div class="max-w-4xl mx-auto">
        <!-- Header -->
        <header class="bg-white shadow-sm rounded-lg p-6 mb-8">
          <div class="flex justify-between items-center">
            <h1 class="text-3xl font-bold text-gray-800">مرحباً بك في النظام</h1>
            <div class="flex items-center space-x-4">
              <span class="text-gray-700">أهلاً، {{ currentUser?.displayName }}</span>
              <button 
                (click)="logout()"
                class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors">
                تسجيل الخروج
              </button>
            </div>
          </div>
        </header>

        <!-- Main Content -->
        <main class="bg-white shadow-sm rounded-lg p-6">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <!-- Card 1 -->
            <div class="bg-blue-50 p-6 rounded-lg border border-blue-200">
              <h3 class="text-xl font-semibold text-blue-800 mb-3">المعلومات الشخصية</h3>
              <p class="text-blue-600"><strong>البريد الإلكتروني:</strong> {{ currentUser?.email }}</p>
              <p class="text-blue-600"><strong>الاسم:</strong> {{ currentUser?.displayName }}</p>
            </div>

            <!-- Card 2 -->
            <div class="bg-green-50 p-6 rounded-lg border border-green-200">
              <h3 class="text-xl font-semibold text-green-800 mb-3">الإحصائيات</h3>
              <p class="text-green-600">عدد الأنشطة: 15</p>
              <p class="text-green-600">المهام المكتملة: 8</p>
            </div>

            <!-- Card 3 -->
            <div class="bg-purple-50 p-6 rounded-lg border border-purple-200">
              <h3 class="text-xl font-semibold text-purple-800 mb-3">الإعدادات</h3>
              <p class="text-purple-600">تعديل الملف الشخصي</p>
              <p class="text-purple-600">تغيير كلمة المرور</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  `,
  styleUrls: ['./home.css']
})
export class Home implements OnInit {
  currentUser: UserResultDto | null = null;

  constructor(
    private accountService: AccountService,
    private router: Router
  ) {}

  ngOnInit() {
    this.currentUser = this.accountService.getCurrentUser();
    
    // إذا لم يكن المستخدم مسجل الدخول، إعادة توجيه إلى صفحة Login
    if (!this.currentUser) {
      this.router.navigate(['/login']);
    }
  }

  logout() {
    this.accountService.logout();
  }
}