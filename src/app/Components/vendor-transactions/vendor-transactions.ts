import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule, CurrencyPipe, DatePipe, SlicePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TransactionDto } from '../../core/types/Transaction/TransactionDto';
import { TransactionStatsDto } from '../../core/types/Transaction/TransactionStatsDto';
import { TransactionService } from '../../Services/transaction';
import { AccountService } from '../../Services/account/account-service';
import { VendorHeader } from '../vendor/vendor-header/vendor-header';
@Component({
  selector: 'app-vendor-transactions',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    CurrencyPipe,
    DatePipe,
    SlicePipe,
    VendorHeader
  ],
  templateUrl: './vendor-transactions.html',
  styleUrls: ['./vendor-transactions.css']
})
export class VendorTransactions implements OnInit {
  transactions: TransactionDto[] = [];
  filteredTransactions: TransactionDto[] = [];
  stats: TransactionStatsDto | null = null;
  loading = true;
  error: string | null = null;
  selectedStatus: string = '';
  searchTerm: string = '';
  currentPage = 1;
  pageSize = 10;
  totalPages = 1;
  showRejectModal = false;
  transactionToReject: string | null = null;
  rejectionReason = '';
  rejectionError: string | null = null;
  processingTransactionId: string | null = null;
  private transactionService = inject(TransactionService);
  private accountService = inject(AccountService); 
  private router = inject(Router);
  ngOnInit(): void {
    this.loadTransactions();
    this.loadStats();
  }
  loadTransactions(): void {
    this.loading = true;
    this.error = null;
    
    this.transactionService.getVendorTransactions().subscribe({
      next: (transactions) => {
        this.transactions = transactions;
        this.filterTransactions();
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load transactions. Please try again.';
        this.loading = false;
        console.error('Error loading transactions:', error);
      }
    });
  }
  loadStats(): void {
    this.transactionService.getVendorStats().subscribe({
      next: (stats) => {
        this.stats = stats;
      },
      error: (error) => {
        console.error('Error loading stats:', error);
      }
    });
  }
  filterTransactions(): void {
    let filtered = [...this.transactions];
    if (this.selectedStatus) {
      filtered = filtered.filter(t => t.status === this.selectedStatus);
    }
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(t => 
        t.transactionNumber.toLowerCase().includes(term) ||
        t.productName.toLowerCase().includes(term) ||
        (t.discountCode && t.discountCode.toLowerCase().includes(term)) ||
        t.customerName.toLowerCase().includes(term)
      );
    }
    this.filteredTransactions = filtered;
    this.totalPages = Math.ceil(this.filteredTransactions.length / this.pageSize);
    this.currentPage = 1;
  }
  getProductImage(transaction: TransactionDto): string {
    return this.transactionService.getProductImageUrl(transaction.productPictureUrl);
  }
  onImageError(event: any): void {
    console.error('❌ Image failed to load:', event.target.src);
    event.target.src = 'assets/Images/default-product.jpg';
  }
  acceptTransaction(transactionId: string): void {
    if (!confirm('Are you sure you want to accept this order?')) return;
    
    this.processingTransactionId = transactionId;
    this.transactionService.acceptTransaction(transactionId).subscribe({
      next: (updatedTransaction) => {
        const index = this.transactions.findIndex(t => t.id === transactionId);
        if (index !== -1) {
          this.transactions[index] = updatedTransaction;
        }
        this.filterTransactions();
        this.loadStats(); // Refresh stats
        this.processingTransactionId = null;
      },
      error: (error) => {
        console.error('Error accepting transaction:', error);
        alert('Failed to accept transaction. Please try again.');
        this.processingTransactionId = null;
      }
    });
  }

  openRejectModal(transactionId: string): void {
    this.transactionToReject = transactionId;
    this.rejectionReason = '';
    this.rejectionError = null;
    this.showRejectModal = true;
  }

  closeRejectModal(): void {
    this.showRejectModal = false;
    this.transactionToReject = null;
    this.rejectionReason = '';
    this.rejectionError = null;
  }

  rejectTransaction(): void {
    if (!this.transactionToReject || !this.rejectionReason.trim()) {
      this.rejectionError = 'Please provide a rejection reason (minimum 5 characters).';
      return;
    }
    
    this.processingTransactionId = this.transactionToReject;
    this.transactionService.rejectTransaction(this.transactionToReject, this.rejectionReason).subscribe({
      next: (updatedTransaction) => {
        const index = this.transactions.findIndex(t => t.id === this.transactionToReject);
        if (index !== -1) {
          this.transactions[index] = updatedTransaction;
        }
        this.filterTransactions();
        this.loadStats(); // Refresh stats
        this.closeRejectModal();
        this.processingTransactionId = null;
      },
      error: (error) => {
        console.error('Error rejecting transaction:', error);
        this.rejectionError = 'Failed to reject transaction. Please try again.';
        this.processingTransactionId = null;
      }
    });
  }
  completeTransaction(transactionId: string): void {
    if (!confirm('Mark this order as completed?')) return;
    
    this.processingTransactionId = transactionId;
    this.transactionService.completeTransaction(transactionId).subscribe({
      next: (updatedTransaction) => {
        const index = this.transactions.findIndex(t => t.id === transactionId);
        if (index !== -1) {
          this.transactions[index] = updatedTransaction;
        }
        this.filterTransactions();
        this.loadStats(); // Refresh stats
        this.processingTransactionId = null;
      },
      error: (error) => {
        console.error('Error completing transaction:', error);
        alert('Failed to mark transaction as completed. Please try again.');
        this.processingTransactionId = null;
      }
    });
  }
  viewTransactionDetails(transactionId: string): void {
    this.router.navigate(['/vendor/transactions', transactionId]);
  }
  // Pagination
  get Math() {
    return Math;
  }
  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }
  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }
  get paginatedTransactions(): TransactionDto[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    return this.filteredTransactions.slice(startIndex, endIndex);
  }
}