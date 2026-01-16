import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VendorTransactions } from './vendor-transactions';

describe('VendorTransactions', () => {
  let component: VendorTransactions;
  let fixture: ComponentFixture<VendorTransactions>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VendorTransactions]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VendorTransactions);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
