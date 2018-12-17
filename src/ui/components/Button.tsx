import {h} from 'preact';
import {classnames, cancelEvent} from 'ui/utils';
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

export interface ButtonProps {
  className?: string;
  children: any;
  onClick?: Function;
  to?: string; // alternative as link
  theme?: ButtonTheme;
  disabled?: boolean;
  active?: boolean;
}

const isLink = (props: ButtonProps) => !!props.to;

const getClasses = (props: ButtonProps) => {
  const {className, theme, disabled, active} = props;
  return classnames(
    Styles.Button,
    className,
    getThemeClass(theme),
    {[Styles.Disabled]: disabled},
    {[Styles.Active]: active},
    isLink(props) ? Styles.ButtonLink : Styles.ButtonAction,
  );
};

const renderAsLink = (props: ButtonProps) => {
  const {children, to} = props;
  return (
    <a href={to} target='_blank' rel='noopener noreferrer' className={getClasses(props)}>
      {children}
    </a>
  );
};

export const Button = (props: ButtonProps) => {
  const {children, onClick, disabled} = props;

  const handler = (e: any) => {
    cancelEvent(e);

    if (!disabled && onClick) { onClick(e); }
  };

  return isLink(props) ? renderAsLink(props) : (
    <button onClick={handler} className={getClasses(props)}>{children}</button>
  );
};
