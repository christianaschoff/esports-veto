import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Qrcode } from './qrcode';
import { ATTENDEE_TYPE } from '../../../../data/veto-constellation.data';

describe('Qrcode', () => {
  let component: Qrcode;
  let fixture: ComponentFixture<Qrcode>;

  const mockUrl = {
  createObjectURL: jest.fn().mockReturnValue('mock-url'),
  revokeObjectURL: jest.fn()
};


  beforeEach(async () => {

    await TestBed.configureTestingModule({
      imports: [Qrcode],
    })
    .compileComponents();

    Object.defineProperty(window, 'URL', {
      value: mockUrl,
      writable: true
    });
    
    fixture = TestBed.createComponent(Qrcode);
    component = fixture.componentInstance;    
    fixture.componentRef.setInput('data', 'basedata');
    fixture.componentRef.setInput('title', 'my title');
    fixture.componentRef.setInput('type', ATTENDEE_TYPE.ADMIN);
    
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
