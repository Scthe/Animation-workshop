import {observable, computed, action} from 'mobx';

export const timerData = observable({ secondsPassed: 0 });

setInterval(() => {
  timerData.secondsPassed++;
}, 1000);

///////////////////////////////////

// TODO make maxFrame a @computed props

/*
import {observer, inject, Provider} from 'mobx-preact';

@observer
class StateTest extends Component<any, any> {
  render () {
    const {timerData} = this.props;
    return (
      <div>Seconds passed 1: { timerData.secondsPassed % 60 }</div>
    );
  }
}

const StateTest2 = observer(({ timerData }) =>
  <div>Seconds passed 2: {timerData.secondsPassed}</div>);

@inject('timerData')
@observer
class StateTest3 extends Component<any, any> {
  render () {
    const {timerData} = this.props;
    return (
      <div>Seconds passed 3: { timerData.secondsPassed % 60 }</div>
    );
  }
}
*/
