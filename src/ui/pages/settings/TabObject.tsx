import {h, Component} from 'preact';
import {observer, inject} from 'mobx-preact';
import {get} from 'lodash';
import {classnames} from 'ui/utils';
const Styles = require('./TabObject.scss');

import {Section, Input, InputValidate, FaIcon} from 'ui/components';
import {AppState, TimelineState} from 'ui/state';
import {isAxisAllowed} from 'viewport/scene';
import {GizmoType} from 'viewport/gizmo';
import {Axis} from 'gl-utils';


// TODO add material settings
// TODO add light settings
// TODO when overflow, make only subpanel scrollable, not whole <Settings>

interface TransformInputProps {
  type?: GizmoType;
  axis: Axis;
  name: string;
  disabled?: boolean;
}

const POSITION_FIELDS = [
  {type: GizmoType.Move, axis: Axis.AxisX, name: 'position[0]'},
  {type: GizmoType.Move, axis: Axis.AxisY, name: 'position[1]'},
  {type: GizmoType.Move, axis: Axis.AxisZ, name: 'position[2]'},
];

const ROTATION_FIELDS = [
  {type: GizmoType.Rotate, axis: Axis.AxisX, name: 'rotation[0]', disabled: true},
  {type: GizmoType.Rotate, axis: Axis.AxisY, name: 'rotation[1]', disabled: true},
  {type: GizmoType.Rotate, axis: Axis.AxisZ, name: 'rotation[2]', disabled: true},
  {type: GizmoType.Rotate, axis: undefined , name: 'rotation[3]', disabled: true},
];


interface TabObjectProps {
  className?: string;
  appState?: AppState;
  timelineState?: TimelineState;
}


@inject('appState')
@inject('timelineState')
@observer
export class TabObject extends Component<TabObjectProps, any> {

  public render () {
    const {appState} = this.props;
    const obj = appState.currentObjectData;

    if (!obj) {
      return (
        <div className={this.getClasses()}>
          <p className={Styles.NoObjectSelected}>No object selected</p>
        </div>
      );
    }

    return (
      <div className={this.getClasses()}>

        <h2 className={Styles.ObjectName}>
          {obj.isBone
            ? <FaIcon svg={require('fa/faBone')} />
            : <FaIcon svg={require('fa/faCube')} />}
          {obj.name}
        </h2>

        {this.hasKeyframeAtCurrentFrame()
          ? (<p className={Styles.KeyframeInfoYes}>
              <FaIcon svg={require('fa/faKey')} />
              Keyframe
            </p>)
          : <p className={Styles.KeyframeInfoNo}>Interpolated frame</p>}


        <Section title='Position' icon={require('fa/faArrowsAlt')}>
          {POSITION_FIELDS.map(fieldMeta =>
            this.renderInput(obj, fieldMeta, this.onTransformChange))}
        </Section>

        {/* initFolded={true} */}
        <Section title='Rotation' icon={require('fa/faUndo')}>
          <p className={Styles.QuaternionWarning}>
            Rotation is represented as quaternion. Any changes would be ill-advised
          </p>
          {ROTATION_FIELDS.map(fieldMeta =>
            this.renderInput(obj, fieldMeta, this.onTransformChange))}
        </Section>

      </div>
    );
  }

  private hasKeyframeAtCurrentFrame() {
    const {timelineState, appState} = this.props;

    return appState.selectedObjectName && timelineState.hasKeyframeAt(
      appState.selectedObjectName, appState.currentFrame
    );
  }

  private getClasses () {
    const {className} = this.props;
    return classnames(
      Styles.TabObject,
      className,
      {[Styles.hasKeyframe]: this.hasKeyframeAtCurrentFrame()}
    );
  }

  private renderInput = (obj: any, fieldMeta: TransformInputProps, cb: Function) => {
    const {type, axis, name, disabled} = fieldMeta;

    let prepend, className;
    switch (axis) {
      case Axis.AxisX: prepend = 'x'; className = Styles.InputAxisX; break;
      case Axis.AxisY: prepend = 'y'; className = Styles.InputAxisY; break;
      case Axis.AxisZ: prepend = 'z'; className = Styles.InputAxisZ; break;
      default:         prepend = 'w'; className = Styles.InputAxisW; break;
    }

    const {constraints} = obj;
    const locked = disabled || !isAxisAllowed(axis, type, constraints);

    return (
      <Input
        prepend={prepend}
        className={className}
        name={name}
        disabled={locked}
        value={get(obj, `keyframe.${fieldMeta.name}`)}
        onInput={cb}
        validate={InputValidate.NumberFloat}
      />
    );
  }

  private updateKeyframeProperty (propName: string, value: number) {
    // method to update position[0], rotation[2], scale[1] etc.
    if (isNaN(value)) { return; }

    /*
    const {appState} = this.props;
    const obj = appState.selectedObject;
    const keyframe = { ...obj.keyframe };
    if (!has(keyframe, propName)) { return; }

    const valPrev = get(keyframe, propName);
    const changedEnough = Math.abs(valPrev - value) > CHANGE_EPS;
    if (changedEnough) {
      set(keyframe, propName, value);
      console.log(`SET (${propName}=${value}) will have: `, keyframe);
    }
    */
    console.log(`SET (${propName}=${value}) will have: `);
  }

  private onTransformChange = (nextVal: string, e: any) => {
    const propName = e.target.name;
    const val = parseFloat(nextVal);
    this.updateKeyframeProperty(propName, val);
  }

}
