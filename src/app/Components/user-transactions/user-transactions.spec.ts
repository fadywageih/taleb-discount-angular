import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserTransactions } from './user-transactions';

describe('UserTransactions', () => {
  let component: UserTransactions;
  let fixture: ComponentFixture<UserTransactions>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserTransactions]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserTransactions);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
