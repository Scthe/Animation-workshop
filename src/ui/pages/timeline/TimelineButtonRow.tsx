import {h, Component} from 'preact';
import {observer, inject} from 'mobx-preact';
import {classnames} from 'ui/utils';
const Styles = require('./TimelineButtonRow.scss');
import {
  Button, ButtonTheme, ButtonGroup,
  Input, InputValidate, FaIcon,
  Dropdown, DropdownItem,
  Tooltip, TooltipPosition
} from 'ui/components';
import {AppState, TimelineState} from 'ui/state';
import {GizmoType} from 'viewport/gizmo';

// TODO pause btn

interface TimelineButtonRowProps {
  className?: string;
  appState?: AppState;
  timelineState?: TimelineState;
}

const TRANSFORM_SPACES = [
  {name: 'Global', value: 'Global'},
  {name: 'Local', value: 'Local'},
];

@inject('appState')
@inject('timelineState')
@observer
export class TimelineButtonRow extends Component<TimelineButtonRowProps, any> {

  public render() {
    const {className, timelineState, appState} = this.props;
    const tfxSpace = (appState.isUseLocalSpace
      ? TRANSFORM_SPACES[1].name : TRANSFORM_SPACES[0].name);

    const getGizmoProps = (type: GizmoType) => ({
      theme: ButtonTheme.Blue,
      disabled: !appState.isGizmoAllowed(type),
      active: appState.currentGizmo === type,
    });

    return (
      <div className={this.getClasses()}>

        {/* GENERAL PLAYBACK */}
        <ButtonGroup className={Styles.ButtonSpacing}>
          <Tooltip text='Go to previous frame [&larr;]' className={Styles.Tooltip} />
          <Button onClick={this.onPrevFrame} theme={ButtonTheme.Beige}>
            <FaIcon svg={require('fa/faAngleLeft')}/>
          </Button>

          <Tooltip text='Play [SPACE]' className={Styles.Tooltip} />
          <Button onClick={this.onPlay} theme={ButtonTheme.Green}>
            <FaIcon svg={require('fa/faPlay')}/>
          </Button>
          <Tooltip text='Stop' className={Styles.Tooltip} />
          <Button onClick={this.onReset} theme={ButtonTheme.Red}>
            <FaIcon svg={require('fa/faStop')}/>
          </Button>

          <Tooltip text='Go to next frame [&rarr;]' className={Styles.Tooltip}/>
          <Button onClick={this.onNextFrame} theme={ButtonTheme.Beige}>
            <FaIcon svg={require('fa/faAngleRight')}/>
          </Button>
        </ButtonGroup>

        {/* CURRENT FRAME */}
        <Tooltip text='Current frame' className={Styles.Tooltip}/>
        <Input
          name='current-frame'
          value={timelineState.currentFrame + 1}
          className={Styles.FrameStatus}
          append={` of ${timelineState.frameCount}`}
          onInput={this.onFrameTextInput}
          validate={InputValidate.NumberDecimal}
          rawProps={{maxlength: 3}}
        />

        {/* KEYFRAME MANIPULATION */}
        <ButtonGroup className={Styles.ButtonSpacing}>
          <Tooltip text='Go to previous keyframe' className={Styles.Tooltip} />
          <Button onClick={this.onPrevKeyframe} theme={ButtonTheme.Yellow}>
            <FaIcon svg={require('fa/faKey')}/>
            <FaIcon svg={require('fa/faStepBackward')}/>
          </Button>

          <Tooltip text='Go to next keyframe' className={Styles.Tooltip} />
          <Button onClick={this.onNextKeyframe} theme={ButtonTheme.Yellow}>
            <FaIcon svg={require('fa/faStepForward')}/>
            <FaIcon svg={require('fa/faKey')}/>
          </Button>

          <Tooltip text='Remove data at current keyframe' className={Styles.Tooltip} />
          <Button onClick={this.onKeyframeDelete} theme={ButtonTheme.Yellow}>
            <FaIcon svg={require('fa/faBan')}/>
            <FaIcon svg={require('fa/faKey')}/>
          </Button>
        </ButtonGroup>

        {/* MANIPULATORS (yeah, icons are ***) */}
        <ButtonGroup className={Styles.ButtonSpacing}>
          <Tooltip text='Move [Q]' className={Styles.Tooltip}/>
          <Button onClick={this.onMove} {...getGizmoProps(GizmoType.Move)}>
            <FaIcon svg={require('fa/faArrowsAlt')}/>
          </Button>

          <Tooltip text='Rotate [E]' className={Styles.Tooltip} />
          <Button onClick={this.onRotate} {...getGizmoProps(GizmoType.Rotate)}>
            <FaIcon svg={require('fa/faUndo')}/>
          </Button>

          <Tooltip text='Scale [R]' className={Styles.Tooltip} />
          <Button onClick={this.onScale} {...getGizmoProps(GizmoType.Scale)}>
            <FaIcon svg={require('fa/faExpand')}/>
          </Button>
        </ButtonGroup>

        {/* TRANSFORM SPACE */}
        <Tooltip text='Transformation space' className={Styles.Tooltip} position={TooltipPosition.Right}/>
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

  private getClasses () {
    const {className} = this.props;
    return classnames(
      Styles.TimelineButtonRow,
      className || '',
    );
  }

  private gotoFrame (frameId: number) {
    const {timelineState} = this.props;
    const frameIdFixed = timelineState.clampFrame(frameId);
    if (timelineState.currentFrame !== frameIdFixed) {
      timelineState.currentFrame = frameIdFixed;
    }
  }

  /* GENERAL PLAYBACK */
  private onPlay = () => {
    const {timelineState} = this.props;
    timelineState.isPlaying = !timelineState.isPlaying;
  }

  private onReset = () => {
    const {timelineState} = this.props;
    timelineState.isPlaying = false;

    let range = timelineState.previewRange;
    this.gotoFrame(Math.min(...range));
  }

  private onPrevFrame = () => {
    const {timelineState} = this.props;
    this.gotoFrame(timelineState.currentFrame - 1);
  }

  private onNextFrame = () => {
    const {timelineState} = this.props;
    this.gotoFrame(timelineState.currentFrame + 1);
  }

  private onFrameTextInput = (nextVal: string, e: any) => {
    const val = parseFloat(nextVal);
    if (isNaN(val)) { return; }

    this.gotoFrame(val - 1);
  }

  /* KEYFRAME MANIPULATION */
  private onPrevKeyframe = () => {
    const {timelineState} = this.props;
    const [prevKeyframe, _] = timelineState.getCurrentObjectKeyframeNeighbours(timelineState.currentFrame, false);

    if (prevKeyframe) {
      this.gotoFrame(prevKeyframe.frameId);
    }
  }

  private onNextKeyframe = () => {
    const {timelineState} = this.props;
    const [_, nextKeyframe] = timelineState.getCurrentObjectKeyframeNeighbours(timelineState.currentFrame, false);

    if (nextKeyframe) {
      this.gotoFrame(nextKeyframe.frameId);
    }
  }

  private onKeyframeDelete = () => {
    const {timelineState} = this.props;
    timelineState.deleteKeyframeForCurrentObject(timelineState.currentFrame);
  }


  /* MANIPULATORS + TRANSFORM SPACE */
  private onMove = () => {
    const {appState} = this.props;
    appState.currentGizmo = GizmoType.Move;
  }

  private onRotate = () => {
    const {appState} = this.props;
    appState.currentGizmo = GizmoType.Rotate;
  }

  private onScale = () => {
    const {appState} = this.props;
    appState.currentGizmo = GizmoType.Scale;
  }

  private onFullscreen = () => {
    console.log(`onFullscreen`);
  }

  private onSpaceChange = (a: DropdownItem) => {
    const {appState} = this.props;
    appState.isUseLocalSpace = a.value === 'Local';
  }

}
