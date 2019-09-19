import { BioblocksPDB, CONTACT_DISTANCE_PROXIMITY, VIZ_TYPE } from 'bioblocks-viz';
import { mount, shallow } from 'enzyme';
import * as React from 'react';
import { Provider } from 'react-redux';
import { Button } from 'semantic-ui-react';

import { FolderUploadComponent } from '~contact-map-site~/component';
import { VisualizationPage, VisualizationPageClass } from '~contact-map-site~/page';
import { configureStore } from '~contact-map-site~/reducer';

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
    const store = configureStore();
    const wrapper = mount(
      <Provider store={store}>
        <VisualizationPage />
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

  /*
  it('Should update the state based on drag events.', () => {
    const wrapper = shallow(<VisualizationPageClass />);
    const instance = wrapper.instance() as VisualizationPageClass;
    expect(instance.state.isDragHappening).toBe(false);
    window.dispatchEvent(new Event('dragover'));
    expect(instance.state.isDragHappening).toBe(true);

    const onClose = wrapper.find(Modal).props().onClose as ((
      event: React.MouseEvent<HTMLElement>,
      data: ModalProps,
    ) => void);
    if (!onClose) {
      expect(onClose).not.toBeUndefined();
    } else {
      const event = { clientX: 100, clientY: 0 };
      onClose(event as React.MouseEvent<HTMLElement>, {});
      expect(instance.state.isDragHappening).toBe(false);
    }
  });
  */

  it.skip('Should handle files/folders being dragged.', async () => {
    const wrapper = shallow(<VisualizationPageClass />);
    const instance = wrapper.instance() as VisualizationPageClass;
    expect(instance.state.experimentalProteins).toEqual([]);
    expect(instance.state.predictedProteins).toEqual([]);
    const onDrop = wrapper.find(FolderUploadComponent).props().onDrop;
    if (!onDrop) {
      expect(onDrop).not.toBeUndefined();
    } else {
      const event = new Event('drop');
      const couplingFile = new File(['\n'], 'CouplingScores.csv');
      const pdbFile = new File([], 'mock.pdb');
      const residueMapFile = new File(['\n'], 'residue_mapping.csv');

      await onDrop([pdbFile, residueMapFile, couplingFile], [], event);
      expect(instance.state.experimentalProteins).toEqual([]);
      expect(instance.state.predictedProteins).toHaveLength(1);
    }
  });

  it('Should handle parsing the secondary structure from the distance_map_multimer file.', async () => {
    const wrapper = shallow(<VisualizationPageClass />);
    const instance = wrapper.instance() as VisualizationPageClass;
    const onDrop = wrapper.find(FolderUploadComponent).props().onDrop;
    if (!onDrop) {
      expect(onDrop).not.toBeUndefined();
    } else {
      const distanceMapCsv = ',id,sec_struct_3state\n\
        0,3,E\n\
        1,4,E\n\
        2,5,E\n';

      const event = new Event('drop');
      const secStructFile = new File([distanceMapCsv], 'distance_map_multimer.csv');

      await onDrop([secStructFile], [], event);
      expect(instance.state[VIZ_TYPE.CONTACT_MAP].secondaryStructures).toEqual([
        [{ label: 'E', sectionEnd: 5, sectionStart: 3 }],
      ]);
    }
  });

  it('Should call the right functions when clearing data.', () => {
    const store = configureStore();
    store.dispatch = jest.fn();

    const wrapper = mount(
      <Provider store={store}>
        <VisualizationPage />
      </Provider>,
    );

    wrapper
      .find(Button)
      .at(0)
      .simulate('click');

    expect((store.dispatch as jest.Mock).mock.calls).toEqual([
      [{ meta: undefined, payload: undefined, type: 'BIOBLOCKS/RESIDUEPAIR/LOCKED_CLEAR' }],
      [{ meta: undefined, payload: undefined, type: 'BIOBLOCKS/SECONDARYSTRUCTURE/SELECTED_CLEAR' }],
    ]);
  });
});
