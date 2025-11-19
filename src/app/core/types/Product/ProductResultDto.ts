export interface ProductResultDto {
  id: number;
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  quantity: number;
  categoryName: string;
  brandName: string;
  vendorName: string;
  address: string;
  restockDueDate?: Date;
  isActive: boolean;
  pictureUrl: string;
}