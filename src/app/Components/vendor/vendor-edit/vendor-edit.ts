import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { VendorService } from '../../../Services/vendor/vendor.service';
import { VendorHeader } from '../vendor-header/vendor-header';
import { UpdateVendorDto, VendorDto, BranchDto } from '../../../core';
import { AccountService } from '../../../Services/account/account-service';

@Component({
  selector: 'app-vendor-edit',
  templateUrl: './vendor-edit.html',
  styleUrls: ['./vendor-edit.css'],
  imports: [CommonModule, FormsModule, VendorHeader]
})
export class VendorEdit implements OnInit {
  vendorData: UpdateVendorDto = {
    businessName: '',
    description: '',
    address: '',
    address2: '',
    website: '',
    facebookUrl: '',
    logoUrl: '',
    businessImages: ['', '', '', '', ''],
    branches: []
  };
  isLoading = false;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';
  defaultLogo = 'assets/images/unnamed.png';
  defaultBusinessImage = 'assets/Images/Slider.png';
  constructor(
    private vendorService: VendorService,
    private accountService: AccountService,
    private router: Router
  ) {}
  ngOnInit() {
    this.loadVendorData();
  }
  loadVendorData(): void {
    this.isLoading = true;
    this.vendorService.getVendorProfile().subscribe({
      next: (data: VendorDto) => {
        this.vendorData = {
          businessName: data.businessName || '',
          description: data.description || '',
          address: data.address || '',
          address2: data.address2 || '',
          website: data.website || '',
          facebookUrl: data.facebookUrl || '',
          logoUrl: data.logoUrl || '',
          businessImages: this.padBusinessImages(data.businessImages),
          branches: data.branches || []
        };
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = 'Failed to load profile data';
      }
    });
  }
  private padBusinessImages(images: string[] | undefined): string[] {
    const businessImages = images || [];
    const paddedImages = [...businessImages];
    while (paddedImages.length < 5) {
      paddedImages.push('');
    }
    return paddedImages.slice(0, 5);
  }
  triggerLogoUpload(): void {
    const fileInput = document.getElementById('logo-upload') as HTMLInputElement;
    fileInput?.click();
  }
  onLogoUpload(event: any): void {
    const file = event.target.files[0];
    if (file) this.processImageFile(file, 'logo');
    event.target.value = '';
  }
  triggerImageUpload(index: number): void {
    const fileInput = document.getElementById(`image-upload-${index + 1}`) as HTMLInputElement;
    fileInput?.click();
  }
  onImageUpload(event: any, index: number): void {
    const file = event.target.files[0];
    if (file) this.processImageFile(file, 'business', index);
    event.target.value = '';
  }
  private processImageFile(file: File, type: 'logo' | 'business', index?: number): void {
    if (!file.type.startsWith('image/')) {
      this.showError('Please select a valid image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      this.showError('Image size should be less than 5MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e: any) => {
      if (type === 'logo') {
        this.vendorData.logoUrl = e.target.result;
      } else if (type === 'business' && index !== undefined) {
        this.vendorData.businessImages[index] = e.target.result;
      }
    };
    reader.readAsDataURL(file);
  }
  onSubmit(): void {
    if (this.isSubmitting) return;
    if (!this.validateForm()) return;
    this.isSubmitting = true;
    this.errorMessage = '';
    const submitData = this.prepareSubmitData();
    this.vendorService.updateVendorProfile(submitData).subscribe({
      next: (updatedVendor) => {
        this.isSubmitting = false;
        this.successMessage = 'Profile updated successfully!';
        setTimeout(() => this.router.navigate(['/vendor/home']), 2000);
      },
      error: (error) => {
        this.isSubmitting = false;
        this.errorMessage = error.message || 'Failed to update profile';
      }
    });
  }
  private validateForm(): boolean {
    if (!this.vendorData.businessName?.trim()) {
      this.showError('Business name is required');
      return false;
    }
    if (!this.vendorData.description?.trim()) {
      this.showError('Business description is required');
      return false;
    }
    return true;
  }
  private prepareSubmitData(): UpdateVendorDto {
    return {
      businessName: this.vendorData.businessName.trim(),
      description: this.vendorData.description.trim(),
      address: this.vendorData.address.trim(),
      address2: this.vendorData.address2?.trim() || '',
      website: this.vendorData.website?.trim() || '',
      facebookUrl: this.vendorData.facebookUrl?.trim() || '',
      logoUrl: this.vendorData.logoUrl || '',
      businessImages: this.vendorData.businessImages.filter(img => img?.trim() !== ''),
      branches: this.vendorData.branches
    };
  }
  cancel(): void {
    this.router.navigate(['/vendor/home']);
  }
  private showError(message: string): void {
    this.errorMessage = message;
    setTimeout(() => this.errorMessage = '', 5000);
  }
  getImageUrl(image: string | undefined, defaultImage: string): string {
    return image?.trim() ? image : defaultImage;
  }
  get businessImages(): string[] {
    return this.vendorData.businessImages;
  }
  get branches(): BranchDto[] {
    return this.vendorData.branches;
  }
  addBranch(): void {
    this.vendorData.branches.push({
      address: '',
      city: '',
      state: '',
      phoneNumber: ''
    });
  }
  removeBranch(index: number): void {
    this.vendorData.branches.splice(index, 1);
  }
  
}