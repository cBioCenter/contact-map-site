import {
  BioblocksPDB,
  CONTACT_DISTANCE_PROXIMITY,
  CONTACT_MAP_DATA_TYPE,
  ContactMap,
  CouplingContainer,
  createContainerActions,
  createResiduePairActions,
  EMPTY_FUNCTION,
  generateResidueMapping,
  getCouplingScoresData,
  getPDBAndCouplingMismatch,
  IResidueMapping,
  IResidueMismatchResult,
  NGLContainer,
  PredictedContactMap,
  readFileAsText,
  VIZ_TYPE,
} from 'bioblocks-viz';
import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import { Button, Grid, GridColumn, GridRow, Label, Message, Segment } from 'semantic-ui-react';

import { ErrorMessageComponent, FolderUploadComponent } from '~contact-map-site~/component';

export interface ILandingPageProps {
  style: Exclude<React.CSSProperties, 'height' | 'width'>;
  clearAllResidues(): void;
  clearAllSecondaryStructures(): void;
}

export interface ILandingPageState {
  [VIZ_TYPE.CONTACT_MAP]: CONTACT_MAP_DATA_TYPE;
  arePredictionsAvailable: boolean;
  errorMsg: string;
  filenames: Partial<{
    couplings: string;
    pdb: string;
    residue_mapper: string;
  }>;
  isLoading: boolean;
  measuredProximity: CONTACT_DISTANCE_PROXIMITY;
  mismatches: IResidueMismatchResult[];
  pdbData?: BioblocksPDB;
  residueMapping: IResidueMapping[];
}

export class LandingPageClass extends React.Component<ILandingPageProps, ILandingPageState> {
  public static defaultProps = {
    clearAllResidues: EMPTY_FUNCTION,
    clearAllSecondaryStructures: EMPTY_FUNCTION,
    style: {
      backgroundColor: '#ffffff',
    },
  };

  protected static initialState: ILandingPageState = {
    [VIZ_TYPE.CONTACT_MAP]: {
      couplingScores: new CouplingContainer(),
      pdbData: undefined,
      secondaryStructures: [],
    },
    arePredictionsAvailable: false,
    errorMsg: '',
    filenames: {},
    isLoading: false,
    measuredProximity: CONTACT_DISTANCE_PROXIMITY.CLOSEST,
    mismatches: [],
    pdbData: undefined,
    residueMapping: [],
  };

  public constructor(props: ILandingPageProps) {
    super(props);
    this.state = LandingPageClass.initialState;
  }

  public componentDidUpdate(prevProps: ILandingPageProps, prevState: ILandingPageState) {
    const { measuredProximity, pdbData } = this.state;
    const { couplingScores } = this.state[VIZ_TYPE.CONTACT_MAP];

    let errorMsg = '';

    let newMismatches = this.state.mismatches;

    if (
      pdbData &&
      (couplingScores !== prevState[VIZ_TYPE.CONTACT_MAP].couplingScores || pdbData !== prevState.pdbData)
    ) {
      newMismatches = getPDBAndCouplingMismatch(pdbData, couplingScores);

      if (newMismatches.length >= 1) {
        errorMsg = `Error details: ${newMismatches.length} mismatch(es) detected between coupling scores and PDB!\
        For example, residue number ${newMismatches[0].resno} is '${
          newMismatches[0].pdbAminoAcid.threeLetterCode
        }' in the PDB but '${newMismatches[0].couplingAminoAcid.threeLetterCode}' in the coupling scores file.`;
      }
    }

    if (pdbData && measuredProximity !== prevState.measuredProximity) {
      this.setState({
        [VIZ_TYPE.CONTACT_MAP]: {
          couplingScores: pdbData.amendPDBWithCouplingScores(couplingScores.rankedContacts, measuredProximity),
          pdbData: { known: this.state.pdbData },
          secondaryStructures: [],
        },
        errorMsg,
        mismatches: newMismatches,
      });
    } else if (errorMsg.length >= 1) {
      this.setState({
        errorMsg,
        mismatches: newMismatches,
      });
    }
  }

