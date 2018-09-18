import {h, Component} from 'preact';
import {classnames} from 'ui/utils';
const Styles = require('./Dropdown.scss');

const DROPDOWN_ITEM_HEIGHT = 28;

export interface DropdownItem {
  name: string;
  value: any;
}

interface DropdownProps {
  className?: string;
  options: DropdownItem[];
  onSelected: ((_: DropdownItem) => void);
  value: string;
}

export class Dropdown extends Component<DropdownProps, any> {
  public render () {
    const {options} = this.props;
    const {isOpen} = this.state;
    const item = this.getCurrentItem();
    const currentItemIdx = item ? options.findIndex(e => e.name === item.name) : 0;
    const listStyle = {
      transform: `translateY(${-currentItemIdx * DROPDOWN_ITEM_HEIGHT}px)`,
    };

    return (
      <div className={this.getClasses()}>
        <div className={Styles.DropdownValue}>
          {item ? item.name : ''}
        </div>
        <div className={Styles.DropdownOptions} style={listStyle}>
          {options.map(this.renderOptionItem)}
        </div>
      </div>
    );
  }

  private getClasses () {
    const {className} = this.props;
    return classnames(
      Styles.Dropdown,
      className,
    );
  }

  private renderOptionItem = (item: DropdownItem) => {
    const cb = (_: any) => this.onNewOptionSelected(item);
    return (
      <div key={item.name} className={Styles.DropdownOptionItem} onClick={cb}>
        {item.name}
      </div>
    );
  }

  private onNewOptionSelected = (item: DropdownItem) => {
    const {onSelected, value} = this.props;

    if (item.name !== value) {
      onSelected(item);
    }
  }

  private getCurrentItem () {
    const {options, value} = this.props;

    const isCurrent = (item: DropdownItem) => {
      return item.name === value;
    };

    const results = options.filter(isCurrent);

    if (results[0] !== undefined) {
      return results[0];
    }

    return options.length > 0 ? options[0] : undefined;
  }
}
