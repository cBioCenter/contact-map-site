import { shallow } from 'enzyme';
import * as React from 'react';

import { UnconnectedSiteHeader } from '~contact-map-site~/container';

describe('SiteHeader', () => {
  it('Should match existing snapshot when no props are provided.', () => {
    const wrapper = shallow(<UnconnectedSiteHeader pathname={'/'} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('Should update the menu buttons when changing pages.', () => {
    const wrapper = shallow(<UnconnectedSiteHeader pathname={''} />);
    wrapper.setProps({
      pathname: '/manuscript',
    });
    expect(wrapper).toMatchSnapshot();
  });
});
