import {AppState} from './AppState';
import {TimelineState} from './TimelineState';
import {UIBridge} from './UI_Bridge';

export const appState = new AppState();
export const timelineState = new TimelineState();
export const uiBridge = new UIBridge(appState, timelineState);

export * from './AppState';
export * from './TimelineState';
export * from './UI_Bridge';
