import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Legal } from './legal';
import { RemoteService } from '../../services/remote.service';
import { LegalNotice } from '../../data/legal.data';

describe('Legal', () => {
  let component: Legal;
  let fixture: ComponentFixture<Legal>;

  const mockLegalNotice: LegalNotice = {
    name: 'Test Name',
    legalEntity: 'Test Entity',
    street: 'Test Street',
    zipcodeTown: '12345 Test Town',
    email: 'test@example.com',
    phoneNumber: '+1234567890'
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Legal],
      providers: [
        { provide: RemoteService, useValue: { getLegalNotice: () => Promise.resolve(mockLegalNotice) } }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Legal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
