import {h, Component} from 'preact';
import {classnames, WithDimensions, Dimensions, clamp} from 'ui/utils';
const Styles = require('./TimelineAxis.scss');
import {Tick, createTickPosition, TickLabel} from './TimelineTick';

const TICK_SPACING = 24;
const MAX_FRAMES = 240;
const KEYFRAMES = [5, 15, 20, 120, 150];

const CLASSES_TICK = classnames(Styles.Tick, Styles.TickTime);
const CLASSES_KEYFRAME = classnames(Styles.Tick, Styles.TickKeyframe);
const CLASSES_CURRENT_FRAME = classnames(Styles.Tick, Styles.TickCurrentFrame);

// TODO remove [keyframes, ticks] > MAX_FRAMES, as would render weirdly
// TODO debounce

interface TimelineAxisProps {
  className?: string;
  dimensions?: Dimensions;
}

interface TimelineAxisState {
  currentFrame: number;
  isClicked: boolean;
}

const calculateFrameFromEvent = (e: any, dimensions: Dimensions) => {
  const x = e.clientX;
  const progress = x / dimensions.width;
  return clamp(Math.ceil(progress * MAX_FRAMES) - 1, 0, MAX_FRAMES);
};

@WithDimensions
export class TimelineAxis extends Component<TimelineAxisProps, TimelineAxisState> {

  state = {
    currentFrame: 50,
    isClicked: false,
  };

  public render() {
    const {currentFrame} = this.state;
    const {className, dimensions} = this.props;
    const {width} = dimensions;

    const ticks = this.createTickList(width);
    const keyframes = this.createKeyframesList(width);
    const curFrame = createTickPosition(currentFrame, MAX_FRAMES, width);

    return (
      <div
        className={this.getClasses()}
        onMouseUp={this.onTimelineClick}
        onMouseDown={this.onTimelineClick}
        onMouseMove={this.onTimelineDrag}
      >
        {ticks.map(t =>
          <Tick {...t} className={CLASSES_TICK} labelMode={TickLabel.FrameId}/>)}
        {keyframes.map(t =>
          <Tick {...t} className={CLASSES_KEYFRAME} labelMode={TickLabel.None}/>)}
        <Tick {...curFrame} className={CLASSES_CURRENT_FRAME} labelMode={TickLabel.None}/>
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

  private createTickList (panelWidth: number) {
    const list = [];
    const count = (MAX_FRAMES - TICK_SPACING + 1) / TICK_SPACING;
    const dummyArr = Array.from(Array(Math.ceil(count) - 1));

    return dummyArr.map((_, i) => {
      const frameId = (i + 1) * TICK_SPACING;
      return createTickPosition(frameId, MAX_FRAMES, panelWidth);
    });
  }

  private createKeyframesList (panelWidth: number) {
    return KEYFRAMES.map(k => createTickPosition(k, MAX_FRAMES, panelWidth));
  }

  private onTimelineClick = (e: any) => {
    const isClicked = e.type === 'mousedown';
    if (!isClicked  && !this.state.isClicked) {
      // was dragged outside of element and then back onto it
      return;
    }

    this.setState({
      currentFrame: calculateFrameFromEvent(e, this.props.dimensions),
      isClicked,
    });
  }

  private onTimelineDrag = (e: any) => {
    if (!this.state.isClicked) {
      return;
    }

    const isOverAxisEl = e.offsetY > 0;
    if (isOverAxisEl) {
      this.setState({
        ...this.state,
        currentFrame: calculateFrameFromEvent(e, this.props.dimensions),
      });
    } else {
      this.setState({
        ...this.state,
        isClicked: false,
      });
    }
  }

}
