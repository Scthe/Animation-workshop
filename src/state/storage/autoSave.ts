import {autorun, toJS} from 'mobx';

// based on https://stackoverflow.com/questions/40292677/how-to-save-mobx-state-in-sessionstorage

export const autoSave = <T>(store: T, save: (state: T) => void, debounce = 300) => {
  let firstRun = true;

  autorun(() => {
    const json = toJS(store); // has to be outside 'if' for mobx observer to register
    if (!firstRun) {
      save(json);
    }

    firstRun = false;
  }, { delay: debounce });
};
