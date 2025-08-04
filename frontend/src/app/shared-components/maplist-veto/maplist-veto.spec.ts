import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MaplistVeto } from './maplist-veto';

describe('MaplistVeto', () => {
  let component: MaplistVeto;
  let fixture: ComponentFixture<MaplistVeto>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MaplistVeto]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MaplistVeto);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
