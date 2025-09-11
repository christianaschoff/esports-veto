import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Footer } from './footer';
import { RemoteService } from '../../services/remote.service';
import { RouterModule } from '@angular/router';

describe('Footer', () => {
  let component: Footer;
  let fixture: ComponentFixture<Footer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Footer, RouterModule.forRoot([])],
      providers: [ 
        { provide: RemoteService, useValue: { versionInfo: () => 'none' } }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Footer);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
