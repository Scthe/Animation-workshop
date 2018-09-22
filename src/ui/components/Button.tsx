import {h, Component} from 'preact';
import {classnames} from 'ui/utils';
const Styles = require('./Button.scss');

export enum ButtonTheme { Blue, Green, Red, Yellow, Beige, Brown }

const getThemeClass = (theme: ButtonTheme) => {
  switch (theme) {
    case ButtonTheme.Blue:   return Styles.Blue;
    case ButtonTheme.Green:  return Styles.Green;
    case ButtonTheme.Red:    return Styles.Red;
    case ButtonTheme.Yellow: return Styles.Yellow;
    case ButtonTheme.Brown:  return Styles.Brown;
    default:
    case ButtonTheme.Beige:  return Styles.Beige;
  }
};


interface ButtonProps {
  className?: string;
  children: any;
  onClick: Function;
  theme?: ButtonTheme;
  disabled?: boolean;
  active?: boolean;
}

export const Button = (props: ButtonProps) => {
  const {className, children, onClick, theme, disabled, active} = props;

  const classes = classnames(
    Styles.Button,
    className,
    getThemeClass(theme),
    {[Styles.Disabled]: disabled},
    {[Styles.Active]: active},
  );

  const handler = (e: any) => {
    e.preventDefault();
    e.stopPropagation();

    if (!disabled && onClick) { onClick(e); }
  };

  return (
    <button onClick={handler} className={classes}>{children}</button>
  );
};
