import {h} from 'preact';
const Portal = require('preact-portal');
const Styles = require('./Modal.scss');
import {Button, ButtonProps} from './Button';

interface ModalProps {
  open: boolean;
  into?: string;
  children: any;
  buttons?: ButtonProps[];
}

export const Modal = (props: ModalProps) => {
  const {open, into, children, buttons} = props;
  if (!open) {
    return null;
  }

  return (
    <Portal into={into || 'body'}>
      <div className={Styles.ModalOverlay}>
        <div className={Styles.ModalWrapper}>
          <div className={Styles.ModalContent}>
            {children}
            {buttons && (
              <div className={Styles.ModalButtons}>
                {buttons.map(btnProps => (
                  <Button
                    {...btnProps}
                    className={Styles.ModalBtn}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Portal>
  );
};
