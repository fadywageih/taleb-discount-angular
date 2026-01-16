export interface TransactionDto {
  id: string;
  transactionNumber: string;
  discountCode?: string;
  productId: number;
  productName: string;
  productPictureUrl: string;
  vendorId: string;
  vendorName: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  transactionDate: Date;
  price: number;
  quantity: number;
  totalAmount: number;
  commissionAmount: number;
  vendorEarnings: number;
  status: string;
  rejectionReason?: string;
  acceptedDate?: Date;
  rejectedDate?: Date;
  completedDate?: Date;
}