import {h, Component} from 'preact';
import {observer, inject} from 'mobx-preact';
import {classnames} from 'ui/utils';
const Styles = require('./Settings.scss');
import {AppState} from 'ui/state';
import {Tabs} from 'ui/components';
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
    return (
      <div className={this.getClasses()}>
        <Tabs tabs={TABS}>
          {this.renderBody}
        </Tabs>
      </div>
    );
  }

  private getClasses () {
    const {className, appState} = this.props;
    return classnames(
      Styles.Settings,
      className,
      {[Styles.IsPlaying]: appState.isPlaying},
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
        />
        <TabGlobal
          className={classnames(
            Styles.AnimatedTab,
            getActiveClass(isGlobalActive),
            Styles.TabGlobal
          )}
        />
      </div>
    );
  }

}
