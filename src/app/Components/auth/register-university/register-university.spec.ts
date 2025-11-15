import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterUniversity } from './register-university';

describe('RegisterUniversity', () => {
  let component: RegisterUniversity;
  let fixture: ComponentFixture<RegisterUniversity>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterUniversity]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegisterUniversity);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
