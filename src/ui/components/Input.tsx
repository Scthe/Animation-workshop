import {h} from 'preact';
import {classnames, cancelEvent} from 'ui/utils';
const Styles = require('./Input.scss');

const isAlphaNumbericKey = (e: any) => e.key.length === 1;

export enum InputValidate { None, NumberDecimal, NumberFloat }
const VALIDATORS = [
  null,
  /^[-\d]$/,
  /^[-\.\d]$/,
];

interface InputProps {
  value: any;
  name: string;
  className?: string;
  disabled?: boolean;
  onInput?: Function;
  prepend?: any;
  append?: any;
  validate?: InputValidate;
  rawProps?: any;
}

// NOTE: making it uncontrolled makes it easier to add
// different validations to onKeyPress

export const Input = (props: InputProps) => {
  const {value, className, name, prepend, append, disabled, onInput, validate, rawProps} = props;

  const classes = classnames(
    Styles.InputWrapper,
    className,
    {[Styles.HasPrepend]: prepend},
    {[Styles.HasAppend]: append},
  );

  const inputClasses = classnames(
    Styles.Input,
    {[Styles.InputDisabled]: disabled},
  );

  const onKeyPress = (e: any) => {
    if (disabled) {
      cancelEvent(e);
      return;
    }
    if (!isAlphaNumbericKey(e)) {
      return;
    }

    const validator = VALIDATORS[validate];
    if (validator && !validator.test(e.key)) {
      cancelEvent(e);
    }
  };

  const onKeyUp = (e: any) => {
    if (!disabled && onInput) {
      onInput(e.target.value, e);
    }
  };

  return (
    <div className={classes}>
      {prepend && (
        <p class={Styles.InputPrepend}>{prepend}</p>
      )}
      <input
        name={name}
        className={inputClasses}
        type='text'
        value={value}
        disabled={disabled}
        onKeyPress={onKeyPress}
        onKeyUp={onKeyUp}
        {...(rawProps || {})}
      />
      {append && (
        <p class={Styles.InputAppend}>{append}</p>
      )}
    </div>
  );
};
