import {observable} from 'mobx';
import {DEFAULT_TIMEOUT, AlertProps, AlertId} from './Alert';

class AlertStore {

  @observable alerts: AlertProps[] = [];

  // @action // ?
  addAlert (alert: AlertProps) {
    this.alerts = [...this.alerts, alert];
  }

  // @action // ?
  removeAlert (key: AlertId) {
    this.alerts = this.alerts.filter(a => a.key !== key);
  }

}

export const alertStore = new AlertStore();

const generateId = ((id) => {
  return (): AlertId => id++;
})(1);

export const hideAlert = (key: AlertId) => {
  alertStore.removeAlert(key);
};

export const showAlert = (alert: AlertProps) => {
  alert.key = alert.key || generateId();
  alert.timeout = alert.timeout === undefined ? DEFAULT_TIMEOUT : alert.timeout;

  alertStore.addAlert(alert);

  if (alert.timeout) {
    setTimeout(() => {
      hideAlert(alert.key);
    }, alert.timeout);
  }

  return alert.key;
};
