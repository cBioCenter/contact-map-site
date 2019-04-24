import { mount, shallow } from 'enzyme';
import * as React from 'react';
import { Provider } from 'react-redux';
import { Modal } from 'semantic-ui-react';

import { BioblocksPDB, CONTACT_DISTANCE_PROXIMITY, Store } from 'bioblocks-viz';
import { FolderUploadComponent } from '~contact-map-site~/component';
import { VisualizationPageClass } from '~contact-map-site~/page';

describe('VisualizationPage', () => {
  beforeEach(() => {
    jest.resetModuleRegistry();
    jest.dontMock('ngl');
  });

  it('Should match existing snapshot when no props are provided.', () => {
    const wrapper = shallow(<VisualizationPageClass />);
    expect(wrapper).toMatchSnapshot();
  });

  it('Should match existing snapshot when hooked up to a Redux store.', () => {
    const wrapper = mount(
      <Provider store={Store}>
        <VisualizationPageClass />
      </Provider>,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('Should match existing snapshot when given a PDB.', async () => {
    const pdbData = await BioblocksPDB.createPDB('sample.pdb');
    const wrapper = shallow(<VisualizationPageClass />);
    wrapper.setState({
      pdbData,
    });
    expect(wrapper).toMatchSnapshot();
  });

  it('Should match existing snapshot when using closest proximity.', async () => {
    const pdbData = await BioblocksPDB.createPDB('sample.pdb');
    const wrapper = shallow(<VisualizationPageClass />);
    wrapper.setState({
      measuredProximity: CONTACT_DISTANCE_PROXIMITY.CLOSEST,
      pdbData,
    });
    expect(wrapper).toMatchSnapshot();
  });

  it('Should match existing snapshot when using c-alpha proximity.', async () => {
    const pdbData = await BioblocksPDB.createPDB('sample.pdb');
    const wrapper = shallow(<VisualizationPageClass />);
    wrapper.setState({
      measuredProximity: CONTACT_DISTANCE_PROXIMITY.C_ALPHA,
      pdbData,
    });
    expect(wrapper).toMatchSnapshot();
  });

  it('Should update the state based on drag events.', () => {
    const wrapper = shallow(<VisualizationPageClass />);
    const instance = wrapper.instance() as VisualizationPageClass;
    expect(instance.state.isDragHappening).toBe(false);
    window.dispatchEvent(new Event('dragover'));
    expect(instance.state.isDragHappening).toBe(true);

    const onClose = wrapper.find(Modal).props().onClose;
    if (!onClose) {
      expect(onClose).not.toBeUndefined();
    } else {
      const event = { clientX: 100, clientY: 0 };
      onClose(event as React.MouseEvent<HTMLElement>, {});
      expect(instance.state.isDragHappening).toBe(false);
    }
  });

  it('Should handle files/folders being dragged.', async () => {
    const wrapper = shallow(<VisualizationPageClass />);
    const instance = wrapper.instance() as VisualizationPageClass;
    expect(instance.state.filenames).toEqual({});
    const onDrop = wrapper.find(FolderUploadComponent).props().onDrop;
    if (!onDrop) {
      expect(onDrop).not.toBeUndefined();
    } else {
      const event = new Event('drop');
      const couplingFile = new File([], 'coupling_scores.csv');
      const pdbFile = new File([], 'mock.pdb');
      const residueMapFile = new File([], 'residue_mapping.csv');

      await onDrop([pdbFile, residueMapFile, couplingFile], [], event);
      expect(instance.state.filenames).toEqual({
        couplings: 'coupling_scores.csv',
        pdb: 'mock.pdb',
        residue_mapper: 'residue_mapping.csv',
      });
    }
  });

  it('Should handle mismatches.', async () => {
    const wrapper = shallow(<VisualizationPageClass />);
    const instance = wrapper.instance() as VisualizationPageClass;
    expect(instance.state.mismatches).toEqual([]);
    const onDrop = wrapper.find(FolderUploadComponent).props().onDrop;
    if (!onDrop) {
      expect(onDrop).not.toBeUndefined();
    } else {
      const couplingScoresCsv =
        '145,81,0.79312,7.5652,A,A,0.9,2.4,47,1.0,E,R\n\
      179,66,0.78681,3.5872,A,A,0.9,1.3,37,1.0,T,M';

      const event = new Event('drop');
      const couplingFile = new File([couplingScoresCsv], 'coupling_scores.csv');
      const pdbFile = new File([], 'mock.pdb');
      const residueMapFile = new File([], 'residue_mapping.csv');

      await onDrop([pdbFile, residueMapFile, couplingFile], [], event);
      expect(instance.state.mismatches).not.toEqual([]);
    }
  });
});
