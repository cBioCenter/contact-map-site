import {
  Bioblocks1DSection,
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
  SECONDARY_STRUCTURE_CODES,
  SECONDARY_STRUCTURE_SECTION,
  VIZ_TYPE,
} from 'bioblocks-viz';
import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import { Button, Grid, GridColumn, GridRow, Message, Modal, Popup, Segment } from 'semantic-ui-react';

import { ErrorMessageComponent, FolderUploadComponent, IDropzoneFile } from '~contact-map-site~/component';

export interface IVisualizationPageProps {
  style: Exclude<React.CSSProperties, 'height' | 'width'>;
  clearAllResidues(): void;
  clearAllSecondaryStructures(): void;
}

export interface IVisualizationPageState {
  [VIZ_TYPE.CONTACT_MAP]: CONTACT_MAP_DATA_TYPE;
  arePredictionsAvailable: boolean;
  errorMsg: string;
  experimentalProteins: BioblocksPDB[];
  isDragHappening: boolean;
  isLoading: boolean;
  measuredProximity: CONTACT_DISTANCE_PROXIMITY;
  mismatches: IResidueMismatchResult[];
  predictedProteins: BioblocksPDB[];
  residueMapping: IResidueMapping[];
}

export class VisualizationPageClass extends React.Component<IVisualizationPageProps, IVisualizationPageState> {
  public static defaultProps = {
    clearAllResidues: EMPTY_FUNCTION,
    clearAllSecondaryStructures: EMPTY_FUNCTION,
    style: {
      backgroundColor: '#ffffff',
    },
  };

  protected static initialState: IVisualizationPageState = {
    [VIZ_TYPE.CONTACT_MAP]: {
      couplingScores: new CouplingContainer(),
      pdbData: undefined,
      secondaryStructures: [],
    },
    arePredictionsAvailable: false,
    errorMsg: '',
    experimentalProteins: [],
    isDragHappening: false,
    isLoading: false,
    measuredProximity: CONTACT_DISTANCE_PROXIMITY.CLOSEST,
    mismatches: [],
    predictedProteins: [],
    residueMapping: [],
  };

  public constructor(props: IVisualizationPageProps) {
    super(props);
    this.state = VisualizationPageClass.initialState;
  }

  public componentDidMount() {
    window.addEventListener('dragover', this.onDragOver);
  }

