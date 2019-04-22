import { shallow } from 'enzyme';
import * as React from 'react';

import { ContactMapSitePage } from '~contact-map-site~/page';

describe('ContactMapSitePage', () => {
  it('Should match existing snapshot when no props are provided.', () => {
    const wrapper = shallow(<ContactMapSitePage />);
    expect(wrapper).toMatchSnapshot();
  });
});
