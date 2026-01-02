import { CategoryResultDto } from "../Product/CategoryResultDto";
import { ProductResultDto } from "../Product/ProductResultDto";
import { AdvertisementDto } from "./AdvertisementDto";
import { VendorLogoDto } from "./VendorLogoDto";

export interface HomePageData {
  featuredProducts: ProductResultDto[];
  categories: CategoryResultDto[];
  featuredVendors: VendorLogoDto[];
  advertisements: AdvertisementDto[];
}