import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ObserveSettingsPopup } from './observe-settings-popup';

describe('ObserveSettingsPopup', () => {
  let component: ObserveSettingsPopup;
  let fixture: ComponentFixture<ObserveSettingsPopup>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ObserveSettingsPopup]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ObserveSettingsPopup);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
