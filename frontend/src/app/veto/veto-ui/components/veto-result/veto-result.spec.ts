import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VetoResult } from './veto-result';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('VetoResult', () => {
  let component: VetoResult;
  let fixture: ComponentFixture<VetoResult>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VetoResult],
      providers: [provideHttpClient(), 
                  provideHttpClientTesting()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VetoResult);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
