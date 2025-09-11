import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VetoSystem } from './veto-system';
import { VetoConfigurationStore } from '../../../../store/veto-configuration-store';
import { VetoConstellationService } from '../../../../services/veto-constellation.service';
import { signal } from '@angular/core';
import { VETO_ACTION, VetoRound } from '../../../../data/veto-constellation.data';

describe('VetoSystem', () => {
  let component: VetoSystem;
  let fixture: ComponentFixture<VetoSystem>;
  let mockVetoStore: any;
  let mockVetoService: jest.Mocked<VetoConstellationService>;

  beforeEach(async () => {
    // Create mock store with all signal methods that the template accesses
    mockVetoStore = {
      constellation: jest.fn().mockReturnValue(signal([])),
      updateVetoSystem: jest.fn(),
      modus: jest.fn().mockReturnValue('M1V1'),
      bestOf: jest.fn().mockReturnValue('BO3'),
      vetoSystem: jest.fn().mockReturnValue('ABBA'),
      vetoTitle: jest.fn().mockReturnValue('Test Match'),
    };

    // Create mock service
    mockVetoService = {
      calculate: jest.fn(),
    } as any;

    await TestBed.configureTestingModule({
      imports: [VetoSystem],
      providers: [
        { provide: VetoConfigurationStore, useValue: mockVetoStore },
        { provide: VetoConstellationService, useValue: mockVetoService }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VetoSystem);
    component = fixture.componentInstance;
    // Don't call fixture.detectChanges() yet to avoid template rendering issues
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should initialize isVetoDetailsVisible signal to false', () => {
      expect(component.isVetoDetailsVisible()).toBe(false);
    });

    it('should expose GameModes and BestOf enums', () => {
      expect(component.GameModes).toBeDefined();
      expect(component.BestOf).toBeDefined();
    });
  });

  describe('Computed Signals', () => {
    it('should compute vetoOveral correctly', () => {
      const mockVetoData: VetoRound[] = [
        { step: 1, actionType: VETO_ACTION.VETO, playerName: 'Player A' },
        { step: 2, actionType: VETO_ACTION.PICK, playerName: 'Player B' },
        { step: 3, actionType: VETO_ACTION.VETO, playerName: 'Player A' }
      ];

      mockVetoService.calculate.mockReturnValue(mockVetoData);

      const result = component.vetoOveral();
      expect(result).toEqual(mockVetoData);
      expect(mockVetoService.calculate).toHaveBeenCalledWith(mockVetoStore.constellation());
    });

    it('should filter veto actions correctly', () => {
      const mockVetoData: VetoRound[] = [
        { step: 1, actionType: VETO_ACTION.VETO, playerName: 'Player A' },
        { step: 2, actionType: VETO_ACTION.PICK, playerName: 'Player B' },
        { step: 3, actionType: VETO_ACTION.VETO, playerName: 'Player A' }
      ];

      mockVetoService.calculate.mockReturnValue(mockVetoData);

      const vetoActions = component.veto();
      expect(vetoActions.length).toBe(2);
      expect(vetoActions.every(action => action.actionType === VETO_ACTION.VETO)).toBe(true);
    });

    it('should filter pick actions correctly', () => {
      const mockVetoData: VetoRound[] = [
        { step: 1, actionType: VETO_ACTION.VETO, playerName: 'Player A' },
        { step: 2, actionType: VETO_ACTION.PICK, playerName: 'Player B' },
        { step: 3, actionType: VETO_ACTION.PICK, playerName: 'Player A' }
      ];

      mockVetoService.calculate.mockReturnValue(mockVetoData);

      const pickActions = component.pick();
      expect(pickActions.length).toBe(2);
      expect(pickActions.every(action => action.actionType === VETO_ACTION.PICK)).toBe(true);
    });
  });

  describe('showHideVeto()', () => {
    it('should toggle isVetoDetailsVisible from false to true', () => {
      expect(component.isVetoDetailsVisible()).toBe(false);

      component.showHideVeto();

      expect(component.isVetoDetailsVisible()).toBe(true);
    });

    it('should toggle isVetoDetailsVisible from true to false', () => {
      component.isVetoDetailsVisible.set(true);

      component.showHideVeto();

      expect(component.isVetoDetailsVisible()).toBe(false);
    });
  });

  describe('setVetoSystem()', () => {
    it('should call updateVetoSystem on the store with provided value', () => {
      const testSystem = 'test-system';

      component.setVetoSystem(testSystem);

      expect(mockVetoStore.updateVetoSystem).toHaveBeenCalledWith(testSystem);
    });
  });
});
