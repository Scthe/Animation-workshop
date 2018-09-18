import {h, Component} from 'preact';
import {classnames} from 'ui/utils';
const Styles = require('./Tabs.scss');
import {FaIcon} from 'ui/components';

interface SingleTabProps {
  name: string;
  icon?: any;
}

interface TabsProps {
  className?: string;
  tabs: SingleTabProps[];
  children: any;
}

interface TabsState {
  currentTab: string; // SingleTabProps.name
}

const getTabWidth = (tabCount: number) => {
  const toPercent = 100 / tabCount; // e.g. 33.333 [%]
  const withOkAcc = Math.floor(toPercent * 1000) - 1; // e.g. 33333
  return withOkAcc / 1000; // e.g. 33.3330
};

export class Tabs extends Component<TabsProps, TabsState> {

  public render () {
    const {tabs, children} = this.props;
    const renderContent = children[0] as Function;
    const currentTab = this.getCurrentTab();
    const indicatorStyle = this.getIndicatorStyle(currentTab);

    return (
      <div className={this.getClasses()}>
        <div className={Styles.TabsWrapper}>
          <ul className={Styles.Tabs}>
            {tabs.map(t => this.renderTab(t, currentTab))}
          </ul>
          {indicatorStyle && (
            <div className={Styles.TabIndicator} style={indicatorStyle} />
          )}
        </div>

        {renderContent(currentTab)}
      </div>
    );
  }

  private getClasses () {
    const {className} = this.props;
    return classnames(
      Styles.TabsWithBodyWrapper,
      className,
    );
  }

  private renderTab = (tab: SingleTabProps, currentTab: string) => {
    const {tabs} = this.props;
    const {name, icon} = tab;

    const style = {
      width: `${getTabWidth(tabs.length)}%`,
    };
    const classes = classnames(
      Styles.Tab,
      name === currentTab ? Styles.TabActive : Styles.TabInactive,
      {[Styles.TabWithIcon]: !!icon},
    );

    return (
      <li
        className={classes}
        style={style}
        onClick={this.setTab.bind(this, name)}
      >
        {icon && <FaIcon svg={icon}/>}
        <h4 className={Styles.TabTitle}>{name}</h4>
      </li>
    );
  }

  private getIndicatorStyle (currentTab: string) {
    const {tabs} = this.props;

    const currentTabIdx = tabs.findIndex(t => t.name === currentTab);
    if (currentTabIdx < 0) { return undefined; }

    const tabWidthPercent = getTabWidth(tabs.length);
    return {
      left: `${currentTabIdx * tabWidthPercent}%`,
      width: `${tabWidthPercent}%`,
    };
  }

  private setTab = (tabName: string) => {
    if (this.getCurrentTab() !== tabName) {
      this.setState({
        currentTab: tabName,
      });
    }
  }

  private getCurrentTab () {
    const {tabs} = this.props;
    const {currentTab} = this.state;

    if (tabs.find(t => t.name === currentTab)) {
      return currentTab; // should always be taken
    }
    return tabs.length > 0 ? tabs[0].name : undefined;
  }

}
