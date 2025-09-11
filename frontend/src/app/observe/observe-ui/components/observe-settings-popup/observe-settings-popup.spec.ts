import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ObserveSettingsPopup } from './observe-settings-popup';
import { DialogRef } from '@angular/cdk/dialog';
import { ObserverStore } from '../../../../store/observer-store';

describe('ObserveSettingsPopup', () => {
  let component: ObserveSettingsPopup;
  let fixture: ComponentFixture<ObserveSettingsPopup>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ObserveSettingsPopup],
      providers: [
        { 
          provide: DialogRef, 
          useValue: { close: jest.fn() } 
        },
        { 
          provide: ObserverStore, 
          useValue: { 
            updateAnimationDirection: jest.fn(),
            updateSize: jest.fn(),
            updateShowborder: jest.fn(),
            updateShowVetoInfo: jest.fn(),
            updateFullscreen: jest.fn(),
            updateStoreLocally: jest.fn(),
            updateLivePreview: jest.fn(),
            animationStyle: jest.fn().mockReturnValue('test'),
            size: jest.fn().mockReturnValue('test'),
            border: jest.fn().mockReturnValue(false),
            showborder: jest.fn().mockReturnValue(true),
            showVetoInfo: jest.fn().mockReturnValue(true),
            fullscreen: jest.fn().mockReturnValue(false),
            storeLocally: jest.fn().mockReturnValue(true),
            livePreview: jest.fn().mockReturnValue(false)
          } 
        }
      ]
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
