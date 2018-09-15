import {h, Component} from 'preact';
import {classnames} from 'ui/utils';
const Styles = require('./Checkbox.scss');

interface CheckboxProps {
  id: string;
  className?: string;
  value: boolean;
  onChecked: Function;
  children: any; // label
}

export const Checkbox = (props: CheckboxProps) => {
  const {id, className, children, onChecked, value} = props;

  const classes = classnames(
    Styles.Checkbox,
    value ? Styles.CheckboxChecked : Styles.CheckboxUnchecked,
    className,
  );

  const handler = (e: any) => {
    e.preventDefault();
    e.stopPropagation();

    if (onChecked) { onChecked(!value); }
  };

  return (
    <div className={classes}>
      <input id={id} type='checkbox' checked={value} className={Styles.CheckboxInput} />
      <label for={id} className={Styles.CheckboxLabel} onClick={handler}>
        {children}
      </label>
    </div>
  );
};
