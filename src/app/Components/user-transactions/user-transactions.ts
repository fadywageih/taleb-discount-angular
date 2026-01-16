import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule, CurrencyPipe, DatePipe, SlicePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TransactionDto } from '../../core/types/Transaction/TransactionDto';
import { TransactionService } from '../../Services/transaction';
import { AccountService } from '../../Services/account/account-service';
import { UserResultDto } from '../../core';
import { Header } from '../../shared/header/header';

@Component({
  selector: 'app-user-transactions',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    CurrencyPipe,
    DatePipe,
    SlicePipe,
    Header
  ],
  templateUrl: './user-transactions.html',
  styleUrls: ['./user-transactions.css'] 
})
export class UserTransactions implements OnInit {
  transactions: TransactionDto[] = [];
  filteredTransactions: TransactionDto[] = [];
  loading = true;
  loadingMore = false;
  error: string | null = null;
  selectedStatus: string = '';
  statusCounts: { [key: string]: number } = {};
  totalOrders = 0;
  currentPage = 1;
  pageSize = 10;
  processingTransactionId: string | null = null;

  private transactionService = inject(TransactionService);
  private accountService = inject(AccountService);
  private router = inject(Router);

  ngOnInit(): void {
    this.diagnoseUserAndToken();
    this.loadTransactions();
  }

  private diagnoseUserAndToken(): void {
    const user = this.accountService.getCurrentUser();
    console.log('🔍 DEBUG - User Information:');
    console.log('📧 Email:', user?.email);
    console.log('👤 Display Name:', user?.displayName);
    console.log('🎭 User Type:', user?.userType);
    console.log('🔑 Has Token:', !!this.accountService.getToken());
    console.log('📋 User Object:', user);
    const token = this.accountService.getToken();
    if (token) {
      try {
        const parts = token.split('.');
        if (parts.length === 3) {
          const payload = parts[1];
          const decodedPayload = atob(payload);
          const claims = JSON.parse(decodedPayload);
          
          console.log('🔐 JWT Token Claims:', claims);
          console.log('🎭 Role in Token:', claims['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']);
          console.log('👤 UserType in Token:', claims['UserType']);
          console.log('🆔 UserId in Token:', claims['http://schemas.microsoft.com/ws/2008/06/identity/claims/nameidentifier']);
          console.log('📧 Email in Token:', claims['http://schemas.microsoft.com/ws/2008/06/identity/claims/email']);
        } else {
          console.warn('⚠️ Invalid JWT token format');
        }
      } catch (error) {
        console.error('❌ Error decoding JWT token:', error);
      }
    }
  }

  loadTransactions(): void {
    this.loading = true;
    this.error = null;
    
    console.log('📤 Attempting to load customer transactions...');
    
    this.transactionService.getCustomerTransactions().subscribe({
      next: (transactions: TransactionDto[]) => {
        console.log('✅ Transactions loaded successfully! Count:', transactions.length);
        console.log('📦 First transaction:', transactions[0]);
        
        this.transactions = transactions;
        this.calculateStatusCounts();
        this.filterTransactions();
        this.loading = false;
      },
      error: (error: any) => {
        console.error('❌ Error loading transactions:', error);
        console.error('❌ Error status:', error.status);
        console.error('❌ Error status text:', error.statusText);
        console.error('❌ Error message:', error.message);
        console.error('❌ Error URL:', error.url);
        
        if (error.status === 403) {
          this.error = 'Access denied. Your account does not have permission to view transactions.';
          const token = this.accountService.getToken();
          console.log('🔑 Token (first 50 chars):', token?.substring(0, 50) + '...');
          
          const user = this.accountService.getCurrentUser();
          alert(`🔐 Access Denied (403)!\n\n` +
                `Account Type: ${user?.userType || 'Unknown'}\n` +
                `Email: ${user?.email}\n\n` +
                `Please check:\n` +
                `1. Backend is running\n` +
                `2. User has correct role in JWT token\n` +
                `3. Token is valid and not expired`);
        } 
        else if (error.status === 401) {
          this.error = 'Unauthorized. Please login again.';
          alert('🔐 Your session has expired. Please login again.');
          this.accountService.logout();
          this.router.navigate(['/login']);
        }
        else if (error.status === 0) {
          this.error = 'Cannot connect to server. Please check if backend is running.';
          alert('🚨 Cannot connect to backend server!\n\nPlease make sure:\n1. Backend is running on https://localhost:7233\n2. CORS is properly configured');
        }
        else {
          this.error = `Failed to load your orders. Status: ${error.status}`;
          alert(`❌ Error ${error.status}: ${error.message || 'Unknown error'}`);
        }
        
        this.loading = false;
      }
    });
  }

