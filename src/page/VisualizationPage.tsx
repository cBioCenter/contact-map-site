// ~contact-map-site~
// Visualization Page
// The page where the Contact Map visualizations are displayed and new data can be uploaded.
// ~contact-map-site~

import {
  Bioblocks1DSection,
  BioblocksPDB,
  connectWithBBStore,
  CONTACT_DISTANCE_PROXIMITY,
  CONTACT_MAP_DATA_TYPE,
  ContactMapContainer,
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
  readFileAsText,
  SECONDARY_STRUCTURE_CODES,
  SECONDARY_STRUCTURE_SECTION,
  VIZ_TYPE,
} from 'bioblocks-viz';
import * as React from 'react';
import { bindActionCreators, Dispatch } from 'redux';
import { Button, Grid, GridColumn, GridRow, Message, Modal, Popup, Segment } from 'semantic-ui-react';

import { DropEvent } from 'react-dropzone';
import { ErrorMessageComponent, FolderUploadComponent, IDropzoneFile } from '~contact-map-site~/component';

export interface IVisualizationPageProps {
  style: Exclude<React.CSSProperties, 'height' | 'width'>;
  clearAllResidues(): void;
  clearAllSecondaryStructures(): void;
}

export interface IVisualizationPageState {
  [VIZ_TYPE.CONTACT_MAP]: CONTACT_MAP_DATA_TYPE;
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
    const { predictedProteins } = this.state;
    const { couplingScores } = this.state[VIZ_TYPE.CONTACT_MAP];

    const pdbData = predictedProteins.length >= 1 ? predictedProteins[0] : undefined;

    let errorMsg = '';

    let newMismatches = this.state.mismatches;

    if (
      pdbData &&
      (prevState.predictedProteins.length === 0 || prevState.predictedProteins[0] !== pdbData) &&
      (couplingScores !== prevState[VIZ_TYPE.CONTACT_MAP].couplingScores ||
        pdbData !== prevState[VIZ_TYPE.CONTACT_MAP].pdbData)
    ) {
      newMismatches = getPDBAndCouplingMismatch(pdbData, couplingScores);
      if (newMismatches.length >= 1) {
        // tslint:disable: max-line-length
        errorMsg = `Error details: ${newMismatches.length} mismatch(es) detected between coupling scores and PDB!\
        For example, residue number ${newMismatches[0].resno} is '${newMismatches[0].pdbAminoAcid.threeLetterCode}' in the PDB but '${newMismatches[0].couplingAminoAcid.threeLetterCode}' in the coupling scores file.`;
        // tslint:enable: max-line-length
      }
    }

