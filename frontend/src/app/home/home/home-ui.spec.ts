import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeUi } from './home-ui';

describe('Home', () => {
  let component: HomeUi;
  let fixture: ComponentFixture<HomeUi>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeUi]
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
