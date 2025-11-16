import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Mapslist } from './mapslist';
import { SeasonsAndMapsStore } from '../../../../store/seasons-maps-store';

describe('Mapslist', () => {
  let component: Mapslist;
  let fixture: ComponentFixture<Mapslist>;

  beforeEach(async () => {
    const mockStore = {
      seasons: jest.fn().mockReturnValue(new Map()),
      maps: jest.fn().mockReturnValue([]),
      isLoading: jest.fn().mockReturnValue(false),
      loadSeasons: jest.fn().mockResolvedValue(undefined),
    };

    await TestBed.configureTestingModule({
      imports: [Mapslist],
      providers: []
    })
    .compileComponents();
    TestBed.overrideProvider(SeasonsAndMapsStore, { useValue: mockStore });

    fixture = TestBed.createComponent(Mapslist);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
