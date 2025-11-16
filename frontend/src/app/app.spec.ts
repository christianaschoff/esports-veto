import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { RemoteService } from './services/remote.service';
import { SocialmediaService } from './services/socialmedia.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { RouterModule } from '@angular/router';
import { SeasonsAndMapsStore } from './store/seasons-maps-store';

describe('App', () => {
  beforeEach(async () => {
    const mockStore = {
      seasons: jest.fn().mockReturnValue(new Map()),
      maps: jest.fn().mockReturnValue([]),
      isLoading: jest.fn().mockReturnValue(false),
      loadSeasons: jest.fn().mockResolvedValue(undefined),
    };
    await TestBed.configureTestingModule({
      imports: [App, RouterModule.forRoot([])],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: SocialmediaService, useValue: { fallbackMetaTags: () => 'none' } }
      ]
    }).compileComponents();
    TestBed.overrideProvider(SeasonsAndMapsStore, { useValue: mockStore });
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render title', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Esports Veto made easy');
  });
});
