import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VetoStateDisplay } from './veto-state-display';

describe('VetoState', () => {
  let component: VetoStateDisplay;
  let fixture: ComponentFixture<VetoStateDisplay>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VetoStateDisplay]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VetoStateDisplay);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
