import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateUi } from './create-ui';
import { RemoteService } from '../../services/remote.service';
import { GlobalStore } from '../../store/global-store';

describe('CreateUi', () => {
  let component: CreateUi;
  let fixture: ComponentFixture<CreateUi>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateUi, GlobalStore],
      providers: [
        {provide: RemoteService, useValue: {versionInfo: () => '1234'} }
      ]
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
