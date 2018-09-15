import {h, Component} from 'preact';
import {classnames} from 'ui/utils';
const Styles = require('./TimelineButtonRow.scss');
import {Button, FaIcon, Dropdown} from 'ui/components';

// TODO pause btn
// TODO tooltips (and key shortcuts in tooltips)

interface TimelineButtonRowProps {
  className?: string;
}

const TRANSFORM_SPACES = [
  {name: 'Global', value: 'Global'},
  {name: 'Local', value: 'Local'},
];

export class TimelineButtonRow extends Component<TimelineButtonRowProps, any> {

  public render() {
    const {className} = this.props;
    const tfxSpace = TRANSFORM_SPACES[1].name;
    const [currentFrame, maxFrame] = [1, 250];

    return (
      <div className={this.getClasses()}>

        {/* GENERAL PLAYBACK */}

        <Button onClick={this.onPlay}>
          <FaIcon svg={require('fa/faPlay')}/>
        </Button>

        <Button onClick={this.onReset}>
          <FaIcon svg={require('fa/faStop')}/>
        </Button>

        {/* KEYFRAME MANIPULATION */}

        <div className={Styles.FrameStatus}>
          {currentFrame} / {maxFrame}
        </div>

        <Button onClick={this.onStepBackward}>
          <FaIcon svg={require('fa/faKey')}/>
          <FaIcon svg={require('fa/faStepBackward')}/>
        </Button>

        <Button onClick={this.onStepForward}>
          <FaIcon svg={require('fa/faStepForward')}/>
          <FaIcon svg={require('fa/faKey')}/>
        </Button>

        <Button onClick={this.onKeyframeDelete}>
          <FaIcon svg={require('fa/faBan')}/>
          <FaIcon svg={require('fa/faKey')}/>
        </Button>

        {/* MANIPULATORS + TRANSFORM SPACE (yeah, icons are ***) */}

        <Button onClick={this.onMove}>
          <FaIcon svg={require('fa/faArrowsAlt')}/>
        </Button>

        <Button onClick={this.onRotate}>
          <FaIcon svg={require('fa/faUndo')}/>
        </Button>

        {/*  <Button onClick={this.onScale}>
          <FaIcon svg={require('fa/faExpand')}/>
        </Button>*/}

        <Dropdown
          options={TRANSFORM_SPACES}
          value={tfxSpace}
          onSelected={this.onSpaceChange}
          className={Styles.TfxSpaceDropdown}
        />

        {/* MISC */}

        <Button onClick={this.onFullscreen}>
          {/* TODO move right? or HUGE spacer? */}
          <FaIcon svg={require('fa/faExpandArrowsAlt')}/>
        </Button>

      </div>
    );
  }

  private onPlay = () => {
    console.log(`onPlay`);
  }

  private onReset = () => {
    // jump to first frame
    console.log(`onReset`);
  }

  private onStepBackward = () => {
    console.log(`onStepBackward`);
  }

  private onStepForward = () => {
    console.log(`onStepForward`);
  }

  private onMove = () => {
    console.log(`onMove`);
  }

  private onRotate = () => {
    console.log(`onRotate`);
  }

  private onScale = () => {
    console.log(`onScale`);
  }

  private onFullscreen = () => {
    console.log(`onFullscreen`);
  }

  private onSpaceChange = () => {
    console.log(`onSpaceChange`);
  }

  private onKeyframeDelete = () => {
    console.log(`onKeyframeDelete`);
  }

  private getClasses () {
    const {className} = this.props;
    return classnames(
      Styles.TimelineButtonRow,
      className || '',
    );
  }

}
