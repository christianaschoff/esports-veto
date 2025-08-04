import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ObserveUi } from './observe-ui';

describe('ObserveUi', () => {
  let component: ObserveUi;
  let fixture: ComponentFixture<ObserveUi>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ObserveUi]
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
