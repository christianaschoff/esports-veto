import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NoActiveSessions } from './no-active-sessions';

describe('NoActiveSessions', () => {
  let component: NoActiveSessions;
  let fixture: ComponentFixture<NoActiveSessions>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NoActiveSessions]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NoActiveSessions);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
