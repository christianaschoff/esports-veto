import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateUi } from './create-ui';

describe('CreateUi', () => {
  let component: CreateUi;
  let fixture: ComponentFixture<CreateUi>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateUi]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateUi);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
