import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Qrcode } from './qrcode';
import { DOCUMENT } from '@angular/core';

describe('Qrcode', () => {
  let component: Qrcode;
  let fixture: ComponentFixture<Qrcode>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Qrcode],
      providers: [
        { 
          provide: DOCUMENT, 
          useValue: {
            location: {
              protocol: 'http:',
              hostname: 'localhost',
              port: '4200'
            },
            querySelectorAll: jest.fn(),
            createElement: jest.fn().mockReturnValue({ 
              setAttribute: jest.fn() 
            })
          } 
        }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Qrcode);
    component = fixture.componentInstance;
    // Set required inputs to avoid NG0950 error
    (component as any).data.set('test-data');
    (component as any).title.set('test-title');
    (component as any).type.set(0);
    
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
