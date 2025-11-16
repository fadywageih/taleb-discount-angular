import { BranchDto } from "./BranchDto";

export interface VendorDto {
  id: string;
  businessName: string;
  description: string;
  address: string;
  address2?: string;
  website?: string;
  facebookUrl?: string;
  logoUrl?: string;
  businessImages: string[];
  userId: string;
  branches: BranchDto[];
}