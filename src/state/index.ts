import {AppState} from './AppState';
import {TimelineState} from './TimelineState';
import {UIBridge} from './UI_Bridge';
import {
  STORAGE,
  autoSave,
  serialize, deserialize
} from './storage';

export * from './AppState';
export * from './TimelineState';
export * from './UI_Bridge';

const AUTOSAVE_DEBOUNCE = 300;
const STORAGE_KEY = 'TimelineState';


// create state objects
export const appState = new AppState();
export const timelineState = (() => {
  const item = STORAGE.get(STORAGE_KEY);
  console.log(`loaded...`, item);
  const initVal = deserialize(item);
  return new TimelineState(initVal);
})();
export const uiBridge = new UIBridge(appState, timelineState);

// hook up autosave after each keyframe operation
autoSave<TimelineState>(timelineState, (state: TimelineState) => {
  // state is actually a plain object that does not have any special observers etc.
  // console.log(`saving...`, state);
  const item = serialize(state);
  if (item) {
    STORAGE.set(STORAGE_KEY, item);
  }
}, AUTOSAVE_DEBOUNCE);
