import {h, Component} from 'preact';
import {classnames, createRef} from 'ui/utils';
const Styles = require('./Tooltip.scss');

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
  }

  public componentWillUnmount () {
    const targetEl = this.getTargetEl();
    if (targetEl) {
      targetEl.removeEventListener('mouseenter', this.onMouseEnter);
      targetEl.removeEventListener('mouseleave', this.onMouseLeave);
    }
  }

  public render () {
    const {text, position, className} = this.props;
    const targetEl = this.getTargetEl();

    return (
      <div className={this.getClasses(targetEl)} ref={this.meRef}>
        <div className={Styles.Tooltip}
          style={this.getCoordinates(targetEl)}
        >
          {text}
        </div>
      </div>
    );
  }

  private getClasses (target: HTMLElement) {
    const {className, position, swapDirection} = this.props;
    return classnames(
      Styles.TooltipWrapper,
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
    const {position, swapDirection} = this.props;
    if (!target) { return { display: 'none' }; }

    const rect = target.getBoundingClientRect();

    switch (position) {
      case TooltipPosition.Bottom:
        return {
          top: rect.height,
          right: swapDirection ? -rect.width : 'auto',
        };
      case TooltipPosition.Left:
        return {};
      case TooltipPosition.Right:
        return {
          left: rect.width,
        };
      case TooltipPosition.Top:
      default:
        return {
          right: swapDirection ? -rect.width : 'auto',
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
