// based on https://github.com/mobxjs/mobx-react
// see licence at: https://github.com/mobxjs/mobx-react/blob/master/LICENSE


declare module 'mobx-preact' {

/**
 * Turns a React component or stateless render function into a reactive component.
 */
import Preact = require("preact")

// export type IPreactComponent<P = any, S = any> = Preact.AnyComponent<P, S>;
// export type IPreactComponent<P = any, S = any> = Preact.Component<P, S>;
export type IPreactComponent<P = any, S = any> = Preact.ComponentConstructor<P, S> | Preact.FunctionalComponent<P>;

/**
 * Observer
 */

// Deprecated: observer with with stores (as decorator)
// export function observer(stores: string[]): <T extends IPreactComponent>(clazz: T) => void
// Deprecated: observer with with stores
// export function observer<T extends IPreactComponent>(stores: string[], clazz: T): T

export function observer<T extends IPreactComponent>(target: T): T

/**
 * Inject
 */
/*
export type IValueMap = { [key: string]: any }
export type IStoresToProps<
    S extends IValueMap = {},
    P extends IValueMap = {},
    I extends IValueMap = {},
    C extends IValueMap = {}
> = (stores: S, nextProps: P, context: C) => I

export type IWrappedComponent<P> = {
    wrappedComponent: IPreactComponent<P>
    wrappedInstance: React.ReactInstance | undefined
}
*/

// Ideally we would want to return React.ComponentClass<Partial<P>>,
// but TS doesn't allow such things in decorators, like we do in the non-decorator version
// See also #256
export function inject(
    ...stores: string[]
): <T extends IPreactComponent>(target: T) => T // => T & IWrappedComponent<T>

// export function inject<S, P, I, C>(
    // fn: IStoresToProps<S, P, I, C>
// ): <T extends IPreactComponent>(target: T) => T & IWrappedComponent<T>

// Ideal implemetnation:
// export function inject
// (
// fn: IStoresToProps
// ):
// <P>(target: IPreactComponent<P>) => IPreactComponent<Partial<P>> & IWrappedComponent<IPreactComponent<Partial<P>>>
//
// Or even better: (but that would require type inference to work other way around)
// export function inject<P, I>
// (
// fn: IStoresToProps<any, P, I>
// ):
// <T extends IPreactComponent<P & S>(target: T) => IPreactComponent<P> & IWrappedComponent<T>

/**
 * Utilities
 */
export function onError(cb: (error: Error) => void): () => void

export class Provider extends Preact.Component<any, {}> {
  render(props?: any, state?: any, context?: any): Preact.ComponentChild;
}

export class Observer extends Preact.Component<
    {
        children?: () => Preact.ComponentChild //React.ReactNode
        render?: () => Preact.ComponentChild // React.ReactNode
    },
    {}
> {
  render(props?: any, state?: any, context?: any): Preact.ComponentChild;
}

export function useStaticRendering(value: boolean): void


} // END: declare module 'mobx-preact'
