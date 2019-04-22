import { shallow } from 'enzyme';
import * as React from 'react';

import { SiteHeader } from '~contact-map-site~/container';

describe('SiteHeader', () => {
  it('Should match existing snapshot when no props are provided.', () => {
    const wrapper = shallow(<SiteHeader />);
    expect(wrapper).toMatchSnapshot();
  });
});
