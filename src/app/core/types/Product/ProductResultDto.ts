// src/app/core/types/product.types.ts
export interface ProductResultDto {
  id: number;
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  quantity: number;
  categoryId: number; // تأكد من وجود هذا
  categoryName?: string;
  pictureUrl?: string;
  address: string;
  isActive: boolean;
  vendorId: string;
  vendorName?: string;
  createdAt: string; // تأكد من وجود هذا
  updatedAt?: string;
  // إذا كانت هذه الخصائص غير موجودة في الـ API، احذفها
   discountPercentage?: number;
   originalPrice?: number;
   orders?: number;
}
