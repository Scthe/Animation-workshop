import {h} from 'preact';
import {classnames} from 'ui/utils';
const Styles = require('./ButtonGroup.scss');

interface ButtonGroupProps {
  children: any;
  className?: string;
}

export const ButtonGroup = (props: ButtonGroupProps) => {
  const {children, className} = props;
  const classes = classnames(
    className,
    Styles.ButtonGroup,
  );

  return (
    <div className={classes}>{children}</div>
  );
};
