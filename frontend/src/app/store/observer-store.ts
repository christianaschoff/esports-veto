import { patchState, signalStore, withMethods, withState } from "@ngrx/signals";
import { withDevtools } from '@angular-architects/ngrx-toolkit';
import { inject } from "@angular/core";

import { AnimationStyle, ObserverConfig, Size } from "../data/observer.data";
import { LocalStorageService } from "../services/local-storage.service";


const initialObserverState: ObserverConfig = {
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
