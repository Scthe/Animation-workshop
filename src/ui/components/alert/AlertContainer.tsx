import {h, Component} from 'preact';
import {observer} from 'mobx-preact';
const Portal = require('preact-portal');
const Styles = require('./AlertContainer.scss');
import {alertStore} from './AlertStore';
import {Alert} from './Alert';

interface AlertContainerProps {
}

@observer
export class AlertContainer extends Component<AlertContainerProps, any> {

  public render () {
    return (
      <Portal into='body'>
        <div className={Styles.AlertContainer}>
          {alertStore.alerts.map(a => <Alert key={a.key} {...a} />)}
        </div>
      </Portal>
    );
  }

}
