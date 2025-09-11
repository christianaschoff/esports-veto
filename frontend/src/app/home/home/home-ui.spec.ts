import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeUi } from './home-ui';
import { RouterModule } from '@angular/router';

describe('Home', () => {
  let component: HomeUi;
  let fixture: ComponentFixture<HomeUi>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeUi, RouterModule.forRoot([])]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomeUi);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