    if (errorMsg.length >= 1) {
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

  protected renderCouplingComponents = ({ style } = this.props, { measuredProximity } = this.state) => (
    <Segment attached={true} raised={true}>
      <Grid centered={true} padded={true} relaxed={true}>
        {this.renderButtonsRow()}
        <Grid.Row>
          <br />
        </Grid.Row>
        <GridRow columns={2} verticalAlign={'bottom'}>
          <GridColumn width={7}>{this.renderContactMapCard(style)}</GridColumn>
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

  protected renderContactMapCard = (style: React.CSSProperties) => {
    const { isLoading, 'Contact Map': contactMapState } = this.state;

    return (
      <ContactMapContainer
        data={{
          couplingScores: contactMapState.couplingScores,
          pdbData: { experimental: contactMapState.pdbData ? contactMapState.pdbData.experimental : undefined },
          secondaryStructures: contactMapState.secondaryStructures,
        }}
        isDataLoading={isLoading}
        style={style}
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

  // tslint:disable-next-line: max-func-body-length
  protected onFolderUpload = async (files: IDropzoneFile[], rejectedFiles: IDropzoneFile[], event: DropEvent) => {
    this.onCloseUpload();
    // await this.onClearAll()();

    this.setState({
      experimentalProteins: [],
      isDragHappening: false,
      isLoading: true,
      predictedProteins: [],
    });

    let folderName: string = '';
    let couplingScores = this.state[VIZ_TYPE.CONTACT_MAP].couplingScores;
    let couplingScoresCSV: string = '';
    let mismatches = this.state.mismatches;
    let pdbData: BioblocksPDB | undefined;
    let residueMapping: IResidueMapping[] = [];
    let secondaryStructures: SECONDARY_STRUCTURE_SECTION[] = [];
    let couplingFlag: boolean = couplingScores.totalContacts >= 1 ? couplingScores.isDerivedFromCouplingScores : false;

    const experimentalProteins = new Array<BioblocksPDB>();
    const predictedProteins = new Array<BioblocksPDB>();
    const couplingScoreFiles: Record<string, string> = {};

    for (const file of files) {
      if (file.name.endsWith('.pdb')) {
        pdbData = await BioblocksPDB.createPDB(file);
        if (file.path && file.path.includes('/fold/')) {
          predictedProteins.push(pdbData);
        } else if (file.path && file.path.includes('/compare/') && file.path.includes('/aux/')) {
          experimentalProteins.push(pdbData);
        }
        if (folderName.length === 0 && file.path) {
          const splitParts = file.path.split('/');
          folderName = splitParts.length >= 2 ? splitParts[1] : splitParts[0];
        }
      } else {
        const parsedFile = await readFileAsText(file);
        if (
          file.name.endsWith('indextable') ||
          file.name.endsWith('indextableplus') ||
          file.name.startsWith('residue_mapping')
        ) {
          residueMapping = generateResidueMapping(parsedFile);
        } else if (file.name.endsWith('.csv') && file.name.includes('CouplingScores')) {
          couplingScoreFiles[file.name] = parsedFile;
          couplingFlag = true;
        } else if (file.name.endsWith('distance_map_multimer.csv')) {
          secondaryStructures = this.getSecondaryStructuresFromFile(parsedFile);
        }
        if (folderName.length === 0 && file.path) {
          const splitParts = file.path.split('/');
          folderName = splitParts.length >= 2 ? splitParts[1] : splitParts[0];
        }
      }
    }

    if (pdbData && experimentalProteins.length === 0 && predictedProteins.length === 0) {
      experimentalProteins.push(pdbData);
    } else if (experimentalProteins.length === 0) {
      pdbData = predictedProteins[0];
    } else {
      pdbData = experimentalProteins[0];
    }

    couplingScoresCSV = this.getCouplingsScoreFile(couplingScoreFiles);
    couplingScores =
      couplingScoresCSV.length >= 1 ? getCouplingScoresData(couplingScoresCSV, residueMapping) : couplingScores;
    if (pdbData) {
      if (couplingScores.rankedContacts.length === 0 || couplingScores.rankedContacts[0].dist === undefined) {
        couplingScores = pdbData.amendPDBWithCouplingScores(
          couplingScores.rankedContacts,
          CONTACT_DISTANCE_PROXIMITY.CLOSEST,
        );
      } else {
        mismatches = pdbData.getResidueNumberingMismatches(couplingScores);
        console.log(mismatches);
      }
    }
    couplingScores.isDerivedFromCouplingScores = couplingFlag;

    if (event.target) {
      (event.target as HTMLInputElement).value = '';
    }

    this.setState({
      [VIZ_TYPE.CONTACT_MAP]: {
        couplingScores,
        pdbData: { experimental: experimentalProteins[0], predicted: predictedProteins[0] },
        secondaryStructures:
          secondaryStructures.length >= 1 ? [secondaryStructures] : pdbData ? pdbData.secondaryStructureSections : [],
      },
      errorMsg: `Showing data from '${folderName}'`,
      experimentalProteins,
      isLoading: false,
      mismatches,
      predictedProteins,
    });
  };

  protected getCouplingsScoreFile = (files: Record<string, string>) => {
    const filenames = Object.keys(files);

    const rankedFilenames = [
      'CouplingScoresCompared_all',
      'CouplingScores',
      'CouplingScoresCompared_longrange',
      'CouplingScores_longrange',
      'CouplingScores_with_clashes',
    ];

    for (const name of rankedFilenames) {
      for (const filename of filenames) {
        if (filename.endsWith(`${name}.csv`)) {
          return files[filename];
        }
      }
    }

    return filenames.length >= 1 ? files[filenames[0]] : '';
  };

  protected getSecondaryStructuresFromFile = (parsedFile: string) => {
    const secondaryStructures = new Array<SECONDARY_STRUCTURE_SECTION>();
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

    return secondaryStructures;
  };

  protected onMeasuredProximityChange = () => (value: number) => {
    this.setState({
      measuredProximity: Object.values(CONTACT_DISTANCE_PROXIMITY)[value],
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

export const VisualizationPage = connectWithBBStore(EMPTY_FUNCTION, mapDispatchToProps, VisualizationPageClass);
