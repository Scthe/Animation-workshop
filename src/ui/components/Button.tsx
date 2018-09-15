import {h, Component} from 'preact';
import {classnames} from 'ui/utils';
const Styles = require('./Button.scss');

interface ButtonProps {
  className?: string;
  children: any;
  onClick: Function;
}

export const Button = (props: ButtonProps) => {
  const {className, children, onClick} = props;

  const classes = classnames(
    Styles.Button,
    className,
  );

  const handler = (e: any) => {
    e.preventDefault();
    e.stopPropagation();

    if (onClick) { onClick(e); }
  };

  return (
    <button onClick={handler}>{children}</button>
  );
};
