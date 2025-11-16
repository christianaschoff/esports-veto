import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdditionalInformation } from './additional-information';
import { SeasonsAndMapsStore } from '../../../../store/seasons-maps-store';

describe('AdditionalInformation', () => {
  let component: AdditionalInformation;
  let fixture: ComponentFixture<AdditionalInformation>;

  beforeEach(async () => {
    const mockStore = {
      seasons: jest.fn().mockReturnValue(new Map()),
      maps: jest.fn().mockReturnValue([]),
      isLoading: jest.fn().mockReturnValue(false),
      loadSeasons: jest.fn().mockResolvedValue(undefined),
    };

    await TestBed.configureTestingModule({
      imports: [AdditionalInformation],
      providers: []
    })
    .compileComponents();
    TestBed.overrideProvider(SeasonsAndMapsStore, { useValue: mockStore });

    fixture = TestBed.createComponent(AdditionalInformation);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
