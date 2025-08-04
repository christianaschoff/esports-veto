import { patchState, signalStore, withMethods, withState } from "@ngrx/signals";
import { BestOf, GameModes } from "../data/gamemodes.data";
import { withDevtools } from '@angular-architects/ngrx-toolkit';
import { computed, inject } from "@angular/core";
import { RemoteService } from "../services/remote.service";
import { MapsService } from "../services/maps.service";
import { Veto, VetoState as vs } from "../data/veto.data";
import { AnimationStyle, OberserverConfig, Size } from "../data/oberserver.data";
import { LocalStorageService } from "../services/local-storage.service";


type GlobalState = {
    observerViewActive: boolean;
};

const initialGlobalState : GlobalState = {
    observerViewActive: false,
};

export const GlobalStore = signalStore(
    {providedIn: 'root'},
    withDevtools('globalState'),
    withState(initialGlobalState),
    withMethods((store) => ({
        setIsOberserverView(isVisible: boolean) {
            patchState(store,(state) => ({ observerViewActive: isVisible }))
        },
    }))   
);

type VetoConfigurationState = {
    isLoading: boolean;
    bestOf: BestOf;
    modus: GameModes;
    vetoSystem: string;
    vetoTitle: string;
    playerA: string;
    playerB: string;
    gameId: string;
}

const initialVetoConfigurationState: VetoConfigurationState = {
    isLoading: false,
    bestOf: BestOf.UNSET,
    modus: GameModes.UNSET,
    vetoSystem: '',
    vetoTitle: '',
    playerA: '',
    playerB: '',
    gameId: ''
};

export const VetoConfigurationStore = signalStore(
    {providedIn: 'root'},
    withDevtools('creationState'),
    withState(initialVetoConfigurationState),
    withMethods((store, mapService = inject(MapsService)) => ({
        setLoading(): void {
            patchState(store, (state) => ( { isLoading: !state.isLoading}))
        },
        updateBestOf(bestOf: BestOf) {
            patchState(store, (state) => ( { bestOf: bestOf}))
        },
        updateModus(gameMode: GameModes) {
            patchState(store, (state) => ( { modus: gameMode}))
        },
        updateVetoSystem(vetosystem: string) {
            patchState(store, (state) => ( { vetoSystem: vetosystem}))
        },
        updateVetoTitle(title: string) {
            patchState(store, (state) => ( { vetoTitle: title}))
        },
        updatePlayerA(playername: string) {
            patchState(store, (state) => ( { playerA: playername}))
        },
        updatePlayerB(playername: string) {
            patchState(store, (state) => ( { playerB: playername}))
        },
        updateGameId(gameId: string) {
            patchState(store, (state) => ( { gameId: gameId}))
        },
        reset() {
            patchState(store, initialVetoConfigurationState);
        },
        constellation: computed(() => {
            const namePlayerA = store.playerA().length > 0 ? store.playerA() : 'Player A'
            const namePlayerB = store.playerB().length > 0 ? store.playerB() : 'Player B';
            const matchtitle = store.vetoTitle().length > 0 ? store.vetoTitle() : 'Match';

            const mapsList = mapService.getMaps(store.gameId(), store.modus());
            let mapNames: string[] = [];
            if(mapsList) {
                mapNames = mapsList.map(x => x.name);
            }
            return {
                bestOf: store.bestOf(),
                playerA: namePlayerA,
                playerB: namePlayerB,
                title: matchtitle,
                vetoSystem: store.vetoSystem(),
                gameid: store.gameId(),
                mode: store.modus(),
                maps: mapNames
            }
        }),
    })
  )
);


type VetoAttendeeState = {
    userName: string;
    userId: string;
    vetoId: string;
}

const initialAttendeeState = {
    userName: '',
    userId: '',
    vetoId: ''
}
const initVeto: Veto = {
   vetoState: vs.VETO_UNSET,
   vetoSteps: [],
};

type VetoState = {
    isLoading: boolean;
    attendee: VetoAttendeeState;
    bestOf: BestOf;
    modus: GameModes;
    vetoSystem: string;
    vetoTitle: string;
    playerA: string;
    playerB: string;
    gameId: string;
    maps: string[];
    currentGameState: Veto;
}

const initialVetoState: VetoState = {
    isLoading: false,
    attendee: initialAttendeeState,
    bestOf: BestOf.UNSET,
    modus: GameModes.UNSET,
    vetoSystem: '',
    vetoTitle: '',
    playerA: '',
    playerB: '',
    gameId: '',
    maps: [],
    currentGameState: initVeto,
};