  public componentDidUpdate(prevProps: IVisualizationPageProps, prevState: IVisualizationPageState) {
    const { measuredProximity, predictedProteins } = this.state;
    const { couplingScores } = this.state[VIZ_TYPE.CONTACT_MAP];

    const pdbData = predictedProteins.length >= 1 ? predictedProteins[0] : undefined;

    let errorMsg = '';

    let newMismatches = this.state.mismatches;

    if (
      pdbData &&
      (prevState.predictedProteins.length === 0 || prevState.predictedProteins[0] !== pdbData) &&
      couplingScores !== prevState[VIZ_TYPE.CONTACT_MAP].couplingScores
    ) {
      console.log(1);
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
          pdbData: { known: pdbData },
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

  public render(
    { style } = this.props,
    { errorMsg, experimentalProteins, isDragHappening, mismatches, predictedProteins } = this.state,
  ) {
    return (
      <div id="BioblocksVizApp" style={{ ...style, height: '1000px' }}>
        <Modal
          closeOnDimmerClick={true}
          closeOnEscape={true}
          closeOnPortalMouseLeave={true}
          onClose={this.onCloseUpload}
          open={isDragHappening}
          size={'fullscreen'}
        >
          <FolderUploadComponent onDrop={this.onFolderUpload} />
        </Modal>
        <ErrorMessageComponent
          couplingScores={this.state[VIZ_TYPE.CONTACT_MAP].couplingScores}
          errorMsg={errorMsg}
          mismatches={mismatches}
        />
        {experimentalProteins.length === 0 && predictedProteins.length === 0 && this.renderStartMessage()}
        {this.renderCouplingComponents()}
        {this.renderFooter()}
      </div>
    );
  }

  protected onDragOver = (event: Event) => {
    event.stopPropagation();
    window.removeEventListener('dragover', this.onDragOver);
    this.setState({ isDragHappening: true });
  };

  protected onCloseUpload = () => {
    window.addEventListener('dragover', this.onDragOver);
    this.setState({ isDragHappening: false });
  };

  protected renderCouplingComponents = (
    { style } = this.props,
    { arePredictionsAvailable, measuredProximity } = this.state,
  ) => (
    <Segment attached={true} raised={true}>
      <Grid centered={true} padded={true} relaxed={true}>
        {this.renderButtonsRow()}
        <Grid.Row>
          <br />
        </Grid.Row>
        <GridRow columns={2} verticalAlign={'bottom'}>
          <GridColumn width={7}>{this.renderContactMapCard(arePredictionsAvailable, '500px', style)}</GridColumn>
          <GridColumn width={7}>{this.renderNGLCard(measuredProximity)}</GridColumn>
        </GridRow>
      </Grid>
    </Segment>
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
      {'To get started, please drag and drop onto the page either:'}
      {<br />}
      {'(1) An evcouplings results directory.'}
      {<br />}
      {'(2) Individual .pdb, coupling scores'}
      <Popup trigger={<a>(?)</a>} content={"A file that ends as 'CouplingScores.csv'"} />
      {', and residue mapping files'}
      <Popup
        trigger={<a>(?)</a>}
        content={
          "A .csv file that starts with 'residue_mapping' - or - A file that ends in .indextable / .indextableplus"
        }
      />
      {'.'}
      {<br />}
      {<br />} Check out the
      {/* tslint:disable-next-line:no-http-string */}
      {<a href="http://evfold.org"> EVFold</a>} or
      {<a href="https://evcouplings.org/"> EVCouplings </a>} website to get these files.
    </Message>
  );

  protected renderContactMapCard = (
    arePredictionsAvailable: boolean,
    size: number | string,
    style: React.CSSProperties,
    pdbData?: BioblocksPDB,
  ) => {
    return arePredictionsAvailable ? (
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
  };

  protected renderNGLCard = (measuredProximity: CONTACT_DISTANCE_PROXIMITY) => {
    return (
      <NGLContainer
        experimentalProteins={this.state.experimentalProteins}
        isDataLoading={this.state.isLoading}
        measuredProximity={measuredProximity}
        onMeasuredProximityChange={this.onMeasuredProximityChange()}
        predictedProteins={this.state.predictedProteins}
      />
    );
  };

  protected renderButtonsRow = () => {
    return (
      <GridRow textAlign={'right'} verticalAlign={'bottom'}>
        <GridColumn style={{ height: '100%', width: 'auto' }}>{this.renderClearAllButton()}</GridColumn>
      </GridRow>
    );
  };

  protected renderClearAllButton = () => (
    <Button
      icon={'trash'}
      label={{
        content: 'Clean View',
      }}
      labelPosition={'right'}
      onClick={this.onClearAll()}
      style={{ height: '100%' }}
    />
  );

  protected onClearAll = () => async () => {
    const { clearAllResidues, clearAllSecondaryStructures } = this.props;
    this.setState(VisualizationPageClass.initialState);
    clearAllResidues();
    clearAllSecondaryStructures();
    this.forceUpdate();
  };

  protected onFolderUpload = async (files: IDropzoneFile[]) => {
    this.onCloseUpload();
    await this.onClearAll()();
    const { measuredProximity } = this.state;

    this.setState({
      isDragHappening: false,
      isLoading: true,
    });

    let couplingScoresCSV: string = '';
    let pdbData = BioblocksPDB.createEmptyPDB();
    let residueMapping: IResidueMapping[] = [];
    let secondaryStructures: SECONDARY_STRUCTURE_SECTION[] = [];

    const experimentalProteins = new Array<BioblocksPDB>();
    const predictedProteins = new Array<BioblocksPDB>();

    for (const file of files) {
      if (file.name.endsWith('.pdb')) {
        pdbData = await BioblocksPDB.createPDB(file);
        if (file.path && file.path.includes('/fold/')) {
          predictedProteins.push(pdbData);
        } else if (file.path && file.path.includes('/aux/')) {
          experimentalProteins.push(pdbData);
        }
      } else {
        const parsedFile = await readFileAsText(file);
        if (
          file.name.endsWith('indextable') ||
          file.name.endsWith('indextableplus') ||
          file.name.startsWith('residue_mapping')
        ) {
          residueMapping = generateResidueMapping(parsedFile);
        } else if (file.name.endsWith('CouplingScores.csv')) {
          couplingScoresCSV = parsedFile;
        } else if (file.name.endsWith('distance_map_multimer.csv')) {
          secondaryStructures = new Array<SECONDARY_STRUCTURE_SECTION>();
          parsedFile
            .split('\n')
            .slice(1)
            .filter(row => row.split(',').length >= 3)
            .forEach(row => {
              const items = row.split(',');
              const resno = parseFloat(items[1]);
              const structId = items[2] as keyof typeof SECONDARY_STRUCTURE_CODES;
              if (
                secondaryStructures[secondaryStructures.length - 1] &&
                secondaryStructures[secondaryStructures.length - 1].label === structId
              ) {
                secondaryStructures[secondaryStructures.length - 1].updateEnd(resno);
              } else {
                secondaryStructures.push(new Bioblocks1DSection(structId, resno));
              }
            });
        }
      }
    }

    if (predictedProteins.length === 0) {
      predictedProteins.push(pdbData);
    } else {
      pdbData = predictedProteins[0];
    }

    let couplingScores = getCouplingScoresData(couplingScoresCSV, residueMapping);
    couplingScores = pdbData.amendPDBWithCouplingScores(couplingScores.rankedContacts, measuredProximity);
    const mismatches = pdbData.getResidueNumberingMismatches(couplingScores);

    this.setState({
      [VIZ_TYPE.CONTACT_MAP]: {
        couplingScores,
        pdbData: { known: pdbData },
        secondaryStructures:
          secondaryStructures.length >= 1 ? [secondaryStructures] : pdbData.secondaryStructureSections,
      },
      arePredictionsAvailable: true,
      errorMsg: '',
      experimentalProteins,
      isLoading: false,
      mismatches,
      predictedProteins,
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

export const VisualizationPage = connect(
  null,
  mapDispatchToProps,
)(VisualizationPageClass);
