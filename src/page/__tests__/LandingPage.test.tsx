import { shallow } from 'enzyme';
import * as React from 'react';

import { LandingPageClass } from '~contact-map-site~/page';

describe('LandingPage', () => {
  it('Should match existing snapshot when no props are provided.', () => {
    const wrapper = shallow(<LandingPageClass />);
    expect(wrapper).toMatchSnapshot();
  });
});
