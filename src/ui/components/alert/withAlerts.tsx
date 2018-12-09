import {h, ComponentConstructor} from 'preact';
import {debounce} from 'lodash';
import {showAlert, hideAlert} from './AlertStore';

// will not register dependency on mobx
const showAlert_ = debounce(showAlert, 10);

export const withAlerts = <P, S, T extends ComponentConstructor<P, S>>(
  ComposedComponent: T
): T => {

  return ((props: P) => {
    const newProps = {
      ...(props as any),
      showAlert: showAlert_,
      hideAlert,
    };
    return <ComposedComponent {...newProps} />;
  }) as any as T;
};
