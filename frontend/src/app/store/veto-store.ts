import { patchState, signalStore, withMethods, withState } from "@ngrx/signals";
import { BestOf, GameModes } from "../data/gamemodes.data";
import { withDevtools } from "@angular-architects/ngrx-toolkit";
import { inject } from "@angular/core";
import { GlobalStore } from "./global-store";
import { RemoteService } from "../services/remote.service";
import { Veto, VetoState as vs } from "../data/veto.data";

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
    hasErrors: boolean;
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
    hasErrors: false,
};

export const VetoStore = signalStore(
   {providedIn: 'root'},
   withDevtools('VetoState'),
   withState(initialVetoState),
   withMethods((store, globalStore = inject(GlobalStore), remoteService = inject(RemoteService)) => ({
        toggleLoading(): void {
            patchState(store, (state) => ( {isLoading: !state.isLoading}))
            globalStore.setLoading(store.isLoading());
        },

        setHasErrors(errors: boolean): void {
            patchState(store, (state) => ( {hasErrors: errors}))
        },

        updateCurrentGameState(vetoState: Veto) {
            patchState(store,(state) => ({currentGameState: vetoState }));
        },
        reset() {
            patchState(store, initialVetoState);
        },

        async joinSession(attendee: string, id: string): Promise<void> {
            this.toggleLoading();
            this.setHasErrors(false);
            const data = await remoteService.joinSessionAsync(attendee, id)
                .catch(error => this.setHasErrors(true));
            if(data) {
                patchState(store, (state)=> ({attendee: {...data }}))
            }
            this.toggleLoading();
        },
        
        async loadByVetoId(vetoId: string): Promise<void> {
            this.toggleLoading();
            this.setHasErrors(false);

            const data = await remoteService.receiveVetoBaseInformationAsync(vetoId)                    
                    .catch(error => this.setHasErrors(true)
                    );

            if(data) {                
                patchState(store, (state) => ({bestOf: data.bestOf as BestOf, 
                                   modus: data.mode as GameModes, 
                                   vetoSystem: data.vetoSystem, 
                                   vetoTitle: data.title, 
                                   playerA: data.playerA, 
                                   playerB: data.playerB,
                                   maps: data.maps,
                                   gameId: data.gameId,
                                   hasErrors: false
                                   }));
            }
  
            this.toggleLoading();
        }
     })
   )
);