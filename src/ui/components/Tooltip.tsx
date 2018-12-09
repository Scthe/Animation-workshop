import {h, Component} from 'preact';
const Portal = require('preact-portal');
import {classnames, createRef} from 'ui/utils';
const Styles = require('./Tooltip.scss');

const PARENT_ELEMENT = '#tooltip-container';

export enum TooltipPosition { Top, Bottom, Left, Right }

interface TooltipProps {
  text: string;
  className?: string;
  position?: TooltipPosition;
  swapDirection?: boolean;
}

interface TooltipState {
  isVisible: boolean;
}


export class Tooltip extends Component<TooltipProps, TooltipState> {

  private meRef = createRef();

  state = {
    isVisible: false,
  };

  public componentDidMount () {
    const targetEl = this.getTargetEl();
    if (targetEl) {
      targetEl.addEventListener('mouseenter', this.onMouseEnter);
      targetEl.addEventListener('mouseleave', this.onMouseLeave);
    } else {
      throw `Could not find target for tooltip with text: '${this.props.text}'`;
    }

    this.forceUpdate(); // re-render after getting refs
  }

  public componentWillUnmount () {
    const targetEl = this.getTargetEl();
    if (targetEl) {
      targetEl.removeEventListener('mouseenter', this.onMouseEnter);
      targetEl.removeEventListener('mouseleave', this.onMouseLeave);
    }
  }

  public render () {
    const {text} = this.props;
    const targetEl = this.getTargetEl();

    return (
      <div ref={this.meRef} className={Styles.TooltipWrapper}>
        <Portal into={PARENT_ELEMENT}>
          <span
            className={this.getClasses(targetEl)}
            style={this.getCoordinates(targetEl)}
          >
            {text}
          </span>
        </Portal>
      </div>
    );
  }

  private getClasses (target: HTMLElement) {
    const {className, position, swapDirection} = this.props;
    return classnames(
      Styles.Tooltip,
      className,
      this.isShowTooltip(target) ? Styles.TooltipActive : Styles.TooltipInactive,
      {[Styles.TooltipBottom]: position === TooltipPosition.Bottom},
      {[Styles.TooltipLeft]  : position === TooltipPosition.Left},
      {[Styles.TooltipRight] : position === TooltipPosition.Right},
      {[Styles.TooltipTop]   : position === TooltipPosition.Top || !position},
      swapDirection ? Styles.TooltipSwapDir : Styles.TooltipNormDir,
    );
  }

  private isShowTooltip (target: HTMLElement) {
    const {text} = this.props;
    const {isVisible} = this.state;
    return target && isVisible && text && text.length > 0;
  }

  private getTargetEl (): any {
    const meEl = this.meRef.current;
    if (!meEl) {
      return null;
    }

    return meEl.nextElementSibling;
  }

  private getCoordinates (target: HTMLElement) {
    if (!target) { // only during 1st render
      return { display: 'none' };
    }

    const {position, swapDirection} = this.props;
    const rect = target.getBoundingClientRect();
    const edgeRight = document.body.clientWidth - rect.right;
    const verticalTtipStyleHoriz = (swapDirection
      ? { right: edgeRight, }
      : { left: rect.left, }
    );

    switch (position) {
      case TooltipPosition.Bottom:
        return {
          top: rect.top + rect.height,
          ...verticalTtipStyleHoriz,
        };
      case TooltipPosition.Left:
        return {
          top: rect.top,
          right: edgeRight + rect.width,
        };
      case TooltipPosition.Right:
        return {
          top: rect.top,
          left: rect.right,
        };
      case TooltipPosition.Top:
      default:
        return {
          top: rect.top - rect.height,
          ...verticalTtipStyleHoriz,
        };
    }
  }

  private onMouseEnter = () => {
    this.setState({ isVisible: true, });
  }

  private onMouseLeave = () => {
    this.setState({ isVisible: false, });
  }

}
