import {h, Component} from 'preact';
import {classnames} from 'ui/utils';
const Styles = require('./Timeline.scss');
import {TimelineButtonRow} from './TimelineButtonRow';
import {TimelineAxis} from './TimelineAxis';


interface TimelineProps {
  className?: string;
}

export class Timeline extends Component<TimelineProps, any> {

  public render() {
    const {className} = this.props;

    return (
      <div className={this.getClasses()}>
        <TimelineButtonRow />
        <TimelineAxis />
      </div>
    );
  }

  private getClasses () {
    const {className} = this.props;
    return classnames(
      Styles.Timeline,
      className,
    );
  }

}
