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
    return (
      <div className={this.getClasses()}>
        <Tabs tabs={TABS}>
          {this.renderBody}
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

  private renderBody = (activeTab: string) => {
    const isGlobalActive = activeTab === 'Global';
    const getActiveClass = (isActive: boolean) => (
      isActive ? Styles.TabContentActive : Styles.TabContentInactive);
    const classes = classnames(
      Styles.SettingsBody,
      isGlobalActive ? Styles.TabGlobal : Styles.TabObject,
    );

    return (
      <div className={classes}>
        <TabObject className={classnames(
          Styles.AnimatedTab,
          getActiveClass(!isGlobalActive),
          Styles.TabObject
        )}/>
        <TabGlobal className={classnames(
          Styles.AnimatedTab,
          getActiveClass(isGlobalActive),
          Styles.TabGlobal
        )}/>
      </div>
    );
  }

}
