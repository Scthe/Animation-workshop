import {h, Component} from 'preact';
import {init} from 'viewport/main';
import * as Styles from './App.scss';
import {FaIcon} from './components/FaIcon';
import {timerData} from './state';

// TODO check for updates for package.json e.g. typescript 3.0 (yarn upgrade)
// TODO modify classes based on mode (fullscreen/normal etc.)
// TODO use mini-css-extract-plugin to extract css to file?

// NOTE: we do not want <canvas> in any HOC or whatever weird
//       thing may happen. Anything unexpected happens
//       to <canvas> and app may crash. (Though probably
//       just context lost)


////////////////////////
import {observer, inject, Provider} from 'mobx-preact';

@observer
class StateTest extends Component<any, any> {
  render () {
    const {timerData} = this.props;
    return (
      <div>Seconds passed 1: { timerData.secondsPassed % 60 }</div>
    );
  }
}

const StateTest2 = observer(({ timerData }) =>
  <div>Seconds passed 2: {timerData.secondsPassed}</div>);

@inject('timerData')
@observer
class StateTest3 extends Component<any, any> {
  render () {
    const {timerData} = this.props;
    return (
      <div>Seconds passed 3: { timerData.secondsPassed % 60 }</div>
    );
  }
}

////////////////////////

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
    // initViewport();
  }

  public render() {
    return (
      <div className='App'>
        <canvas id='anim-canvas' className={Styles.animCanvasClass}></canvas>
        <Provider timerData={timerData}>
          <StateTest timerData={timerData}/>
          <StateTest2 timerData={timerData}/>
          <StateTest3 />
          <FaIcon svg={require('fa/faBone')}/>
          {/* timeline, settings panel here */}
        </Provider>
      </div>
    );
  }

}
