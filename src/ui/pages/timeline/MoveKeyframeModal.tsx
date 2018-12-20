import {h, Component} from 'preact';
import {
  Modal,
  ButtonTheme,
  Input, InputValidate,
} from 'ui/components';


export enum MoveKeyframeMode {
  Closed, MoveKeyframe, DuplicateKeyframe
}

interface MoveKeyframeModalProps {
  openMode: MoveKeyframeMode;
  initFrame: number;
  onClose: () => void;
  onKeyframeMove: (mode: MoveKeyframeMode, nextFrameId: number) => void;
}


export class MoveKeyframeModal extends Component<MoveKeyframeModalProps, any> {

  constructor(props: MoveKeyframeModalProps) {
    super();
    this.state = {
      value: `${props.initFrame}`
    };
  }

  public render() {
    const {openMode, onClose} = this.props;
    const texts = this.getText();

    return (
      <Modal
        open={openMode !== MoveKeyframeMode.Closed}
        buttons={[
          {
            onClick: onClose,
            children: 'Cancel',
          },
          {
            onClick: this.onMoveKeyframeConfirmed,
            theme: ButtonTheme.Blue,
            children: texts.okBtn,
          }
        ]}
      >
        <p>{texts.content}</p>
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
    const {onKeyframeMove, openMode} = this.props;
    const val = parseFloat(this.state.value);
    if (!isNaN(val)) {
      onKeyframeMove(openMode, val);
    }
  }

  private onInput = (e: any) => {
    this.setState({
      value: e,
    });
  }

  private getText () {
    const {openMode, initFrame} = this.props;
    const isDupl = openMode === MoveKeyframeMode.DuplicateKeyframe;

    return {
      okBtn: isDupl
        ? 'Duplicate the keyframe'
        : 'Move the keyframe',
      content:  isDupl
        ? `Duplicate ${initFrame} to frame:`
        : `Move keyframe from ${initFrame} to:`,
    };
  }
}
