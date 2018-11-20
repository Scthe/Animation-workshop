import {h, Component} from 'preact';
import {observer, inject} from 'mobx-preact';
import {classnames, WithDimensions, Dimensions} from 'ui/utils';
const Styles = require('./TimelineAxis.scss');
import {AppState, TimelineState} from 'state';
import {Tick, createTickPosition, TickLabel} from './TimelineTick';
import {ANIM_FPS} from 'viewport/animation';

const CLASSES_TICK = classnames(Styles.Tick, Styles.TickTime);
const CLASSES_KEYFRAME = classnames(Styles.Tick, Styles.TickKeyframe);
const CLASSES_CURRENT_FRAME = classnames(Styles.Tick, Styles.TickCurrentFrame);

// TODO debounce if needed

interface TimelineAxisProps {
  className?: string;
  dimensions?: Dimensions;
  appState?: AppState;
  timelineState?: TimelineState;
}

interface TimelineAxisState {
  isClicked: boolean;
}


@WithDimensions
@inject('appState')
@inject('timelineState')
@observer
export class TimelineAxis extends Component<TimelineAxisProps, TimelineAxisState> {

  state = {
    isClicked: false,
  };

  public render() {
    const {dimensions, appState} = this.props;
    const {width} = dimensions;
    const tickUnit = appState.showTimeAsSeconds ? TickLabel.Time : TickLabel.FrameId;

    const ticks = this.createTickList(width);
    const keyframes = this.createKeyframesList(width);
    const currFrame = createTickPosition(appState.currentFrame, appState.frameCount, width);

    return (
      <div
        className={this.getClasses()}
        onMouseDown={this.onMouseDown}
        onMouseUp={this.onMouseUp}
        onMouseLeave={this.onMouseUp}
        onMouseMove={this.onMouseMove}
      >
        {ticks.filter(this.isTickInRange).map(t =>
          <Tick key={t.frameId} {...t} className={CLASSES_TICK} labelMode={tickUnit} />)}
        {keyframes.filter(this.isTickInRange).map(t =>
          <Tick key={t.frameId} {...t} className={CLASSES_KEYFRAME} labelMode={TickLabel.None} />)}
        <Tick {...currFrame} className={CLASSES_CURRENT_FRAME} labelMode={TickLabel.None} />

        {this.getPreviewShadows().map((style: any, idx: number) =>
          <div key={idx} className={Styles.PreviewRange} style={style} />)}
      </div>
    );
  }

  private getClasses () {
    const {className} = this.props;
    return classnames(
      Styles.TimelineAxis,
      className,
    );
  }

  private isTickInRange = (tick: any) => {
    const {appState} = this.props;
    return tick.frameId >= 0 && tick.frameId <= appState.frameCount;
  }

  private createTickList (panelWidth: number) {
    const {appState} = this.props;
    const frameCount = appState.frameCount;

    const count = (frameCount - ANIM_FPS + 1) / ANIM_FPS;
    const dummyArr = Array.from(Array(Math.ceil(count))); // [0...count]

    return dummyArr.map((_, i) => {
      const frameId = (i + 1) * ANIM_FPS;
      return createTickPosition(frameId, frameCount, panelWidth);
    });
  }

  private createKeyframesList (panelWidth: number) {
    const {timelineState, appState} = this.props;
    const timeline = timelineState.getTimeline(appState.selectedObjectName) || [];

    return timeline.map(keyframe =>
      createTickPosition(keyframe.frameId, appState.frameCount, panelWidth));
  }

  private onMouseDown = (e: any) => {
    this.setState({ isClicked: true, });
    this.updateCurrentFrameFromEvent(e);
  }

  private onMouseUp = (e: any) => {
    if (!this.state.isClicked) {
      return;
    }
    this.setState({ isClicked: false, });
    this.updateCurrentFrameFromEvent(e);
  }

  private onMouseMove = (e: any) => {
    if (!this.state.isClicked) {
      return;
    }
    this.updateCurrentFrameFromEvent(e);
  }

  private updateCurrentFrameFromEvent (e: any) {
    const {dimensions, appState} = this.props;

    const progress = e.clientX / dimensions.width;
    const frameId = Math.ceil(progress * appState.frameCount) - 1;
    appState.gotoFrame(frameId);
  }

  private getPreviewShadows () {
    const {dimensions, appState} = this.props;
    const frameCount = appState.frameCount;
    const {width} = dimensions;

    const px = appState.previewRange.map((p: number) => (
      createTickPosition(p, frameCount, width).pixelX
    ));

    const result = [];
    result.push({ left: 0, width: `${px[0]}px`, borderRightStyle: 'solid', });
    result.push({ right: 0, width: `${width - px[1]}px`, borderLeftStyle: 'solid', });
    return result;
  }

}
