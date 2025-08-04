import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VetoPopup } from './veto-popup';

describe('VetoPopup', () => {
  let component: VetoPopup;
  let fixture: ComponentFixture<VetoPopup>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VetoPopup]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VetoPopup);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
