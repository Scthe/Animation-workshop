import {h, Component} from 'preact';
import {observer, inject} from 'mobx-preact';
import {classnames} from 'ui/utils';
const Styles = require('./Settings.scss');
import {AppState} from 'state';
import {Tabs, Purplecoat} from 'ui/components';
import {TabGlobal} from './TabGlobal';
import {TabObject} from './TabObject';


const TABS = [
  {name: 'Object', icon: require('fa/faCube')},
  // {name: 'Keyframe', icon: require('fa/faKey')}, // Object is general (material/light etc.), keyframe is interpolated
  {name: 'Global', icon: require('fa/faGlobeAfrica')},
];

interface SettingsProps {
  className?: string;
  appState?: AppState;
}


@inject('appState')
@observer
export class Settings extends Component<SettingsProps, any> {

  public render() {
    const {appState} = this.props;
    const tabsClass = classnames(
      {[Styles.IsPlaying]: appState.isPlaying},
    );

    return (
      <div className={this.getClasses()}>
        <Tabs tabs={TABS} className={tabsClass}>
          {this.renderBody}
        </Tabs>

        <Purplecoat>
          <h2>Settings - object</h2>
          <p>Data about curent frame</p>
          <p>(transformation at current point in time)</p>

          <h2>Settings - global</h2>
          <p>General app settings</p>
        </Purplecoat>
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
        <TabObject
          className={classnames(
            Styles.AnimatedTab,
            getActiveClass(!isGlobalActive),
            Styles.TabObject
          )}
          isActive={!isGlobalActive}
        />
        <TabGlobal
          className={classnames(
            Styles.AnimatedTab,
            getActiveClass(isGlobalActive),
            Styles.TabGlobal
          )}
          isActive={isGlobalActive}
        />
      </div>
    );
  }

}
