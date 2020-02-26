import { AminoAcid, BioblocksPDB, CouplingContainer, IResidueMismatchResult } from 'bioblocks-viz';
import { shallow } from 'enzyme';
import * as NGL from 'ngl';
import * as React from 'react';

import { ErrorMessageComponent } from '~contact-map-site~/component';

describe('ErrorMessageComponent', () => {
  it('Should be empty when no props are provided.', () => {
    const wrapper = shallow(<ErrorMessageComponent />);
    expect(wrapper).toMatchSnapshot();
  });

  it('Should print a error message when given one.', () => {
    const wrapper = shallow(<ErrorMessageComponent errorMsg={'Tomorrow is Today'} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('Should be empty when pdb is available but no mismatches present.', async () => {
    const pdbData = BioblocksPDB.createPDBFromNGLData((await NGL.autoLoad('sample.pdb')) as NGL.Structure);
    const wrapper = shallow(<ErrorMessageComponent pdbData={pdbData} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('Should print error message when pdb is available but no mismatches present.', async () => {
    const pdbData = BioblocksPDB.createPDBFromNGLData((await NGL.autoLoad('sample.pdb')) as NGL.Structure);
    const wrapper = shallow(<ErrorMessageComponent errorMsg={"Where'd You Go"} pdbData={pdbData} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('Should print mismatches when they and PDB are present.', async () => {
    const pdbData = BioblocksPDB.createPDBFromNGLData((await NGL.autoLoad('sample.pdb')) as NGL.Structure);
    const couplingScores: CouplingContainer = new CouplingContainer([
      { A_i: 'A', A_j: 'D', i: 1, j: 2 },
      { A_i: 'C', A_j: 'F', i: 2, j: 1 },
    ]);
    const mismatches: IResidueMismatchResult[] = [
      {
        couplingAminoAcid: AminoAcid.Alanine,
        pdbAminoAcid: AminoAcid.GlutamicAcid,
        resno: 1,
      },
      {
        couplingAminoAcid: AminoAcid.Cysteine,
        pdbAminoAcid: AminoAcid.Proline,
        resno: 2,
      },
    ];
    const wrapper = shallow(
      <ErrorMessageComponent
        couplingScores={couplingScores}
        errorMsg={"Where'd You Go"}
        mismatches={mismatches}
        pdbData={pdbData}
      />,
    );
    expect(wrapper).toMatchSnapshot();
  });
});
