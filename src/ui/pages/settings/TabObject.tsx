import {h, Component} from 'preact';
import {get} from 'lodash';
import {classnames} from 'ui/utils';
const Styles = require('./TabObject.scss');
import {Section, Input, InputValidate, FaIcon} from 'ui/components';

// TODO add material settings
// TODO add light settings

///////// mocks:

const Disallow = [] as any;
enum MoveConstraint { LocalX, LocalY, LocalZ}
const MoveAllowAll = [MoveConstraint.LocalX, MoveConstraint.LocalY, MoveConstraint.LocalZ];
enum RotateConstraint { LocalX, LocalY, LocalZ}
// or
// x: [Constraints.AllowLocal, Constraints.AllowGlobal] etc.

const selectedObject = 'BoneLowerArm';
const selectedObjectData = {
  name: selectedObject,
  position: [0, 1, 2],
  rotation: [0, 1, 2, 3],
  scale: [0, 1, 2],
};
const selectedObjectConfig = {
  name: selectedObject,
  type: 'Bone',
  constraints: {
    move: MoveAllowAll,
    rotate: [RotateConstraint.LocalY],
    scale: Disallow,
  }
};

//////// END mocks

const POSITION_FIELDS = [
  {prepend: 'x', className: Styles.InputAxisX, path: 'position[0]'},
  {prepend: 'y', className: Styles.InputAxisY, path: 'position[1]'},
  {prepend: 'z', className: Styles.InputAxisZ, path: 'position[2]'},
];

const ROTATION_FIELDS = [
  {prepend: 'x', className: Styles.InputAxisX, path: 'rotation[0]'},
  {prepend: 'y', className: Styles.InputAxisY, path: 'rotation[1]'},
  {prepend: 'z', className: Styles.InputAxisZ, path: 'rotation[2]'},
  {prepend: 'w', className: Styles.InputAxisW, path: 'rotation[3]'},
];

const SCALE_FIELDS = [
  {prepend: 'x', className: Styles.InputAxisX, path: 'scale[0]'},
  {prepend: 'y', className: Styles.InputAxisY, path: 'scale[1]'},
  {prepend: 'z', className: Styles.InputAxisZ, path: 'scale[2]'},
];


interface TabObjectProps {
  className?: string;
}

export class TabObject extends Component<TabObjectProps, any> {

  public render () {
    const {objData, objCfg} = this.getSelectedObjectInfo();

    return selectedObject ? (
      <div className={this.getClasses()}>

        <h2 className={Styles.ObjectName}>
          {this.getObjectTypeIcon()}
          {selectedObject}
        </h2>

        <Section title='Position' icon={require('fa/faArrowsAlt')}>
          {POSITION_FIELDS.map(fieldMeta =>
            this.renderInput(fieldMeta, this.onPositionChange))}
        </Section>

        <Section title='Rotation' icon={require('fa/faUndo')}>
          <p className={Styles.QuaternionWarning}>
            Rotation is represented as quaternion. Any changes would be ill-advised
          </p>
          {ROTATION_FIELDS.map(fieldMeta =>
            this.renderInput(fieldMeta, this.onPositionChange))}
        </Section>

        {/*
          TODO when overflow, make only subpanel scrollable, not whole <Settings>
        <Section title='Scale' icon={require('fa/faExpand')}>
          {SCALE_FIELDS.map(fieldMeta =>
            this.renderInput(fieldMeta, this.onScaleChange))}
        </Section>
         */}

      </div>
    ) : <p>No object selected?</p>;
  }

  private getClasses () {
    const {className} = this.props;
    return classnames(
      Styles.TabObject,
      className,
    );
  }

  private getObjectTypeIcon () {
    return <FaIcon svg={require('fa/faBone')}/>;
  }

  private getSelectedObjectInfo () {
    return {
      objData: selectedObjectData,
      objCfg: selectedObjectConfig,
    };
  }

  private renderInput = (fieldMeta: any, cb: Function) => {
    const {prepend, className, path} = fieldMeta;

    return (
      <Input
        name={path}
        prepend={prepend}
        className={className}
        value={get(selectedObjectData, path)}
        onInput={cb}
        validate={InputValidate.NumberFloat}
      />
    );
  }

  private onPositionChange = (nextVal: string, e: any) => {
    const val = parseFloat(nextVal);
    if (isNaN(val)) { return; }
    // TODO check if changed

    console.log(`pos: ${val}`);
  }

  private onRotationChange = (nextVal: string, e: any) => {
    const val = parseFloat(nextVal);
    if (isNaN(val)) { return; }
    // TODO check if changed

    console.log(`rot: ${val}`);
  }

  private onScaleChange = (nextVal: string, e: any) => {
    const val = parseFloat(nextVal);
    if (isNaN(val)) { return; }
    // TODO check if changed

    console.log(`scale: ${val}`);
  }

}
