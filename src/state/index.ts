import {debounce} from 'lodash';
import {AppState} from './AppState';
import {TimelineState} from './TimelineState';
import {UIBridge} from './UI_Bridge';
import {
  STORAGE,
  autoSave,
  serialize, deserialize
} from './storage';
import {showAlert, AlertType} from 'ui/components';

export * from './AppState';
export * from './TimelineState';
export * from './UI_Bridge';

const AUTOSAVE_DEBOUNCE = 300;
const ALERT_DEBOUNCE = 1000;
const STORAGE_KEY = 'TimelineState';


// create state objects
export const appState = new AppState();
export const timelineState = (() => {
  const item = STORAGE.get(STORAGE_KEY);
  // console.log(`loaded...`, item);
  const initVal = deserialize(item);
  return new TimelineState(initVal);
})();
export const uiBridge = new UIBridge(appState, timelineState);


// will not register dependency on mobx
const showAlert_ = debounce(showAlert, ALERT_DEBOUNCE);

// hook up autosave after each keyframe operation
autoSave<TimelineState>(timelineState, (state: TimelineState) => {
  // state is actually a plain object that does not have any special observers etc.

  try {
    const item = serialize(state);
    if (!item) {
      throw 'Error serializing state';
    }

    STORAGE.set(STORAGE_KEY, item);
    showAlert_({
      msg: 'Changes saved',
      type: AlertType.Success,
      timeout: 1000,
    });

  } catch (e) {
    showAlert_({
      msg: e,
      type: AlertType.Error,
      timeout: 1000,
    });
  }

}, AUTOSAVE_DEBOUNCE);
