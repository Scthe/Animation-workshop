import {h, Component} from 'preact';
import {observer, inject} from 'mobx-preact';
import {differenceWith, isEqual, times} from 'lodash';
import {classnames, WithDimensions, Dimensions} from 'ui/utils';
const Styles = require('./TimelineAxis.scss');
import {AppState, TimelineState} from 'state';
import {Tick, createTickPosition, TickLabel} from './TimelineTick';
import {ANIM_FPS, animationSecondsToFrame} from 'viewport/animation';

const CLASSES_TICK = classnames(Styles.Tick, Styles.TickTime);
const CLASSES_KEYFRAME = classnames(Styles.Tick, Styles.TickKeyframe);
const CLASSES_NOT_ACTIVE_KEYFRAME = classnames(Styles.Tick, Styles.TickInActiveKeyframe);
const CLASSES_CURRENT_FRAME = classnames(Styles.Tick, Styles.TickCurrentFrame);


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
    const {appState} = this.props;
    const tickUnit = appState.showTimeAsSeconds ? TickLabel.Time : TickLabel.FrameId;

    const ticks = this.createTickList().filter(this.isTickInRange);
    const currFrame = this.createTickPosition(appState.currentFrame);

    const keyframes = this.createActiveKeyframesList().filter(this.isTickInRange);
    const allKeyframes = this.createAllKeyframesList().filter(this.isTickInRange);
    const inactiveKeyframes = differenceWith(
      allKeyframes, keyframes, isEqual
    );

    return (
      <div
        className={this.getClasses()}
        onMouseDown={this.onMouseDown}
        onMouseUp={this.onMouseUp}
        onMouseLeave={this.onMouseUp}
        onMouseMove={this.onMouseMove}
      >
        {ticks.map(t =>
          <Tick key={t.frameId} {...t} className={CLASSES_TICK} labelMode={tickUnit} />)}
        {inactiveKeyframes.map(t =>
          <Tick key={t.frameId} {...t} className={CLASSES_NOT_ACTIVE_KEYFRAME} labelMode={TickLabel.None} />)}
        {keyframes.map(t =>
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

  private createTickPosition = (frameId: number) => {
    const {dimensions, appState} = this.props;
    return createTickPosition(frameId, appState.frameCount, dimensions.width);
  }

  private createTickList () {
    const {appState} = this.props;
    const frameCount = appState.frameCount;
    const count = (frameCount - ANIM_FPS + 1) / ANIM_FPS;

    return times(Math.ceil(count), i => {
      const frameId = animationSecondsToFrame(i + 1);
      return this.createTickPosition(frameId);
    });
  }

  private createActiveKeyframesList () {
    const {timelineState, appState} = this.props;
    const timeline = timelineState.getTimeline(appState.selectedObjectName) || [];

    return timeline.map(keyframe => this.createTickPosition(keyframe.frameId));
  }

  private createAllKeyframesList () {
    const {timelineState} = this.props;
    return timelineState.framesWithKeyframe.map(this.createTickPosition);
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

    const px = appState.previewRangeSorted.map((p: number) => (
      createTickPosition(p, frameCount, width).pixelX
    ));

    const result = [];
    result.push({ left: 0, width: `${px[0]}px`, borderRightStyle: 'solid', });
    result.push({ right: 0, width: `${width - px[1]}px`, borderLeftStyle: 'solid', });
    return result;
  }

}
