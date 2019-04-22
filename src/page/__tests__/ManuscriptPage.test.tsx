import { shallow } from 'enzyme';
import * as React from 'react';

import { ManuscriptPage } from '~contact-map-site~/page';

describe('ManuscriptPage', () => {
  it('Should match existing snapshot when no props are provided.', () => {
    const wrapper = shallow(<ManuscriptPage />);
    expect(wrapper).toMatchSnapshot();
  });
});
