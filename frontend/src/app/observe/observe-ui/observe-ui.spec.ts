import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ObserveUi } from './observe-ui';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { SignalrService } from '../../services/signalr.service';
import { RouterModule } from '@angular/router';

describe('ObserveUi', () => {
  let component: ObserveUi;
  let fixture: ComponentFixture<ObserveUi>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ObserveUi, RouterModule.forRoot([])],
      providers: [provideHttpClient(), 
                  provideHttpClientTesting(),
                { provide: SignalrService, useValue: { joinVetoHub: () => {} } }]
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
