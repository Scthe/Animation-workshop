import {AppState} from './AppState';
import {TimelineState} from './TimelineState';


// consts
export const MAX_MARKER_SIZE = 20;
export const MAX_GIZMO_SIZE = 20;

// state
export {AppState, TimelineState};
export const appState = new AppState();
export const timelineState = new TimelineState();
