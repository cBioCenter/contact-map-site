import { mount, shallow } from 'enzyme';
import * as React from 'react';
import { Provider } from 'react-redux';

import { BioblocksPDB, CONTACT_DISTANCE_PROXIMITY, Store } from 'bioblocks-viz';
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

  it('Should match existing snapshot when given a PDB.', async () => {
    const pdbData = await BioblocksPDB.createPDB('sample.pdb');
    const wrapper = shallow(<LandingPageClass />);
    wrapper.setState({
      pdbData,
    });
    expect(wrapper).toMatchSnapshot();
  });

  it('Should match existing snapshot when using closest proximity.', async () => {
    const pdbData = await BioblocksPDB.createPDB('sample.pdb');
    const wrapper = shallow(<LandingPageClass />);
    wrapper.setState({
      measuredProximity: CONTACT_DISTANCE_PROXIMITY.CLOSEST,
      pdbData,
    });
    expect(wrapper).toMatchSnapshot();
  });

  it('Should match existing snapshot when using c-alpha proximity.', async () => {
    const pdbData = await BioblocksPDB.createPDB('sample.pdb');
    const wrapper = shallow(<LandingPageClass />);
    wrapper.setState({
      measuredProximity: CONTACT_DISTANCE_PROXIMITY.C_ALPHA,
      pdbData,
    });
    expect(wrapper).toMatchSnapshot();
  });
});
