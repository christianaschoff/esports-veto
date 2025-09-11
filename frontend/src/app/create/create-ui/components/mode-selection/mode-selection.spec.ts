import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModeSelection } from './mode-selection';
import { RouterModule } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('ModeSelection', () => {
  let component: ModeSelection;
  let fixture: ComponentFixture<ModeSelection>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModeSelection, RouterModule.forRoot([])],
      providers: [provideHttpClient(), 
                  provideHttpClientTesting()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModeSelection);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
