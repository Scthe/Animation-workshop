import {h, Component} from 'preact';
import {Provider} from 'mobx-preact';
const Styles = require('./App.scss');
import {init} from 'viewport/main';
import {timerData} from './state';
import {Timeline} from './pages/timeline';
import {Settings} from './pages/settings';

// TODO themes
// TODO font
// TODO tooltips

// TODO check for updates for package.json e.g. typescript 3.0 (yarn upgrade)
// TODO modify classes based on mode (fullscreen/normal etc.)
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
    // <StateTest timerData={timerData}/>
    // <StateTest2 timerData={timerData}/>
    // <StateTest3 />
    // <FaIcon svg={require('fa/faBone')}/>
    return (
      <div className={Styles.App}>
        <div className={Styles.CanvasWrapper}>
          <canvas id='anim-canvas' className={Styles.AnimCanvas}></canvas>
        </div>
        <Provider timerData={timerData}>
          <Settings className={Styles.Settings}/>
          <Timeline className={Styles.Timeline}/>
        </Provider>
      </div>
    );
  }

}
