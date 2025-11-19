export interface ProductUpdateDto {
  id: number;
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  quantity: number;
  categoryId: number;
  brandId: number;
  address: string;
  restockDueDate?: Date;
  isActive: boolean;
  image?: File;
}