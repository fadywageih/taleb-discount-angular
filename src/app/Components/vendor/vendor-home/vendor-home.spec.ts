import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VendorHome } from './vendor-home';

describe('VendorHome', () => {
  let component: VendorHome;
  let fixture: ComponentFixture<VendorHome>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VendorHome]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VendorHome);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
