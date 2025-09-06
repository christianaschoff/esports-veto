import { withDevtools } from "@angular-architects/ngrx-toolkit";
import { signalStore, withState, withMethods, patchState } from "@ngrx/signals";
import { Version } from "../data/version.data";

type GlobalState = {
    observerViewActive: boolean;
    isLoading: boolean;
    version: string;
};

const initialGlobalState: GlobalState = {
    observerViewActive: false,
    isLoading: false,
    version: ''
};

export const GlobalStore = signalStore(
    { providedIn: 'root' },
    withDevtools('globalState'),
    withState(initialGlobalState),
    withMethods((store) => ({
        setIsObserverView(isVisible: boolean) {
            patchState(store, (state) => ({ observerViewActive: isVisible }));
        },
        setLoading(isLoading: boolean): void {
            patchState(store, (state) => ({ isLoading: isLoading }));
        },
        setVersion(version: Version) {
            patchState(store, (state) => ({ version: version.version }));
        }
    }))
);
