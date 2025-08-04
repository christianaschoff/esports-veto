import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VetoSystem } from './veto-system';

describe('VetoSystem', () => {
  let component: VetoSystem;
  let fixture: ComponentFixture<VetoSystem>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VetoSystem]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VetoSystem);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
