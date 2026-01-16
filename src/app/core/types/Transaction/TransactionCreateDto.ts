export interface TransactionCreateDto {
  productId: number;
  quantity: number;
  discountCode?: string;
}