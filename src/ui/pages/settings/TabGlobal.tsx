import {h, Component} from 'preact';
import {classnames} from 'ui/utils';
const Styles = require('./TabGlobal.scss');
import {Checkbox, Slider, Button, ButtonTheme, Section, Dropdown, DropdownItem} from 'ui/components';

// TODO save/load/reset
// TODO input: max frames

const QUAT_INTERPOLATIONS = [
  {name: 'LERP', value: 'LERP'},
  {name: 'SLERP', value: 'SLERP'},
];

interface TabGlobalProps {
  className?: string;
}

export class TabGlobal extends Component<TabGlobalProps, any> {

  public render () {
    const maxFrame = 250;
    const quatInt = 'LERP';

    return (
      <div className={this.getClasses()}>

        {/* Animation settings */}
        <Section title='Animation settings' icon={require('fa/faPlay')}>
          {/* Interpolate quat using SLERP */}
          <div className={Styles.QuatInterpolation}>
            <label>Quat interpolation</label>
            <Dropdown
              options={QUAT_INTERPOLATIONS}
              value={quatInt}
              onSelected={this.onUseSlerp}
              className={Styles.QuatInterpolationDropdown}
            />
          </div>
          <Checkbox id='show-seconds' value={false} onChecked={this.onShowSeconds}>
            Show time as seconds
          </Checkbox>
        </Section>

        {/* Preview range */}
        <Section title='Preview range' icon={require('fa/faArrowsAltH')}>
          <Button
            onClick={(e: any) => console.log(e)}
            theme={ButtonTheme.Beige}
            className={Styles.ResetPreviewRangeBtn}
          >
            Reset preview range
          </Button>
          <Slider
            onChange={(e: number) => console.log(e)}
            name='preview-start'
            label='Preview start'
            min={0} max={maxFrame} value={0}
          />
          <Slider
            onChange={(e: number) => console.log(e)}
            name='preview-end'
            label='Preview end'
            min={0} max={maxFrame} value={maxFrame}
          />
        </Section>

        {/* Display */}
        <Section title='Display' icon={require('fa/faEye')}>
          <Slider
            onChange={(e: number) => console.log(e)}
            name='marker-size'
            label='Marker size'
            min={0} max={maxFrame} value={100}
          />
          <Slider
            onChange={(e: number) => console.log(e)}
            name='gizmo-size'
            label='Gizmo size'
            min={0} max={maxFrame} value={100}
          />
        </Section>

        <Checkbox id='debug-markers' value={true} onChecked={this.onDebugMarkers}>
          Show debug markers
        </Checkbox>

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
    console.log(`onDebugMarkers(${nextValue})`);
  }

  private onShowSeconds = (nextValue: boolean) => {
    console.log(`onShowSeconds(${nextValue})`);
  }

  private onUseSlerp = (nextValue: DropdownItem) => {
    console.log(`onUseSlerp(${nextValue})`);
  }

}
