import { TestBed } from '@angular/core/testing';

import { FeedBack } from './feed-back';

describe('FeedBack', () => {
  let service: FeedBack;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FeedBack);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