export const VetoStore = signalStore(
   {providedIn: 'root'},
   withDevtools('VetoState'),
   withState(initialVetoState),
   withMethods((store, remoteService = inject(RemoteService)) => ({
        setLoading(): void {
            patchState(store, (state) => ( {isLoading: !state.isLoading}))
        },
        updateCurrentGameState(vetoState: Veto) {
            patchState(store,(state) => ({currentGameState: vetoState }));
        },
        reset() {
            patchState(store, initialVetoState);
        },        
        async joinSession(attendee: string, id: string): Promise<void> {
             this.setLoading();
            const data = await remoteService.joinSessionAsync(attendee, id);
            if(data) {
                patchState(store, (state)=> ({attendee: {...data }}))
            }
            this.setLoading();
        },
        
        async loadByVetoId(vetoId: string): Promise<void> {
            this.setLoading();

            const data = await remoteService.receiveVetoBaseInformationAsync(vetoId);
            if(data) {                
                const boKey = data.bestOf as keyof typeof BestOf;
                const modusKey = data.mode as keyof typeof GameModes;
                console.log(data, boKey, modusKey);

                patchState(store, (state) => ({bestOf: data.bestOf as BestOf, 
                                   modus: data.mode as GameModes, 
                                   vetoSystem: data.vetoSystem, 
                                   vetoTitle: data.title, 
                                   playerA: data.playerA, 
                                   playerB: data.playerB,
                                   maps: data.maps,
                                   gameId: data.gameId
                                   }));
            }
            this.setLoading();
        }
     })
   )
);


const initialObserverState: OberserverConfig = {
    autoplay: false,
    animationStyle: AnimationStyle.LEFT,
    border: false,
    fullscreen: false,
    size: Size.FULLHD,        
    fadePrevious: false,
    showVetoInfo: true,
    storeLocally: false,
    livePreview: false,
}

export const ObserverStore = signalStore(
   {providedIn: 'root'},
   withDevtools('ObserverState'),
   withState(initialObserverState),
   withMethods((store, localStorage = inject(LocalStorageService)) => ({      
        updateAnimationDirection(direction: AnimationStyle) {
            patchState(store, (state) => ( { animationStyle: direction}));
            this.saveToLocalStorage();
        },        
        updateSize(size: Size) {
            patchState(store, (state) => ( { size: size}));
            this.saveToLocalStorage();
        },
        updateShowborder(show: boolean) {
            patchState(store, (state) => ( { border: show}));
            this.saveToLocalStorage();
        },
        updateShowVetoInfo(show: boolean) {
            patchState(store, (state) => ( { showVetoInfo: show}));
            this.saveToLocalStorage();
        }, 
        updateFullscreen(show: boolean) {
            patchState(store, (state) => ( { fullscreen: show}));
            this.saveToLocalStorage();
        }, 
        updateLivePreview(show: boolean) {
            patchState(store, (state) => ( { livePreview: show}));
            this.saveToLocalStorage();
        },    
        updateStoreLocally(show: boolean) {
            patchState(store, (state) => ( { storeLocally: show}));
            if(show) {
                this.saveToLocalStorage();
            } else {
                this.deleteLocalStorage();
            }
        },
        saveToLocalStorage() {
            if(store.storeLocally()) {
                localStorage.save({
                        autoplay: store.autoplay(),
                        animationStyle: store.animationStyle(),
                        border: store.border(),
                        fullscreen: store.fullscreen(),
                        size: store.size(),
                        fadePrevious: store.fadePrevious(),
                        showVetoInfo: store.showVetoInfo(),
                        livePreview: store.livePreview(),
                        storeLocally: store.storeLocally()
                    });
            }
        },
        loadFromStorage() {
            const config = localStorage.load();
            if(config) {
                patchState(store, (state) => ({
                    autoplay: config.autoplay,
                    animationStyle: config.animationStyle,
                    border: config.border,
                    fullscreen: config.fullscreen,
                    size: config.size,
                    fadePrevious: config.fadePrevious,
                    showVetoInfo: config.showVetoInfo,
                    livePreview: config.livePreview,
                    storeLocally: config.storeLocally
                }));
            }
        },
        deleteLocalStorage() {
            localStorage.remove();
        }
   })
));
