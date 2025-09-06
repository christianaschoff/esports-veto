export interface ObserverConfig {
    autoplay: boolean,
    animationStyle: AnimationStyle,
    border: boolean,
    size: Size,
    fullscreen: boolean,
    fadePrevious: boolean,
    showVetoInfo: boolean,
    storeLocally: boolean,
    livePreview: boolean,
}

export enum Size {
    FULLHD = '0',
    HDREADY = '1',
}

export enum AnimationStyle {
  LEFT = '0',
  TOP = '1',
  BOTTOM = '2',
  RIGHT = '3',
}
