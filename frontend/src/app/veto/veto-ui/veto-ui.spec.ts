import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VetoUi } from './veto-ui';
import { RouterModule } from '@angular/router';
import { SocialmediaService } from '../../services/socialmedia.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { SignalrService } from '../../services/signalr.service';

describe('VetoUi', () => {
  let component: VetoUi;
  let fixture: ComponentFixture<VetoUi>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VetoUi, RouterModule.forRoot([])],
      providers: [provideHttpClient(), 
                  provideHttpClientTesting(),
                  { provide: SignalrService, useValue: { joinVetoHub: () => {}, leave: () => {}}}
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VetoUi);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
