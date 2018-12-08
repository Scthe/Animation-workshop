import {h, Component} from 'preact';
import {observer, inject} from 'mobx-preact';
import {classnames} from 'ui/utils';
const Styles = require('./TimelineButtonRow.scss');
import {
  Button, ButtonTheme, ButtonGroup,
  Input, InputValidate, FaIcon,
  Tooltip
} from 'ui/components';
import {AppState, TimelineState} from 'state';
import {GizmoType} from 'viewport/gizmo';
import {isAnyAxisAllowed} from 'viewport/scene';
import {getKeyframeBefore, getKeyframeAfter} from 'viewport/animation';
import * as Key from '../../../keymap';


/*const TRANSFORM_SPACES = [
  {name: 'Global', value: 'Global'},
  {name: 'Local', value: 'Local'},
];*/

const KEYMAP = [
  { key: Key.PREV_FRAME,   action: 'onPrevFrame', continous: true, },
  { key: Key.NEXT_FRAME,   action: 'onNextFrame', continous: true, },
  { key: Key.PLAY,         action: 'onPlay', continous: false, },
  { key: Key.GIZMO_MOVE,   action: 'onMove', continous: false, },
  { key: Key.GIZMO_ROTATE, action: 'onRotate', continous: false, },
  { key: Key.GIZMO_SCALE,  action: 'onScale', continous: false, },
  { key: Key.MARKER_HIDE,  action: 'onMarkerHide', continous: false, },
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
    const {appState} = this.props;
    // const tfxSpace = (appState.isUseLocalSpace
      // ? TRANSFORM_SPACES[1].name : TRANSFORM_SPACES[0].name);

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
            {appState.isPlaying
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
          value={appState.currentFrame + 1}
          className={Styles.FrameStatus}
          append={` of ${appState.frameCount}`}
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
        {/*
        <Tooltip text='Transformation space' className={Styles.Tooltip} position={TooltipPosition.Right} />
        <Dropdown
          options={TRANSFORM_SPACES}
          value={tfxSpace}
          onSelected={this.onSpaceChange}
          className={Styles.TransformSpacesDropdown}
        />
        */}

        {/* MARKERS HIDE */}
        <ButtonGroup className={Styles.ButtonSpacing}>
          <Tooltip text='Toggle markers [H]' className={Styles.Tooltip} />
          <Button onClick={this.onMarkerHide} theme={ButtonTheme.Beige} active={appState.showMarkers}>
            <FaIcon svg={require('fa/faDotCircle')} />
          </Button>
        </ButtonGroup>

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


  /* GENERAL PLAYBACK */
  private onPlay = () => {
    const {appState} = this.props;
    appState.isPlaying = !appState.isPlaying;
  }

  private onReset = () => {
    const {appState} = this.props;
    appState.isPlaying = false;

    appState.gotoFrame(Math.min(...appState.previewRange));
  }

  private onPrevFrame = () => {
    const {appState} = this.props;
    appState.gotoFrame(appState.currentFrame - 1);
  }

  private onNextFrame = () => {
    const {appState} = this.props;
    appState.gotoFrame(appState.currentFrame + 1);
  }

  private onFrameTextInput = (nextVal: string, e: any) => {
    const val = parseFloat(nextVal);
    if (isNaN(val)) { return; }

    const {appState} = this.props;
    appState.gotoFrame(val - 1);
  }

  /* KEYFRAME MANIPULATION */
  private getKeyframes () {
    const {timelineState} = this.props;
    return timelineState.framesWithKeyframe.map(frameId => ({
      frameId, transform: null as any,
    }));
  }

  private onPrevKeyframe = () => {
    const {appState} = this.props;
    const prevKeyframe = getKeyframeBefore(
      this.getKeyframes(), appState.currentFrame
    );

    if (prevKeyframe) {
      appState.gotoFrame(prevKeyframe.frameId);
    }
  }

  private onNextKeyframe = () => {
    const {appState} = this.props;
    const nextKeyframe = getKeyframeAfter(
      this.getKeyframes(), appState.currentFrame
    );

    if (nextKeyframe) {
      appState.gotoFrame(nextKeyframe.frameId);
    }
  }

  private onKeyframeDelete = () => {
    const {timelineState, appState} = this.props;
    timelineState.deleteKeyframe(appState.selectedObjectName, appState.currentFrame);
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

  /*private onSpaceChange = (a: DropdownItem) => {
    const {appState} = this.props;
    appState.isUseLocalSpace = a.value === 'Local';
  }*/

  /* MARKERS HIDE */
  private onMarkerHide = () => {
    const {appState} = this.props;
    appState.showMarkers = !appState.showMarkers;
  }

}
