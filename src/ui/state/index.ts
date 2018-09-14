import {observable, computed, action} from 'mobx';

export const timerData = observable({ secondsPassed: 0 });

setInterval(() => {
  timerData.secondsPassed++;
}, 1000);
