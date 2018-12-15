import {h, Component} from 'preact';
import {classnames, createRef, clamp} from 'ui/utils';
const Styles = require('./Slider.scss');

interface SliderProps {
  className?: string;
  onChange?: Function;
  onSelected?: Function;
  name: string;
  label: string;
  max: number;
  min: number;
  value: number;
}

interface SliderState {
  isDragging: boolean;
}

export class Slider extends Component<SliderProps, SliderState> {

  private wrapperRef = createRef();
  private inputRef = createRef();
  private thumbRef = createRef();
  private thumbValueRef = createRef();

  state = {
    isDragging: false,
  };

  public componentDidMount () {
    const el = this.wrapperRef.current;
    el.addEventListener('mousedown', this.onMouseDown);
    el.addEventListener('mouseup', this.onMouseUp);
    el.addEventListener('mousemove', this.onMouseMove);
    el.addEventListener('mouseout', this.onMouseUp);
    this.updateThumb();
  }

  public render () {
    const {name, label, min, max, value} = this.props;
    const {isDragging} = this.state;

    const thumbClasses = classnames(
      Styles.SliderPopup,
      {[Styles.active]: isDragging},
    );

    return (
      <div className={this.getClasses()}>
        <label for={name} className={Styles.Label}>{label}</label>
        <div ref={this.wrapperRef}>
          <input
            id={name}
            type='range'
            min={min}
            max={max}
            value={value}
            ref={this.inputRef}
            className={Styles.SliderInput}
          />
          <span className={thumbClasses} ref={this.thumbRef}>
            <span className={Styles.SliderPopupValue} ref={this.thumbValueRef}>
              {this.getCurrentValue()}
            </span>
          </span>
        </div>
      </div>
    );
  }

  private getClasses () {
    const {className} = this.props;
    return classnames(
      Styles.SliderWrapper,
      className,
    );
  }

  private onMouseDown = (e: any) => {
    this.setState({ isDragging: true, });
    this.updateThumb();
  }

  private onMouseUp = (e: any) => {
    this.setState({ isDragging: false, });

    const {onSelected} = this.props;
    if (onSelected) {
      onSelected(this.getCurrentValue());
    }
  }

  private onMouseMove = (e: any) => {
    const {onChange} = this.props;
    const {isDragging} = this.state;

    if (isDragging) {
      this.updateThumb();
      if (onChange) {
        onChange(this.getCurrentValue());
      }
    }
  }

  private updateThumb() {
    // update text
    const thumbValueEl = this.thumbValueRef.current;
    const currentValue = this.getCurrentValue();
    thumbValueEl.textContent = currentValue;

    // update position
    // NOTE: this does not cause React redraw, we have to manually
    const thumbEl = this.thumbRef.current;
    thumbEl.style.left = `${this.getThumbOffsetLeft()}px`;
  }

  private getBoundingRect() {
    const wrapperEl = this.wrapperRef.current;
    return wrapperEl ? wrapperEl.getBoundingClientRect() : null;
  }

  private getThumbOffsetLeft() {
    const {min, max} = this.props;
    const currentValue = this.getCurrentValue();

    const rect = this.getBoundingRect();
    if (!rect) {
      return 0;
    }

    const progress = (currentValue - min) / (max - min);
    const width = rect.width - 20; // ?!
    return clamp(progress * width, 0, width);
  }

  private getCurrentValue () {
    const inputEl = this.inputRef.current;
    return inputEl ? inputEl.value : 0;
  }

}
