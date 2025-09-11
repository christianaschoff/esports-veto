import { TestBed } from '@angular/core/testing';
import { ObserverStore } from './observer-store';

describe('Store', () => {
  it('should create an instance', () => {
    TestBed.configureTestingModule({});
    const store = TestBed.inject(ObserverStore);
    expect(store).toBeTruthy();
  });
});