  calculateStatusCounts(): void {
    this.statusCounts = {};
    this.totalOrders = this.transactions.length;
    
    this.transactions.forEach(transaction => {
      if (this.statusCounts[transaction.status]) {
        this.statusCounts[transaction.status]++;
      } else {
        this.statusCounts[transaction.status] = 1;
      }
    });
    
    console.log('📊 Status counts:', this.statusCounts);
    console.log('📈 Total orders:', this.totalOrders);
  }

  setStatusFilter(status: string): void {
    console.log('🎯 Setting status filter to:', status);
    this.selectedStatus = status;
    this.filterTransactions();
  }
getProductImage(transaction: TransactionDto): string {
    return this.transactionService.getProductImageUrl(transaction.productPictureUrl);
  }
  
  onImageError(event: any): void {
    console.error('❌ Image failed to load:', event.target.src);
    event.target.src = 'assets/Images/default-product.jpg';
  }
  filterTransactions(): void {
    if (this.selectedStatus) {
      this.filteredTransactions = this.transactions.filter(t => t.status === this.selectedStatus);
      console.log(`🎯 Filtered to ${this.selectedStatus}:`, this.filteredTransactions.length, 'transactions');
    } else {
      this.filteredTransactions = [...this.transactions];
      console.log('🎯 Showing all transactions:', this.filteredTransactions.length);
    }
  }

  cancelTransaction(transactionId: string): void {
    if (!confirm('Are you sure you want to cancel this order?\n\nThis action cannot be undone.')) return;
    
    console.log('🗑️ Attempting to cancel transaction:', transactionId);
    this.processingTransactionId = transactionId;
    
    this.transactionService.cancelTransaction(transactionId).subscribe({
      next: (updatedTransaction: TransactionDto) => {
        console.log('✅ Transaction cancelled successfully:', updatedTransaction);
        
        // تحديث القائمة
        const index = this.transactions.findIndex(t => t.id === transactionId);
        if (index !== -1) {
          this.transactions[index] = updatedTransaction;
        }
        
        this.calculateStatusCounts();
        this.filterTransactions();
        this.processingTransactionId = null;
        
        alert('✅ Order cancelled successfully!');
      },
      error: (error: any) => {
        console.error('❌ Error canceling transaction:', error);
        alert(`❌ Failed to cancel order: ${error.error?.message || 'Please try again.'}`);
        this.processingTransactionId = null;
      }
    });
  }

  viewTransactionDetails(transactionId: string): void {
    console.log('👁️ Viewing transaction details:', transactionId);
    this.router.navigate(['/user/transactions', transactionId]);
  }

  loadMore(): void {
    console.log('📥 Loading more transactions...');
    this.loadingMore = true;
    setTimeout(() => {
      console.log('✅ More transactions loaded (dummy)');
      this.loadingMore = false;
    }, 1000);
  }

  retryLoadTransactions(): void {
    console.log('🔄 Retrying to load transactions...');
    this.loadTransactions();
  }
  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  getStatusColor(status: string): string {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }
  getStatusIcon(status: string): string {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'fas fa-clock';
      case 'accepted':
        return 'fas fa-check-circle';
      case 'completed':
        return 'fas fa-check-double';
      case 'rejected':
        return 'fas fa-times-circle';
      case 'cancelled':
        return 'fas fa-ban';
      default:
        return 'fas fa-question-circle';
    }
  }
}