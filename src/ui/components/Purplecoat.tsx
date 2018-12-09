import {h, Component} from 'preact';
import {observable} from 'mobx';
import {observer} from 'mobx-preact';
const Portal = require('preact-portal');
import {debounce, pick} from 'lodash';
import {classnames, createRef} from 'ui/utils';
const Styles = require('./Purplecoat.scss');

// Help popups inspired by:
// https://github.com/ellekasai/purplecoat.js

///
/// Store

class PurplecoatStore {
  @observable purplecoatVisible: boolean = false;
}
const purplecoatStore = new PurplecoatStore();

export const togglePurplecoat = debounce((nextState: boolean) => {
  purplecoatStore.purplecoatVisible = nextState;
}, 10);


///
/// Component

interface PurplecoatProps {
  children: any;
  forId?: string; // id of element, will use .parentElement by default
  className?: string;
  hidden?: boolean;
}

@observer
export class Purplecoat extends Component<PurplecoatProps, any> {

  private meRef = createRef();

  public componentDidMount () {
    this.forceUpdate(); // re-render after getting refs
  }

  public render () {
    const {children, className, hidden} = this.props;
    const parentEl = this.getTargetEl();

    const visible = purplecoatStore.purplecoatVisible;
    const coords = this.getCoordinates(parentEl);
    const style = {
      ...(coords || {}),
      display: (visible && !hidden && !!coords) ? 'block' : 'none',
    };

    const textClasses = classnames(
      Styles.PurplecoatText,
      className,
    );

    return (
      <div ref={this.meRef}>
        <Portal into='body' >
          <div
            className={Styles.PurplecoatWrapper}
            style={style}
            onClick={this.closePurplecoat}
          >
            <div className={Styles.PurplecoatInner}>
              <div className={textClasses}>
                {children}
              </div>
            </div>
          </div>
        </Portal>
      </div>
    );
  }

  private getTargetEl (): HTMLElement {
    const {forId} = this.props;

    if (forId) {
      return document.getElementById(forId);
    } else {
      const meEl = this.meRef.current;
      return meEl ? meEl.parentElement : null;
    }
  }

  private getCoordinates (parentEl: HTMLElement) {
    if (!parentEl) {
      return null;
    }

    const rect = parentEl.getBoundingClientRect();
    return pick(rect, ['top', 'left', 'width', 'height']);
  }

  private closePurplecoat = () => {
    togglePurplecoat(false);
  }

}
