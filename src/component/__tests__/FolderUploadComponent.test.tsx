import { shallow } from 'enzyme';
import * as React from 'react';

import { FolderUploadComponent } from '~contact-map-site~/component';

describe('FolderUploadComponent', () => {
  it('Should match existing snapshot when no props are provided.', () => {
    const wrapper = shallow(<FolderUploadComponent />);
    expect(wrapper).toMatchSnapshot();
  });
});
