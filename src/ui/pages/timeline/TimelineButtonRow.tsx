import {h, Component} from 'preact';
import {classnames} from 'ui/utils';
const Styles = require('./TimelineButtonRow.scss');
import {Button, ButtonTheme, ButtonGroup, Input, FaIcon, Dropdown} from 'ui/components';

// TODO pause btn

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
        <ButtonGroup className={Styles.ButtonSpacing}>
          <Button onClick={this.onPlay} theme={ButtonTheme.Beige}>
            <FaIcon svg={require('fa/faAngleDoubleLeft')}/>
          </Button>
          <Button onClick={this.onPlay} theme={ButtonTheme.Beige}>
            <FaIcon svg={require('fa/faAngleLeft')}/>
          </Button>

          <Button onClick={this.onPlay} theme={ButtonTheme.Green}>
            <FaIcon svg={require('fa/faPlay')}/>
          </Button>
          <Button onClick={this.onReset} theme={ButtonTheme.Red}>
            <FaIcon svg={require('fa/faStop')}/>
          </Button>

          <Button onClick={this.onPlay} theme={ButtonTheme.Beige}>
            <FaIcon svg={require('fa/faAngleRight')}/>
          </Button>
          <Button onClick={this.onPlay} theme={ButtonTheme.Beige}>
            <FaIcon svg={require('fa/faAngleDoubleRight')}/>
          </Button>
        </ButtonGroup>


        {/* KEYFRAME MANIPULATION */}
        <Input
          name='current-frame'
          value={currentFrame}
          className={Styles.FrameStatus}
          append={` of ${maxFrame}`}
        />

        <ButtonGroup className={Styles.ButtonSpacing}>
          <Button onClick={this.onStepBackward} theme={ButtonTheme.Yellow}>
            <FaIcon svg={require('fa/faKey')}/>
            <FaIcon svg={require('fa/faStepBackward')}/>
          </Button>

          <Button onClick={this.onStepForward} theme={ButtonTheme.Yellow}>
            <FaIcon svg={require('fa/faStepForward')}/>
            <FaIcon svg={require('fa/faKey')}/>
          </Button>

          <Button onClick={this.onKeyframeDelete} theme={ButtonTheme.Yellow}>
            <FaIcon svg={require('fa/faBan')}/>
            <FaIcon svg={require('fa/faKey')}/>
          </Button>
        </ButtonGroup>

        {/* MANIPULATORS + TRANSFORM SPACE (yeah, icons are ***) */}
        <ButtonGroup className={Styles.ButtonSpacing}>
          <Button onClick={this.onMove} theme={ButtonTheme.Blue}>
            <FaIcon svg={require('fa/faArrowsAlt')}/>
          </Button>

          <Button onClick={this.onRotate} theme={ButtonTheme.Blue}>
            <FaIcon svg={require('fa/faUndo')}/>
          </Button>

          <Button onClick={this.onScale} theme={ButtonTheme.Blue}>
            <FaIcon svg={require('fa/faExpand')}/>
          </Button>
        </ButtonGroup>

        <Dropdown
          options={TRANSFORM_SPACES}
          value={tfxSpace}
          onSelected={this.onSpaceChange}
          className={Styles.TransformSpacesDropdown}
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
