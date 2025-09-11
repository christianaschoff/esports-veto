import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VetoPopup } from './veto-popup';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';

describe('VetoPopup', () => {
  let component: VetoPopup;
  let fixture: ComponentFixture<VetoPopup>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VetoPopup],
      providers: [
        { 
          provide: DIALOG_DATA, 
          useValue: { mapname: 'test', mapimage: 'test.jpg', isVeto: true } 
        },
        { 
          provide: DialogRef, 
          useValue: { close: jest.fn() } 
        }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VetoPopup);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
