import { patchState, signalStore, withMethods, withState } from "@ngrx/signals";
import { BestOf, GameModes } from "../data/gamemodes.data";
import { withDevtools } from "@angular-architects/ngrx-toolkit";
import { MapsService } from "../services/maps.service";
import { computed, inject } from "@angular/core";

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
        toggleLoading(): void {
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
