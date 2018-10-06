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
import {isAnyAxisAllowed} from 'viewport/scene';


const TRANSFORM_SPACES = [
  {name: 'Global', value: 'Global'},
  {name: 'Local', value: 'Local'},
];

const KEYMAP = [
  { key: 'f', action: 'onPrevFrame', continous: true, },
  { key: 'g', action: 'onNextFrame', continous: true, },
  { key: 'v', action: 'onPlay', continous: false, },
  { key: 'q', action: 'onMove', continous: false, },
  { key: 'e', action: 'onRotate', continous: false, },
  { key: 'r', action: 'onScale', continous: false, },
];


interface TimelineButtonRowProps {
  className?: string;
  appState?: AppState;
  timelineState?: TimelineState;
}


@inject('appState')
@inject('timelineState')
@observer
export class TimelineButtonRow extends Component<TimelineButtonRowProps, any> {

  public componentDidMount () {
    window.addEventListener('keyup', this.globalShortcutKeyHandler);
    window.addEventListener('keypress', this.globalShortcutKeyHandler);
  }

  public componentWillUnmount () {
    window.removeEventListener('keyup', this.globalShortcutKeyHandler);
    window.removeEventListener('keypress', this.globalShortcutKeyHandler);
  }

  public render() {
    const {timelineState, appState} = this.props;
    const tfxSpace = (appState.isUseLocalSpace
      ? TRANSFORM_SPACES[1].name : TRANSFORM_SPACES[0].name);

    const obj = appState.currentObjectData;

    const getGizmoProps = (type: GizmoType) => ({
      theme: ButtonTheme.Blue,
      disabled: !obj || !isAnyAxisAllowed(type, obj.constraints),
      active: appState.currentGizmo === type,
    });

    return (
      <div className={this.getClasses()}>

        {/* GENERAL PLAYBACK */}
        <ButtonGroup className={Styles.ButtonSpacing}>
          <Tooltip text='Go to previous frame [F]' className={Styles.Tooltip} />
          <Button onClick={this.onPrevFrame} theme={ButtonTheme.Beige}>
            <FaIcon svg={require('fa/faAngleLeft')} />
          </Button>

          <Tooltip text='Play [V]' className={Styles.Tooltip} />
          <Button onClick={this.onPlay} theme={ButtonTheme.Green}>
            {timelineState.isPlaying
              ? <FaIcon svg={require('fa/faPause')} />
              : <FaIcon svg={require('fa/faPlay')} /> }
          </Button>
          <Tooltip text='Stop' className={Styles.Tooltip} />
          <Button onClick={this.onReset} theme={ButtonTheme.Red}>
            <FaIcon svg={require('fa/faStop')} />
          </Button>

          <Tooltip text='Go to next frame [G]' className={Styles.Tooltip} />
          <Button onClick={this.onNextFrame} theme={ButtonTheme.Beige}>
            <FaIcon svg={require('fa/faAngleRight')} />
          </Button>
        </ButtonGroup>

        {/* CURRENT FRAME */}
        <Tooltip text='Current frame' className={Styles.Tooltip} />
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
            <FaIcon svg={require('fa/faKey')} />
            <FaIcon svg={require('fa/faStepBackward')} />
          </Button>

          <Tooltip text='Go to next keyframe' className={Styles.Tooltip} />
          <Button onClick={this.onNextKeyframe} theme={ButtonTheme.Yellow}>
            <FaIcon svg={require('fa/faStepForward')} />
            <FaIcon svg={require('fa/faKey')} />
          </Button>

          <Tooltip text='Remove data at current keyframe' className={Styles.Tooltip} />
          <Button onClick={this.onKeyframeDelete} theme={ButtonTheme.Yellow}>
            <FaIcon svg={require('fa/faBan')} />
            <FaIcon svg={require('fa/faKey')} />
          </Button>
        </ButtonGroup>

        {/* MANIPULATORS (yeah, icons are ***) */}
        <ButtonGroup className={Styles.ButtonSpacing}>
          <Tooltip text='Move [Q]' className={Styles.Tooltip} />
          <Button onClick={this.onMove} {...getGizmoProps(GizmoType.Move)}>
            <FaIcon svg={require('fa/faArrowsAlt')} />
          </Button>

          <Tooltip text='Rotate [E]' className={Styles.Tooltip} />
          <Button onClick={this.onRotate} {...getGizmoProps(GizmoType.Rotate)}>
            <FaIcon svg={require('fa/faUndo')} />
          </Button>

          <Tooltip text='Scale [R]' className={Styles.Tooltip} />
          <Button onClick={this.onScale} {...getGizmoProps(GizmoType.Scale)}>
            <FaIcon svg={require('fa/faExpand')} />
          </Button>
        </ButtonGroup>

        {/* TRANSFORM SPACE */}
        <Tooltip text='Transformation space' className={Styles.Tooltip} position={TooltipPosition.Right} />
        <Dropdown
          options={TRANSFORM_SPACES}
          value={tfxSpace}
          onSelected={this.onSpaceChange}
          className={Styles.TransformSpacesDropdown}
        />

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

  private globalShortcutKeyHandler = (e: any) => {
    const isHeld = e.type !== 'keyup';

    for (const {key, action, continous} of KEYMAP) {
      if (e.key !== key) { continue; }

      if (isHeld && continous) {
        (this as any)[action]();
      }
      if (!isHeld && !continous) {
        (this as any)[action]();
      }
    }
  }

  private gotoFrame (frameId: number) {
    const {timelineState} = this.props;
    const frameIdFixed = timelineState.clampFrame(frameId);

    if (!timelineState.isPlaying && timelineState.currentFrame !== frameIdFixed) {
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
    const [prevKeyframe, ] = timelineState.getCurrentObjectKeyframeNeighbours(timelineState.currentFrame, false);

    if (prevKeyframe) {
      this.gotoFrame(prevKeyframe.frameId);
    }
  }

  private onNextKeyframe = () => {
    const {timelineState} = this.props;
    const [ , nextKeyframe] = timelineState.getCurrentObjectKeyframeNeighbours(timelineState.currentFrame, false);

    if (nextKeyframe) {
      this.gotoFrame(nextKeyframe.frameId);
    }
  }

  private onKeyframeDelete = () => {
    const {timelineState} = this.props;
    timelineState.deleteKeyframeForCurrentObject(timelineState.currentFrame);
  }


  /* MANIPULATORS + TRANSFORM SPACE */
  private trySetGizmo (gizmoType: GizmoType) {
    // we are allowed to change gizmo during playback,
    // as it is not visible anyway
    const {appState} = this.props;
    const obj = appState.currentObjectData;
    if (obj && isAnyAxisAllowed(gizmoType, obj.constraints)) {
      appState.currentGizmo = gizmoType;
    }
  }

  private onMove = () => {
    this.trySetGizmo(GizmoType.Move);
  }

  private onRotate = () => {
    this.trySetGizmo(GizmoType.Rotate);
  }

  private onScale = () => {
    this.trySetGizmo(GizmoType.Scale);
  }

  private onSpaceChange = (a: DropdownItem) => {
    const {appState} = this.props;
    appState.isUseLocalSpace = a.value === 'Local';
  }

}
