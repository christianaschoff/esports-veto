import { TestBed } from '@angular/core/testing';

import { VetoConstellationService } from './veto-constellation.service';

describe('VetoConstellationService', () => {
  let service: VetoConstellationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VetoConstellationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
