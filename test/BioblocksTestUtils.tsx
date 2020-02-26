import { mount, shallow } from 'enzyme';
// tslint:disable-next-line: no-submodule-imports
import * as React from 'react';

/**
 * Helper function to create and wait for a Component to be mounted.
 *
 * @param Component The component to mount.
 * @returns A wrapper for the component.
 */
export const getAsyncMountedComponent = async (Component: React.ReactElement) => {
  const wrapper = mount(Component);
  wrapper.update();
  await flushPromises();

  return wrapper;
};

/**
 * Helper function to create and wait for a Component via enzyme's shallow render method..
 *
 * @param Component The component to mount.
 * @returns A wrapper for the component.
 */
export const getAsyncShallowComponent = async (Component: React.ReactElement) => {
  const wrapper = shallow(Component);
  wrapper.update();
  await flushPromises();

  return wrapper;
};

// Helpful when dealing with async component lifecycle method testing.
// https://medium.com/@lucksp_22012/jest-enzyme-react-testing-with-async-componentdidmount-7c4c99e77d2d
export const flushPromises = async () => new Promise(setImmediate);
