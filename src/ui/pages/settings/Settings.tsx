import {h, Component} from 'preact';
import {classnames} from 'ui/utils';
const Styles = require('./Settings.scss');
import {Tabs} from 'ui/components';
import {TabGlobal} from './TabGlobal';
import {TabObject} from './TabObject';


const TABS = [
  {name: 'Object', icon: require('fa/faCube')},
  {name: 'Global', icon: require('fa/faGlobeAfrica')},
];

interface SettingsProps {
  className?: string;
}

export class Settings extends Component<SettingsProps, any> {

  public render() {
    // TODO name of current object

    return (
      <div className={this.getClasses()}>
        <Tabs tabs={TABS}>
          {(activeTab: string) => (
            <div className={Styles.SettingsBody}>
              {activeTab === 'Global' ? <TabGlobal /> : <TabObject />}
            </div>
          )}
        </Tabs>
      </div>
    );
  }

  private getClasses () {
    const {className} = this.props;
    return classnames(
      Styles.Settings,
      className,
    );
  }

}
