import {h, Component} from 'preact';
import {get} from 'lodash';
import {classnames} from 'ui/utils';
const Styles = require('./TabObject.scss');
import {Section, Input, FaIcon} from 'ui/components';

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

const IS_NUMBER = /^-?\d+\.?\d*$/; // /^[0-9]*\\\\.?[0-9]+$/;

interface TabObjectProps {
  className?: string;
}

export class TabObject extends Component<TabObjectProps, any> {

  public render () {
    const {objData, objCfg} = this.getSelectedObjectInfo();
    // TODO split into comp/MoveComp

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
          {ROTATION_FIELDS.map(fieldMeta =>
            this.renderInput(fieldMeta, this.onPositionChange))}
        </Section>

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
      />
    );
  }

  private onPositionChange = (nextVal: string, e: any) => {
    const isOk = IS_NUMBER.test(nextVal);
    if (!isOk) {
      e.preventDefault();
      e.stopPropagation();
    }
  }

  private onRotationChange = (nextVal: string, e: any) => {
    const isOk = IS_NUMBER.test(nextVal);
    if (!isOk) {
      e.preventDefault();
      e.stopPropagation();
    }
  }

}