  public render({ style } = this.props, { errorMsg, mismatches, pdbData } = this.state) {
    return (
      <div id="BioblocksVizApp" style={{ ...style, height: '1000px' }}>
        <ErrorMessageComponent
          couplingScores={this.state[VIZ_TYPE.CONTACT_MAP].couplingScores}
          errorMsg={errorMsg}
          pdbData={pdbData}
          mismatches={mismatches}
        />
        {!pdbData && this.renderStartMessage()}
        <Segment attached={true} raised={true}>
          {this.renderCouplingComponents()}
        </Segment>
        {this.renderFooter()}
      </div>
    );
  }

  protected renderCouplingComponents = (
    { style } = this.props,
    { arePredictionsAvailable, measuredProximity, pdbData } = this.state,
  ) => (
    <Grid centered={true} padded={true} relaxed={true}>
      {this.renderUploadButtonsRow()}
      <Grid.Row>
        <br />
      </Grid.Row>
      <GridRow columns={2}>
        <GridColumn width={7}>{this.renderContactMapCard(arePredictionsAvailable, '500px', style, pdbData)}</GridColumn>
        <GridColumn width={7}>{this.renderNGLCard(measuredProximity, pdbData)}</GridColumn>
      </GridRow>
    </Grid>
  );

  protected renderFooter = () => {
    return (
      <footer style={{ padding: '25vh 0 25px 25px' }}>
        <>
          Powered by <a href="https://github.com/cBioCenter/bioblocks-viz">Bioblocks</a>!
        </>
      </footer>
    );
  };

  protected renderStartMessage = () => (
    <Message>
      {`To get started, please upload either a PDB (.pdb) or EVCouplings score (.csv) file!`} {<br />} Check out the
      {/* tslint:disable-next-line:no-http-string */}
      {<a href="http://evfold.org"> EVFold</a>}, {<a href="http://sanderlab.org/contact-maps/">Sander Lab</a>}, or
      {<a href="https://evcouplings.org/"> EVCouplings </a>} website to get these files.
    </Message>
  );

  protected renderUploadForm = (
    onChange: (e: React.ChangeEvent) => void,
    id: string,
    content: string,
    disabled?: boolean,
    accepts: string[] = [],
  ) => {
    return (
      <GridColumn>
        <Label as="label" basic={true} htmlFor={id}>
          <Button
            disabled={disabled}
            icon={'upload'}
            label={{
              basic: true,
              content,
            }}
            labelPosition={'right'}
          />
          <input
            accept={`.${accepts.join(',.')}`}
            disabled={disabled}
            id={id}
            onChange={onChange}
            hidden={true}
            type={'file'}
            required={true}
            multiple={false}
          />
        </Label>
      </GridColumn>
    );
  };

  protected renderContactMapCard = (
    arePredictionsAvailable: boolean,
    size: number | string,
    style: React.CSSProperties,
    pdbData?: BioblocksPDB,
  ) =>
    arePredictionsAvailable ? (
      <PredictedContactMap
        data={{
          couplingScores: this.state[VIZ_TYPE.CONTACT_MAP].couplingScores,
          pdbData: { known: pdbData },
          secondaryStructures: this.state[VIZ_TYPE.CONTACT_MAP].secondaryStructures,
        }}
        height={size}
        isDataLoading={this.state.isLoading}
        style={style}
        width={size}
      />
    ) : (
      <ContactMap
        data={{
          couplingScores: this.state[VIZ_TYPE.CONTACT_MAP].couplingScores,
          pdbData: { known: pdbData },
          secondaryStructures: this.state[VIZ_TYPE.CONTACT_MAP].secondaryStructures,
        }}
        height={size}
        isDataLoading={this.state.isLoading}
        style={style}
        width={size}
      />
    );

  protected renderNGLCard = (measuredProximity: CONTACT_DISTANCE_PROXIMITY, pdbData?: BioblocksPDB) => (
    <NGLContainer
      data={pdbData}
      isDataLoading={this.state.isLoading}
      measuredProximity={measuredProximity}
      onMeasuredProximityChange={this.onMeasuredProximityChange()}
    />
  );

