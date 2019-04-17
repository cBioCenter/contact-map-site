import { mount, shallow } from 'enzyme';
import * as React from 'react';
import { Provider } from 'react-redux';

import { Store } from 'bioblocks-viz';
import { LandingPageClass } from '~contact-map-site~/page';

describe('LandingPage', () => {
  it('Should match existing snapshot when no props are provided.', () => {
    const wrapper = shallow(<LandingPageClass />);
    expect(wrapper).toMatchSnapshot();
  });

  it('Should match existing snapshot when hooked up to a Redux store.', () => {
    const wrapper = mount(
      <Provider store={Store}>
        <LandingPageClass />
      </Provider>,
    );
    expect(wrapper).toMatchSnapshot();
  });
});
