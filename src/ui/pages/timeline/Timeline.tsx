import {h, Component} from 'preact';
import {observer, inject} from 'mobx-preact';
import {classnames} from 'ui/utils';
const Styles = require('./Timeline.scss');
import {AppState} from 'ui/state';
import {TimelineButtonRow} from './TimelineButtonRow';
import {TimelineAxis} from './TimelineAxis';
import {Button, ButtonTheme, FaIcon} from 'ui/components';


interface TimelineProps {
  className?: string;
  appState?: AppState;
}


@inject('appState')
@observer
export class Timeline extends Component<TimelineProps, any> {

  public render() {
    return (
      <div className={this.getClasses()}>
        <TimelineButtonRow />
        <TimelineAxis />
        {this.renderPauseButton()}
      </div>
    );
  }

  private renderPauseButton () {
    const {appState} = this.props;
    if (!appState.isPlaying) { return null; }

    return (
      <div className={Styles.IsPlayingOverlay}>
        <div className={Styles.PauseBtnWrapper}>
          <Button onClick={this.onPause} theme={ButtonTheme.Beige} className={Styles.PauseBtn}>
            <FaIcon svg={require('fa/faPause')} />
          </Button>
        </div>
      </div>
    );
  }

  private getClasses () {
    const {className} = this.props;
    return classnames(
      Styles.Timeline,
      className,
    );
  }

  private onPause = () => {
    const {appState} = this.props;
    appState.isPlaying = false;
  }

}
