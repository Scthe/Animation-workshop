import {h, Component} from 'preact';
import {
  Modal,
  ButtonTheme,
  Input, InputValidate,
} from 'ui/components';


interface MoveKeyframeModalProps {
  isOpen: boolean;
  initFrame: number;
  onClose: () => void;
  onKeyframeMove: (nextFrameId: number) => void;
}


export class MoveKeyframeModal extends Component<MoveKeyframeModalProps, any> {

  constructor(props: MoveKeyframeModalProps) {
    super();
    this.state = {
      value: `${props.initFrame}`
    };
  }

  public render() {
    const {isOpen, onClose, initFrame} = this.props;

    return (
      <Modal
        open={isOpen}
        buttons={[
          {
            onClick: onClose,
            children: 'Cancel',
          },
          {
            onClick: this.onMoveKeyframeConfirmed,
            theme: ButtonTheme.Blue,
            children: 'Move the keyframe',
          }
        ]}
      >
        <p>
          Move keyframe from {initFrame} to:
        </p>
        <Input
          name='move-frame'
          value={this.state.value}
          onInput={this.onInput}
          validate={InputValidate.NumberDecimal}
          rawProps={{
            maxlength: 3,
            style: { marginBottom: '10px' },
          }}
        />
      </Modal>
    );
  }

  private onMoveKeyframeConfirmed = () => {
    const {onKeyframeMove} = this.props;
    const val = parseFloat(this.state.value);
    if (!isNaN(val)) {
      onKeyframeMove(val);
    }
  }

  private onInput = (e: any) => {
    this.setState({
      value: e,
    });
  }

}
