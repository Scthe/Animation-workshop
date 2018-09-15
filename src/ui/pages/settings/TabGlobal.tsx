import {h, Component} from 'preact';
import {classnames} from 'ui/utils';
const Styles = require('./TabGlobal.scss');
import {Checkbox} from 'ui/components';

// theme?
// save/load/reset
// input: max frames

interface TabGlobalProps {
  className?: string;
}

export class TabGlobal extends Component<TabGlobalProps, any> {

  public render () {

    return (
      <div className={this.getClasses()}>

        <Checkbox id='debugMarkers' value={true} onChecked={this.onDebugMarkers}>
          Show debug markers
        </Checkbox>

        <Checkbox id='useSeconds' value={false} onChecked={this.onUseSeconds}>
          Show time as seconds
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

  private onUseSeconds = (nextValue: boolean) => {
    console.log(`onUseSeconds(${nextValue})`);
  }

}
