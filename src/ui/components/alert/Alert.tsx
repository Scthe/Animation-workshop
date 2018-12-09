import {h} from 'preact';
const Styles = require('./Alert.scss');
import {classnames} from 'ui/utils';
import {FaIcon} from 'ui/components';

export const DEFAULT_TIMEOUT = 1000;

export enum AlertType {Success, Error, Other}

export type AlertId = number;


export interface AlertProps {
  key?: AlertId;
  timeout?: number;
  msg: string;
  type: AlertType;
  icon?: any;
  className?: string;
}

const getIcon = (props: AlertProps) => {
  const {icon, type} = props;
  if (icon || icon === false) {
    return icon;
  }

  switch (type) {
    case AlertType.Success: return require('fa/faCheck');
    case AlertType.Error: return require('fa/faExclamation');
    case AlertType.Other: return null;
  }
};

export const Alert = (props: AlertProps) => {
  const {msg, type, className} = props;
  const icon = getIcon(props);

  const classes = classnames(
    Styles.Alert,
    {[Styles.AlertSuccess]: type === AlertType.Success},
    {[Styles.AlertError]:   type === AlertType.Error},
    className,
  );

  return (
    <div className={classes}>
      {icon && <FaIcon svg={icon} className={Styles.Icon} />}
      <span>{msg}</span>
    </div>
  );
};
