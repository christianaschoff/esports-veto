import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ObserveUi } from './observe-ui';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('ObserveUi', () => {
  let component: ObserveUi;
  let fixture: ComponentFixture<ObserveUi>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ObserveUi],
      providers: [provideHttpClient(), 
                  provideHttpClientTesting()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ObserveUi);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
