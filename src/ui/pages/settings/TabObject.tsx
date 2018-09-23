import {h, Component} from 'preact';
import {observer, inject} from 'mobx-preact';
import {get, set, has} from 'lodash';
import {classnames} from 'ui/utils';
const Styles = require('./TabObject.scss');
import {Section, Input, InputValidate, FaIcon} from 'ui/components';
import {AppState} from 'ui/state';

// TODO add material settings
// TODO add light settings

const CHANGE_EPS = 0.001;

const POSITION_FIELDS = [
  {prepend: 'x', className: Styles.InputAxisX, name: 'position[0]'},
  {prepend: 'y', className: Styles.InputAxisY, name: 'position[1]'},
  {prepend: 'z', className: Styles.InputAxisZ, name: 'position[2]'},
];

const ROTATION_FIELDS = [
  {prepend: 'x', className: Styles.InputAxisX, name: 'rotation[0]', disabled: true},
  {prepend: 'y', className: Styles.InputAxisY, name: 'rotation[1]', disabled: true},
  {prepend: 'z', className: Styles.InputAxisZ, name: 'rotation[2]', disabled: true},
  {prepend: 'w', className: Styles.InputAxisW, name: 'rotation[3]', disabled: true},
];

/*const SCALE_FIELDS = [
  {prepend: 'x', className: Styles.InputAxisX, name: 'scale[0]'},
  {prepend: 'y', className: Styles.InputAxisY, name: 'scale[1]'},
  {prepend: 'z', className: Styles.InputAxisZ, name: 'scale[2]'},
];*/


interface TabObjectProps {
  className?: string;
  appState?: AppState;
}


@inject('appState')
@observer
export class TabObject extends Component<TabObjectProps, any> {

  public render () {
    const {appState} = this.props;
    const obj = appState.currentObject;

    if (!obj) {
      return <p>No object selected?</p>;
    }

    return (
      <div className={this.getClasses(obj.hasKeyframeAtCurrentFrame)}>

        <h2 className={Styles.ObjectName}>
          {obj.isBone
            ? <FaIcon svg={require('fa/faBone')} />
            : <FaIcon svg={require('fa/faCube')} />}
          {obj.name}
        </h2>

        {obj.hasKeyframeAtCurrentFrame
          ? (<p className={Styles.KeyframeInfoYes}>
              <FaIcon svg={require('fa/faKey')} />
              Keyframe
            </p>)
          : <p className={Styles.KeyframeInfoNo}>Interpolated frame</p>}


        <Section title='Position' icon={require('fa/faArrowsAlt')}>
          {POSITION_FIELDS.map(fieldMeta =>
            this.renderInput(obj, fieldMeta, this.onPosRotScaleChange))}
        </Section>

        <Section title='Rotation' icon={require('fa/faUndo')} initFolded={true}>
          <p className={Styles.QuaternionWarning}>
            Rotation is represented as quaternion. Any changes would be ill-advised
          </p>
          {ROTATION_FIELDS.map(fieldMeta =>
            this.renderInput(obj, fieldMeta, this.onPosRotScaleChange))}
        </Section>

        {/*
          TODO when overflow, make only subpanel scrollable, not whole <Settings>
        <Section title='Scale' icon={require('fa/faExpand')}>
          {SCALE_FIELDS.map(fieldMeta =>
            this.renderInput(obj, fieldMeta, this.onPosRotScaleChange))}
        </Section>
         */}

      </div>
    );
  }

  private getClasses (hasKeyframeAtCurrentFrame: boolean) {
    const {className} = this.props;
    return classnames(
      Styles.TabObject,
      className,
      {[Styles.hasKeyframe]: hasKeyframeAtCurrentFrame}
    );
  }

  private renderInput = (obj: any, fieldMeta: any, cb: Function) => {
    return (
      <Input
        {...fieldMeta}
        value={get(obj, `keyframe.${fieldMeta.name}`)}
        onInput={cb}
        validate={InputValidate.NumberFloat}
      />
    );
  }

  private updateKeyframeProperty (propName: string, value: number) {
    if (isNaN(value)) { return; }

    const {appState} = this.props;
    const obj = appState.currentObject;
    const keyframe = { ...obj.keyframe };

    const valPrev = get(keyframe, propName);
    if (has(keyframe, propName) && Math.abs(valPrev - value) > CHANGE_EPS) {
      set(keyframe, propName, value);
      console.log(`SET (${propName}=${value}) will have: `, keyframe);
    }
  }

  private onPosRotScaleChange = (nextVal: string, e: any) => {
    const propName = e.target.name;
    const val = parseFloat(nextVal);
    this.updateKeyframeProperty(propName, val);
  }

}
