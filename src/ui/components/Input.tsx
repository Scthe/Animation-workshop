import {h, Component} from 'preact';
import {classnames} from 'ui/utils';
const Styles = require('./Input.scss');

interface InputProps {
  value: any;
  name: string;
  className?: string;
  disabled?: boolean;
  onInput?: Function;
  prepend?: any;
  append?: any;
}

export const Input = (props: InputProps) => {
  const {value, className, name, prepend, append, disabled, onInput} = props;

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

  const handleChange = (e: any) => {
    console.log(e.target.value, e);
    const nextText = e.target.value + e.key;
    if (onInput) { onInput(nextText, e); }
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
        onKeyPress={handleChange}
      />
      {append && (
        <p class={Styles.InputAppend}>{append}</p>
      )}
    </div>
  );
};
