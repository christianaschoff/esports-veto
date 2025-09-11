import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateUi } from './create-ui';
import { RemoteService } from '../../services/remote.service';
import { GamesService } from '../../services/games.service';
import { BreadcrumbService } from '../../services/breadcrumb.service';
import { SocialmediaService } from '../../services/socialmedia.service';

describe('CreateUi', () => {
  let component: CreateUi;
  let fixture: ComponentFixture<CreateUi>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateUi],
      providers: [
        { provide: RemoteService, useValue: { versionInfo: jest.fn().mockReturnValue('1234') } },
        { provide: GamesService, useValue: { getData: jest.fn().mockReturnValue([]) } },
        { provide: BreadcrumbService, useValue: { addPath: jest.fn() } },
        { provide: SocialmediaService, useValue: { fallbackMetaTags: jest.fn() } }
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
