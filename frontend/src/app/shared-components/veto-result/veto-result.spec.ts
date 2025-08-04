import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VetoResult } from './veto-result';

describe('VetoResult', () => {
  let component: VetoResult;
  let fixture: ComponentFixture<VetoResult>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VetoResult]
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
