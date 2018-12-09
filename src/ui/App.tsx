import {h, Component} from 'preact';
import {Provider, observer, inject} from 'mobx-preact';
import {classnames, createRef} from 'ui/utils';
const Styles = require('./App.scss');
import {Button, FaIcon, AlertContainer} from 'ui/components';
import {appState, timelineState} from 'state';
import {Timeline} from './pages/timeline';
import {Settings} from './pages/settings';
import {init} from 'viewport/main'; // NOTE: order of this matters!


// TODO add github btn
// TODO optimize lodash in prod build
// TODO save/load/reset

// TODO put font in cache
// TODO responsive, or at least disallow mobile
// TODO use mini-css-extract-plugin to extract css to file?


// NOTE: we do not want <canvas> in any HOC or whatever weird
//       thing may happen. Anything unexpected happens
//       to <canvas> and app may crash. (Though probably
//       just context lost)

const initViewport = (canvas: HTMLCanvasElement) => {
  init(canvas)
    .then((onDraw: Function) => {
      onDraw(0);
    })
    .catch((e: any) => {
      console.error(`FATAL_ERROR:`, e);
    });
};

const FullscreenButton = inject('appState')(observer((props: any) => {
    const { appState } = props;

    const onFullscreen = () => {
      appState.isFullscreen = !appState.isFullscreen;
    };

    return (
      <div className={Styles.FullscreenBtnWrapper} >
        <Button className={Styles.FullscreenBtn} onClick={onFullscreen} >
          <FaIcon svg={require('fa/faExpandArrowsAlt')} />
        </Button>
      </div>
    );
}));


interface AppState {
  isFullscreenAfterTransition: boolean;
}


@observer
export class App extends Component<any, AppState> {

  private canvasRef = createRef();
  private timelineRef = createRef();

  state = {
    isFullscreenAfterTransition: false,
  };

  public componentDidMount () {
    initViewport(this.canvasRef.current);

    const timelineEl = this.timelineRef.current;
    if (!timelineEl) { throw 'There were problems getting ref for <Timeline>'; }
    timelineEl.base.addEventListener('transitionend', this.onFullscreenTransitionEnd);

    // relayout to show the fullscreen button in lower right corner
    this.forceUpdate();
  }

  public componentWillUnmount () {
    const timelineEl = this.timelineRef.current;
    if (timelineEl) {
      timelineEl.base.removeEventListener('transitionend', this.onFullscreenTransitionEnd);
    }
  }

  public render() {
    return (
      <div className={this.getClasses()}>

        <div className={Styles.CanvasWrapper}>
          <canvas id='anim-canvas' className={Styles.AnimCanvas} ref={this.canvasRef} />
        </div>

        <Provider appState={appState} timelineState={timelineState}>
          <Settings className={Styles.Settings} />
          <Timeline className={Styles.Timeline} ref={this.timelineRef} />
          <FullscreenButton />
          <AlertContainer />
        </Provider>

      </div>
    );
  }

  private getClasses () {
    const {className, timelineState} = this.props;
    const {isFullscreenAfterTransition} = this.state;

    return classnames(
      Styles.App,
      {[Styles.AppFullscreen]: appState.isFullscreen},
      {[Styles.AppFullscreenAfterTransition]: isFullscreenAfterTransition},
    );
  }

  private onFullscreenTransitionEnd = (e: any) => {
    this.setState({
      isFullscreenAfterTransition: appState.isFullscreen,
    });
  }

}
