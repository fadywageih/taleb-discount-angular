// src/app/core/types/product.types.ts
export interface ProductResultDto {
  id: number;
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  quantity: number;
  categoryId: number; 
  categoryName?: string;
  pictureUrl?: string;
  address: string;
  isActive: boolean;
  vendorId: string;
  vendorName?: string;
  createdAt: string; 
  updatedAt?: string;
   discountPercentage?: number;
   originalPrice?: number;
   orders?: number;
}
