import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminUi } from './admin-ui';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { RouterModule } from '@angular/router';

describe('AdminUi', () => {
  let component: AdminUi;
  let fixture: ComponentFixture<AdminUi>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminUi, RouterModule.forRoot([])],
      providers: [provideHttpClient(), 
                  provideHttpClientTesting()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminUi);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
