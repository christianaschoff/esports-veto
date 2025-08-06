import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BetaMarker } from './beta-marker';

describe('BetaMarker', () => {
  let component: BetaMarker;
  let fixture: ComponentFixture<BetaMarker>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BetaMarker]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BetaMarker);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
