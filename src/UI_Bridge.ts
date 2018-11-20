import {pick} from 'lodash';
import {AppState, appState, TimelineState, timelineState} from 'ui/state';

export {AppState, TimelineState}; // easier imports. still, ugh..

// normally in mobx You would add a reaction to bridge the imperative code
// with state. Since we are running infinite loop, we are going to just
// use getters instead

export interface UIState {
  appState: AppState;
  timelineState: TimelineState;
}

type FromStateSetter = (uiState: UIState) => void;

type AppStateGetter = <K extends keyof AppState> (uis: UIState) => Pick<AppState, K>;
type TimelineStateGetter = <K extends keyof TimelineState> (uis: UIState) => Pick<TimelineState, K>;
type FromStateGetter = AppStateGetter | TimelineStateGetter;


// https://blog.mariusschulz.com/2017/01/06/typescript-2-1-keyof-and-lookup-types
// http://www.typescriptlang.org/docs/handbook/advanced-types.html#predefined-conditional-types
export const appStateGetter = <K extends keyof AppState> (...propNames: K[]) => {
  const g = (uiState: UIState) => {
    const {appState} = uiState; // You do not want to know what syntax TS forces to destructure this as parameter
    return pick(appState, propNames);
  };
  return g as AppStateGetter; // this line seems to be required, can't cast in same line as return (uiState: ..)=>...
};

export const appStateSetter = <K extends keyof AppState, V>(key: K, value: AppState[K]) => {
  return (uiState: UIState) => {
    const {appState} = uiState;
    appState[key] = value;
  };
};

class UIBridge {

  getFromUI<fn extends FromStateGetter> (getter: fn) {
    // https://dev.to/miracleblue/how-2-typescript-serious-business-with-typescripts-infer-keyword-40i5
    return getter(this.getStateAsObject()) as ReturnType<fn>;
  }

  setOnUI (setter: FromStateSetter) {
    // just in case
    (window as any).requestAnimationFrame(() => {
      setter(this.getStateAsObject());
    });
  }

  private getStateAsObject () {
    return { appState, timelineState, };
  }
}

export const uiBridge = new UIBridge();
