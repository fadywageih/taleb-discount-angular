import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Cover } from './cover';

describe('Cover', () => {
  let component: Cover;
  let fixture: ComponentFixture<Cover>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Cover]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Cover);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
