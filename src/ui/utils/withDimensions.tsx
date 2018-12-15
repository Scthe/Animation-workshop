import {h, Component, ComponentConstructor} from 'preact';
import get from 'lodash-es/get';
import {createRef} from './index';

interface WithDimensionsHOCState {
  width: number;
  height: number;
}

export type Dimensions = WithDimensionsHOCState; // well, it matches, so..

const getDimensions = (element: any) => {
  return {
    width: get(element, 'clientWidth', 0),
    height: get(element, 'clientHeight', 0),
  };
};

// TS complains when using FunctionalComponent ./shrug
type IPreactComponent<P = any, S = any> = ComponentConstructor<P, S>; // | FunctionalComponent<P>;

export const WithDimensions = <T extends IPreactComponent>(ComposedComponent: T) => {
  class WithDimensionsHOC extends Component<any, WithDimensionsHOCState> {

    private resizeCbDelayReqAnimFrame?: number; // guaranteed non-zero
    private thisRef = createRef();

    state = { width: 0, height: 0 };

    componentDidMount () {
      this.updateDimensions();
      window.addEventListener('resize', this.onResize, false);
    }

    componentWillUnmount () {
      window.removeEventListener('resize', this.onResize);
    }

    onResize = () => {
      if (this.resizeCbDelayReqAnimFrame) { return; }

      // could use util from /viewport, but more reusable as is now
      this.resizeCbDelayReqAnimFrame = window.requestAnimationFrame(() => {
        this.resizeCbDelayReqAnimFrame = null;
        this.updateDimensions();
      });
    }

    updateDimensions = () => {
      const {width, height} = this.state;
      const dims = getDimensions(this.thisRef.current);

      if (dims.width !== width || dims.height !== height) {
        this.setState(dims);
      }
    }

    render () {
      const newProps = {
        ...this.props,
        dimensions: this.state,
      } as any;
      return (
        <div ref={this.thisRef}>
          <ComposedComponent {...newProps} />
        </div>
      );
    }

  }
  return WithDimensionsHOC as any as T;
};
