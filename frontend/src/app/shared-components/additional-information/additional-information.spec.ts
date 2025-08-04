import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdditionalInformation } from './additional-information';

describe('AdditionalInformation', () => {
  let component: AdditionalInformation;
  let fixture: ComponentFixture<AdditionalInformation>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdditionalInformation]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdditionalInformation);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
