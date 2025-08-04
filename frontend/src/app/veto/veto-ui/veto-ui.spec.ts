import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VetoUi } from './veto-ui';

describe('VetoUi', () => {
  let component: VetoUi;
  let fixture: ComponentFixture<VetoUi>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VetoUi]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VetoUi);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
