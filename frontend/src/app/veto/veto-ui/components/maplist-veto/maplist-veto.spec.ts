import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MaplistVeto } from './maplist-veto';
import { RouterModule } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('MaplistVeto', () => {
  let component: MaplistVeto;
  let fixture: ComponentFixture<MaplistVeto>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MaplistVeto, RouterModule.forRoot([])],
      providers: [provideHttpClient(), 
            provideHttpClientTesting()]
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
