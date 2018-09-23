import {h, Component} from 'preact';
import {observer, inject} from 'mobx-preact';
import {classnames} from 'ui/utils';
const Styles = require('./Timeline.scss');
import {TimelineState} from 'ui/state';
import {TimelineButtonRow} from './TimelineButtonRow';
import {TimelineAxis} from './TimelineAxis';
import {Button, ButtonTheme, FaIcon, Tooltip} from 'ui/components';


interface TimelineProps {
  className?: string;
  timelineState?: TimelineState;
}


@inject('timelineState')
@observer
export class Timeline extends Component<TimelineProps, any> {

  public render() {
    const {className} = this.props;

    return (
      <div className={this.getClasses()}>
        <TimelineButtonRow />
        <TimelineAxis />
        {this.renderPauseButton()}
      </div>
    );
  }

  private renderPauseButton () {
    const {timelineState} = this.props;
    if (!timelineState.isPlaying) { return null; }

    return (
      <div className={Styles.IsPlayingOverlay}>
        <div className={Styles.PauseBtnWrapper}>
          <Button onClick={this.onPause} theme={ButtonTheme.Beige} className={Styles.PauseBtn}>
            <FaIcon svg={require('fa/faPause')}/>
          </Button>
        </div>
      </div>
    );
  }

  private getClasses () {
    const {className, timelineState} = this.props;
    return classnames(
      Styles.Timeline,
      className,
    );
  }

  private onPause = () => {
    const {timelineState} = this.props;
    timelineState.isPlaying = false;
  }

}
