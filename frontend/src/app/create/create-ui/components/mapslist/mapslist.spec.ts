import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Mapslist } from './mapslist';

describe('Mapslist', () => {
  let component: Mapslist;
  let fixture: ComponentFixture<Mapslist>;

  beforeEach(async () => {
    
    await TestBed.configureTestingModule({
      imports: [Mapslist]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Mapslist);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
