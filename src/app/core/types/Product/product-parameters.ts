export interface ExtendedProductParameters {
  CategoryId?: number;
  BrandId?: number;
  Sort?: ProductSortOption;
  Search?: string;
  MinPrice?: number;
  MaxPrice?: number;
  PageIndex: number;
  PageSize: number;
  searchTerm?: string;
}

export enum ProductSortOption {
  NameAsc = 'NameAsc',
  NameDesc = 'NameDesc',
  PriceAsc = 'PriceAsc',
  PriceDesc = 'PriceDesc',
  Newest = 'Newest',
  DiscountDesc = 'DiscountDesc'
}