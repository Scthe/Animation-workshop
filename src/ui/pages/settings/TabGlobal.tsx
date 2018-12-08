import {h, Component} from 'preact';
import {observer, inject} from 'mobx-preact';
import {classnames, clamp} from 'ui/utils';
const Styles = require('./TabGlobal.scss');
import {
  Checkbox, Slider, Button, ButtonTheme, Section,
  Dropdown, DropdownItem,
  Tooltip, TooltipPosition
} from 'ui/components';
import {
  AppState,
  MAX_MARKER_SIZE, MAX_GIZMO_SIZE,
  MAX_CAMERA_MOVE_SPEED, MAX_CAMERA_ROTATE_SPEED,
} from 'state';
import {ImportExport} from './sections/ImportExport';


const QUAT_INTERPOLATIONS = [
  {name: 'LERP', value: 'LERP'},
  {name: 'SLERP', value: 'SLERP'},
];

interface TabGlobalProps {
  className?: string;
  appState?: AppState;
}


@inject('appState')
@observer
export class TabGlobal extends Component<TabGlobalProps, any> {

  public render () {
    const {appState} = this.props;

    const tooltipProps = {
      className: Styles.Tooltip,
      position: TooltipPosition.Left,
    };

    /* tslint:disable:jsx-alignment */
    return (
      <div className={this.getClasses()}>

        {/* Animation settings */}
        <Section title='Animation settings' icon={require('fa/faPlay')}>
          <Tooltip text='Linear or spherical linear interpolation' {...tooltipProps} />
          <div className={Styles.QuatInterpolation}>
            <label>Quat interpolation</label>
            <Dropdown
              options={QUAT_INTERPOLATIONS}
              value={appState.useSlerp ? 'SLERP' : 'LERP'}
              onSelected={this.onUseSlerp}
              className={Styles.QuatInterpolationDropdown}
            />
          </div>
          <Checkbox id='show-seconds' value={appState.showTimeAsSeconds} onChecked={this.onShowSeconds}>
            Show time as seconds
          </Checkbox>
        </Section>

        {/* Preview range */}
        <Section title='Preview range' icon={require('fa/faArrowsAltH')}>
          <Button
            onClick={this.resetPreviewRange}
            theme={ButtonTheme.Beige}
            className={Styles.InSectionBtn}
          >
            Reset preview range
          </Button>

          <Tooltip text='Temporarily limit keyframe range' {...tooltipProps} />
          <Slider
            onSelected={this.setPreviewRangeA}
            name='preview-start'
            label='Preview start'
            min={0} max={appState.frameCount} value={appState._previewRange[0]}
          />
          <Tooltip text='Temporarily limit keyframe range' {...tooltipProps} />
          <Slider
            onSelected={this.setPreviewRangeB}
            name='preview-end'
            label='Preview end'
            min={0} max={appState.frameCount} value={appState._previewRange[1]}
          />
        </Section>

        {/* Viewport */}
        <Section title='Viewport' icon={require('fa/faEye')}>
          {/* camera */}
          <Tooltip text='Camera movement speed with [WSAD]' {...tooltipProps} />
          <Slider
            onChange={this.onCameraMoveSpeed}
            name='camera-move-size'
            label='Camera move speed'
            min={MAX_CAMERA_MOVE_SPEED / 10} max={MAX_CAMERA_MOVE_SPEED}
            value={appState.cameraMoveSpeed}
          />
          <Tooltip text='Camera rotate speed with mouse' {...tooltipProps} />
          <Slider
            onChange={this.onCameraRotateSpeed}
            name='camera-rotate-size'
            label='Camera rotate speed'
            min={MAX_CAMERA_ROTATE_SPEED / 10} max={MAX_CAMERA_ROTATE_SPEED}
            value={appState.cameraRotateSpeed}
          />

          {/* sizes */}
          <Tooltip text='Size of selection circle' {...tooltipProps} />
          <Slider
            onChange={this.onMarkerSize}
            name='marker-size'
            label='Marker size'
            min={MAX_MARKER_SIZE / 10} max={MAX_MARKER_SIZE} value={appState.markerSize}
          />
          <Tooltip text='Size of 3d manipulators' {...tooltipProps} />
          <Slider
            onChange={this.onGizmoSize}
            name='gizmo-size'
            label='Gizmo size'
            min={MAX_GIZMO_SIZE / 10} max={MAX_GIZMO_SIZE} value={appState.gizmoSize}
          />

          <Checkbox id='debug-markers' value={appState.showDebug} onChecked={this.onDebugMarkers}>
            Show debug markers
          </Checkbox>
        </Section>

        {/* Import / Export */}
        <Section title='Import / Export' icon={require('fa/faSave')}>
          <ImportExport />
        </Section>

      </div>
    );
  }

  private getClasses () {
    const {className} = this.props;
    return classnames(
      Styles.TabGlobal,
      className,
    );
  }

  private onDebugMarkers = (nextValue: boolean) => {
    const {appState} = this.props;
    appState.showDebug = nextValue;
  }

  private onShowSeconds = (nextValue: boolean) => {
    const {appState} = this.props;
    appState.showTimeAsSeconds = nextValue;
  }

  private onUseSlerp = (nextValue: DropdownItem) => {
    const {appState} = this.props;
    appState.useSlerp = nextValue.value === 'SLERP';
  }

  private onMarkerSize = (nextValue: number) => {
    const {appState} = this.props;
    appState.markerSize = nextValue;
  }

  private onGizmoSize = (nextValue: number) => {
    const {appState} = this.props;
    appState.gizmoSize = nextValue;
  }

  private setPreviewRangeA = (frameId: number) => {
    const {appState} = this.props;
    const otherFrameId = appState.previewRange[1];
    appState._previewRange = [
      this.getPreviewRangeNum(frameId, otherFrameId), otherFrameId
    ];
  }

  private setPreviewRangeB = (frameId: number) => {
    const {appState} = this.props;
    const otherFrameId = appState.previewRange[0];
    appState._previewRange = [
      otherFrameId, this.getPreviewRangeNum(frameId, otherFrameId)
    ];
  }

  private getPreviewRangeNum (frameIdNew: number, frameIdOther: number) {
    const {appState} = this.props;

    frameIdNew = clamp(frameIdNew, 0, appState.frameCount);
    if (frameIdNew === frameIdOther) {
      frameIdNew = frameIdOther === 0 ? frameIdOther + 1 : frameIdOther - 1;
    }

    return frameIdNew;
  }

  private resetPreviewRange = () => {
    const {appState} = this.props;
    appState.resetPreviewRange();
  }

  private onCameraMoveSpeed = (nextValue: number) => {
    const {appState} = this.props;
    appState.cameraMoveSpeed = nextValue;
  }

  private onCameraRotateSpeed = (nextValue: number) => {
    const {appState} = this.props;
    appState.cameraRotateSpeed = nextValue;
  }

}
