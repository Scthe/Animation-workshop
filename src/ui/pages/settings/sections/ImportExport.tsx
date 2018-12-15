import {h, Component} from 'preact';
import {observer, inject} from 'mobx-preact';
import {toJS} from 'mobx';
import {download, processTextFileUpload, createRef} from 'ui/utils';
const Styles = require('./ImportExport.scss');
import {Button, ButtonTheme, Modal, withAlerts, AlertType} from 'ui/components';
import {TimelineState} from 'state';
import {serialize, deserialize} from 'state/storage';

const FILE_EXTENSION = '.anim.json';
const ALERT_TIMEOUT = 3000;

interface ImportExportProps {
  timelineState?: TimelineState;
  showAlert?: Function;
}

interface ImportExportState {
  isResetModalOpen: boolean;
}

@inject('timelineState')
@observer
@withAlerts
export class ImportExport extends Component<ImportExportProps, ImportExportState> {

  private fileInputRef = createRef();

  state = {
    isResetModalOpen: false,
  };

  public render () {
    const {isResetModalOpen} = this.state;

    return (
      <div>
        <input
          name='importfile'
          ref={this.fileInputRef}
          type='file'
          accept='.json'
          style='display:none'
          onChange={this.onImportFileChanged}
        />
        <Button
          onClick={this.onImportOpen}
          theme={ButtonTheme.Beige}
          className={Styles.InSectionBtn}
        >
          Import scene
        </Button>

        <Button
          onClick={this.onExport}
          theme={ButtonTheme.Beige}
          className={Styles.InSectionBtn}
        >
          Export scene
        </Button>

        <Button
          onClick={this.openResetModal}
          theme={ButtonTheme.Beige}
          className={Styles.InSectionBtn}
        >
          Reset scene
        </Button>

        {/* confirm reset modal */}
        <Modal
          open={isResetModalOpen}
          buttons={[
            {
              onClick: this.closeResetModal,
              children: 'Cancel',
            },
            {
              onClick: this.onResetConfirmed,
              theme: ButtonTheme.Blue,
              children: 'Yes, reset the scene',
            }
          ]}
        >
          <p className={Styles.ModalText}>
            Are You sure You want to reset the current scene?
          </p>
        </Modal>
      </div>
    );
  }

  private onImportOpen = () => {
    // https://developer.mozilla.org/en-US/docs/Web/API/File/Using_files_from_web_applications#Using_hidden_file_input_elements_using_the_click()_method
    const fileInputRef = this.fileInputRef.current;
    if (fileInputRef) {
      fileInputRef.click();
    }
  }

  private onImportFileChanged = async (e: Event) => {
    const {timelineState, showAlert} = this.props;

    try {
      const fileText = await processTextFileUpload(e);
      if (!fileText) {
        throw 'Could not read as a text file';
      }
      const newVal = deserialize(fileText);
      if (!newVal) {
        throw 'Could not parse animation file';
      }

      timelineState.reset(newVal);
      showAlert({
        msg: 'File imported',
        type: AlertType.Success,
        timeout: ALERT_TIMEOUT,
      });
    } catch (e) {
      showAlert({
        msg: e,
        type: AlertType.Error,
        timeout: ALERT_TIMEOUT,
      });
    }
  }

  private generateFilename () {
    const d = new Date();
    const padWith0 = (n: number) => `0${n}`.slice(-2);
    return [
      padWith0(d.getFullYear()), '-',
      padWith0(d.getMonth() + 1), '-',
      padWith0(d.getDate()), '__',
      padWith0(d.getHours()), '_',
      padWith0(d.getMinutes()),
      FILE_EXTENSION
    ].join('');
  }

  private onExport = () => {
    const {timelineState, showAlert} = this.props;

    try {
      const json = toJS(timelineState);
      const item = serialize(json);
      if (!item) {
        throw 'Could not serialize into a file';
      }

      download(this.generateFilename(), item);
      showAlert({
        msg: 'File ready for download',
        type: AlertType.Success,
        timeout: ALERT_TIMEOUT,
      });
    } catch (e) {
      showAlert({
        msg: e,
        type: AlertType.Error,
        timeout: ALERT_TIMEOUT,
      });
    }
  }

  private openResetModal = () => this.setState({ isResetModalOpen: true});
  private closeResetModal = () => this.setState({ isResetModalOpen: false});

  private onResetConfirmed = () => {
    const {timelineState, showAlert} = this.props;
    timelineState.reset();
    this.closeResetModal();

    showAlert({
      msg: 'Scene reset success',
      type: AlertType.Success,
      timeout: ALERT_TIMEOUT,
    });
  }

}
