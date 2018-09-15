import {h, Component} from 'preact';
import {classnames} from 'ui/utils';
const Styles = require('./TabObject.scss');
import {Section, Input} from 'ui/components';

///////// mocks:

const Disallow = [] as any;
enum MoveConstraint { LocalX, LocalY, LocalZ}
const MoveAllowAll = [MoveConstraint.LocalX, MoveConstraint.LocalY, MoveConstraint.LocalZ];
enum RotateConstraint { LocalX, LocalY, LocalZ}

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

const IS_NUMBER = /^-?\d+\.?\d*$/; // /^[0-9]*\\\\.?[0-9]+$/;

interface TabObjectProps {
  className?: string;
}

export class TabObject extends Component<TabObjectProps, any> {

  public render () {
    const {objData, objCfg} = this.getSelectedObjectInfo();
    // TODO split into comp/MoveComp
    // TODO add :focused state to components

    return selectedObject ? (
      <div className={this.getClasses()}>

        <h2 className={Styles.ObjectName}>{selectedObject}</h2>

        <Section title='Position' icon={require('fa/faArrowsAlt')}>
          <Input name='position-x' prepend='x' value={1.0} onInput={this.onPositionChange} />
          <Input name='position-y' prepend='y' value={2.0} onInput={this.onPositionChange} />
          <Input name='position-z' prepend='z' value={3.5} onInput={this.onPositionChange} />
        </Section>

        <Section title='Rotation' icon={require('fa/faUndo')}>
          <Input name='rotation-x' prepend='x' value={1.0} onInput={this.onRotationChange} />
          <Input name='rotation-y' prepend='y' value={2.0} onInput={this.onRotationChange} />
          <Input name='rotation-z' prepend='z' value={3.5} onInput={this.onRotationChange} />
          <Input name='rotation-w' prepend='w' value={3.5} onInput={this.onRotationChange} />
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

  private getSelectedObjectInfo () {
    return {
      objData: selectedObjectData,
      objCfg: selectedObjectConfig,
    };
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
