import {h, Component} from 'preact';
import {observer, inject} from 'mobx-preact';
import {toJS} from 'mobx';
import {download, processTextFileUpload, createRef} from 'ui/utils';
const Styles = require('./ImportExport.scss');
import {Button, ButtonTheme, Modal} from 'ui/components';
import {TimelineState} from 'state';
import {serialize, deserialize} from 'state/storage';

const FILE_EXTENSION = '.anim.json';

interface ImportExportProps {
  timelineState?: TimelineState;
}

interface ImportExportState {
  isResetModalOpen: boolean;
}

@inject('timelineState')
@observer
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
    const {timelineState} = this.props;

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
    } catch (e) {
      // TODO notification
      console.error(e);
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
    const {timelineState} = this.props;

    try {
      const json = toJS(timelineState);
      const item = serialize(json);
      if (item) {
        download(this.generateFilename(), item);
      } else {
        throw 'Could not serialize into a file';
      }
    } catch (e) {
      // TODO notification
      console.error(e);
    }
  }

  private openResetModal = () => this.setState({ isResetModalOpen: true});
  private closeResetModal = () => this.setState({ isResetModalOpen: false});

  private onResetConfirmed = () => {
    const {timelineState} = this.props;
    timelineState.reset();
    this.closeResetModal();
  }

}
