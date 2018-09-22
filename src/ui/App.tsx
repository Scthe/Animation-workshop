import {h, Component} from 'preact';
import {Provider} from 'mobx-preact';
const Styles = require('./App.scss');
import {init} from 'viewport/main';
import {appState, timelineState} from './state';
import {Timeline} from './pages/timeline';
import {Settings} from './pages/settings';

/*
play/pause
object tab

key shortcuts
fullscreen
*/

// TODO put font in cache
// TODO animate fullscreen, but refresh webgl context only on anim done
// TODO responsive, or at least disallow mobile
// TODO change background of xyz axis in settings, when manipulating respective axis in 3d
// TODO make PureComponents?


// TODO tslint
// TODO check for updates for package.json e.g. typescript 3.0 (yarn upgrade)
// TODO use mini-css-extract-plugin to extract css to file?

// NOTE: we do not want <canvas> in any HOC or whatever weird
//       thing may happen. Anything unexpected happens
//       to <canvas> and app may crash. (Though probably
//       just context lost)

const initViewport = () => {
  init()
    .then((onDraw: Function) => {
      onDraw(0);
    })
    .catch((e: any) => {
      console.error(`FATAL_ERROR:`, e);
    });
};


export class App extends Component<any, any> {

  public componentDidMount () {
    initViewport();
  }

  public render() {
    return (
      <div className={Styles.App}>
        <div className={Styles.CanvasWrapper}>
          <canvas id='anim-canvas' className={Styles.AnimCanvas}></canvas>
        </div>
        <Provider appState={appState} timelineState={timelineState}>
          <Settings className={Styles.Settings}/>
          <Timeline className={Styles.Timeline}/>
        </Provider>
      </div>
    );
  }

}