  protected renderUploadButtonsRow = () => (
    <GridRow columns={4} textAlign={'center'} verticalAlign={'bottom'}>
      <GridColumn style={{ height: '100%' }}>
        <GridRow style={{ height: '100%' }}>
          <FolderUploadComponent onDrop={this.onFolderUpload} style={{ height: '100%' }} />
        </GridRow>
      </GridColumn>
      <GridColumn>{this.renderClearAllButton()}</GridColumn>
    </GridRow>
  );

  protected renderClearAllButton = () => (
    <GridRow verticalAlign={'middle'} columns={1} centered={true}>
      <GridColumn>
        <Label as="label" basic={true} htmlFor={'clear-data'}>
          <Button
            icon={'trash'}
            label={{
              basic: true,
              content: 'Clean View',
            }}
            labelPosition={'right'}
            onClick={this.onClearAll()}
          />
        </Label>
      </GridColumn>
    </GridRow>
  );

  protected onClearAll = () => async () => {
    const { clearAllResidues, clearAllSecondaryStructures } = this.props;
    this.setState(LandingPageClass.initialState);
    clearAllResidues();
    clearAllSecondaryStructures();
    this.forceUpdate();
  };

  protected onFolderUpload = async (files: File[]) => {
    await this.onClearAll()();
    const { measuredProximity } = this.state;
    this.setState({
      isLoading: true,
    });

    const filenames = {
      couplings: '',
      pdb: '',
      residue_mapper: '',
    };
    let couplingScoresCSV: string = '';
    let pdbData: BioblocksPDB = BioblocksPDB.createEmptyPDB();
    let residueMapping: IResidueMapping[] = [];

    for (const file of files) {
      if (file.name.endsWith('.pdb')) {
        pdbData = await BioblocksPDB.createPDB(file);
        filenames.pdb = file.name;
      } else {
        const parsedFile = await readFileAsText(file);
        if (
          file.name.endsWith('indextable') ||
          file.name.endsWith('indextableplus') ||
          file.name.startsWith('residue_mapping')
        ) {
          residueMapping = generateResidueMapping(parsedFile);
          filenames.residue_mapper = file.name;
        } else if (file.name.endsWith('.csv')) {
          couplingScoresCSV = parsedFile;
          filenames.couplings = file.name;
        }
      }
    }

    let couplingScores = getCouplingScoresData(couplingScoresCSV, residueMapping);
    couplingScores = pdbData.amendPDBWithCouplingScores(couplingScores.rankedContacts, measuredProximity);
    const mismatches = pdbData.getResidueNumberingMismatches(couplingScores);

    this.setState({
      [VIZ_TYPE.CONTACT_MAP]: {
        couplingScores,
        pdbData: { known: pdbData },
        secondaryStructures: pdbData.secondaryStructureSections,
      },
      arePredictionsAvailable: true,
      errorMsg: '',
      filenames,
      isLoading: false,
      mismatches,
      pdbData,
    });
  };

  protected onMeasuredProximityChange = () => (value: number) => {
    this.setState({
      measuredProximity: Object.values(CONTACT_DISTANCE_PROXIMITY)[value] as CONTACT_DISTANCE_PROXIMITY,
    });
  };
}

const mapDispatchToProps = (dispatch: Dispatch) =>
  bindActionCreators(
    {
      clearAllResidues: () => ({
        ...createResiduePairActions().candidates.clear(),
        ...createResiduePairActions().hovered.clear(),
        ...createResiduePairActions().locked.clear(),
      }),
      clearAllSecondaryStructures: () => ({
        ...createContainerActions('secondaryStructure/hovered').clear(),
        ...createContainerActions('secondaryStructure/selected').clear(),
      }),
    },
    dispatch,
  );

export const LandingPage = connect(
  null,
  mapDispatchToProps,
)(LandingPageClass);
