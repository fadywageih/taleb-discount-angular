import { BranchDto } from "./BranchDto";

export interface UpdateVendorDto {
  businessName: string;
  description: string;
  address: string;
  address2?: string;
  website?: string;
  facebookUrl?: string;
  logoUrl?: string;
  businessImages: string[];
  branches: BranchDto[];
}