import { withDevtools } from "@angular-architects/ngrx-toolkit";
import { HttpClient } from "@angular/common/http";
import { inject } from "@angular/core";
import { signalStore, withState, withMethods, patchState } from "@ngrx/signals";
import { lastValueFrom } from "rxjs";
import { Season } from "../data/seasons.data";
import { Maps } from "../data/maps.data";
import { GameModes } from "../data/gamemodes.data";

type SeasonsAndMapsState = {  
    isLoading: boolean;  
    seasons: Map<GameModes, Season[]>;
    maps:Maps[];
};

const seasonsAndMapsState: SeasonsAndMapsState = {
    isLoading: false,
    seasons: new Map<GameModes, Season[]>(),
    maps: [],
};

export const SeasonsAndMapsStore = signalStore(
    { providedIn: 'root' },
    withDevtools('seasonsAndMapsState'),
    withState(seasonsAndMapsState),
    withMethods((store, httpClient = inject(HttpClient)) => ({
        async loadSeasons(): Promise<void> {
            patchState(store, {isLoading: true});            
            const seasonsMaps1v1 =  await lastValueFrom(httpClient.get<Season[]>('/maps/starcraft2/starcraft2.1v1.seasons-to-maps.json'));
            const seasonsMaps2v2 =  await lastValueFrom(httpClient.get<Season[]>('/maps/starcraft2/starcraft2.2v2.seasons-to-maps.json'));
            const seasonsMaps3v3 =  await lastValueFrom(httpClient.get<Season[]>('/maps/starcraft2/starcraft2.3v3.seasons-to-maps.json'));
            const seasonsMaps4v4 =  await lastValueFrom(httpClient.get<Season[]>('/maps/starcraft2/starcraft2.4v4.seasons-to-maps.json'));
            const maps1v1 = await lastValueFrom(httpClient.get<Maps[]>('/maps/starcraft2/starcraft2.1v1.json'));
            const maps2v2 = await lastValueFrom(httpClient.get<Maps[]>('/maps/starcraft2/starcraft2.2v2.json'));
            const maps3v3 = await lastValueFrom(httpClient.get<Maps[]>('/maps/starcraft2/starcraft2.3v3.json'));
            const maps4v4 = await lastValueFrom(httpClient.get<Maps[]>('/maps/starcraft2/starcraft2.4v4.json'));

            if(seasonsMaps1v1) {                
                const seasons1v1Tmp: Season[] = [];
                seasonsMaps1v1.reverse().forEach (x => seasons1v1Tmp.push(x));
                const seasons2v2Tmp: Season[] = [];
                seasonsMaps2v2.reverse().forEach (x => seasons2v2Tmp.push(x));
                const seasons3v3Tmp: Season[] = [];
                seasonsMaps3v3.reverse().forEach (x => seasons3v3Tmp.push(x));
                const seasons4v4Tmp: Season[] = [];
                seasonsMaps4v4.reverse().forEach (x => seasons4v4Tmp.push(x));
                patchState(store, (state) => {
                    const seasons = new Map(state.seasons);
                    seasons.set(GameModes.M1V1, seasons1v1Tmp);
                    seasons.set(GameModes.M2V2, seasons2v2Tmp);
                    seasons.set(GameModes.M3V3, seasons3v3Tmp);
                    seasons.set(GameModes.M4V4, seasons4v4Tmp);
                    return { seasons };
                });                
            }

            const allMaps: Maps[] = [];
            allMaps.push(...maps1v1);
            allMaps.push(...maps2v2);
            allMaps.push(...maps3v3);
            allMaps.push(...maps4v4);            
            if(allMaps) {             
                patchState(store, { maps: allMaps });
            }

            patchState(store, {isLoading: false});
        }        
    }))
);