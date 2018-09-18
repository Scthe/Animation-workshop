import {h, Component} from 'preact';
import {classnames} from 'ui/utils';
const Styles = require('./Section.scss');
import {FaIcon} from 'ui/components';

interface SectionProps {
  title: string;
  icon?: any;
  children: any;
}

interface SectionState {
  isExpanded: boolean;
}

export class Section extends Component<SectionProps, SectionState> {

  state = {
    isExpanded: true,
  };

  public render () {
    const {title, icon, children} = this.props;
    const {isExpanded} = this.state;

    return (
      <div className={this.getClasses()}>
        <header className={Styles.SectionHeader} onClick={this.onHeaderClick}>
          {/* {this.getExpandArrow()} */}
          {icon && <FaIcon svg={icon} />}
          <h6 className={Styles.SectionTitle}>{title}</h6>
        </header>

        {isExpanded && (
          <div className={Styles.SectionBody}>
            {children}
          </div>
        )}
      </div>
    );
  }

  private getClasses () {
    const {isExpanded} = this.state;

    return classnames(
      Styles.Section,
      isExpanded ? Styles.SectionExpanded : Styles.SectionCollapsed,
    );
  }

  private getExpandArrow () {
    const {isExpanded} = this.state;
    return (isExpanded
      ? <FaIcon className={Styles.ExpandIcon} svg={require('fa/faAngleDown')} />
      : <FaIcon className={Styles.ExpandIcon} svg={require('fa/faAngleRight')} />);
  }

  private onHeaderClick = (_: any) => {
    this.setState((state: SectionState) => ({
      isExpanded: !state.isExpanded,
    }));
  }

}
