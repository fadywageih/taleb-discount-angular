import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterSchool } from './register-school';

describe('RegisterSchool', () => {
  let component: RegisterSchool;
  let fixture: ComponentFixture<RegisterSchool>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterSchool]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegisterSchool);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
