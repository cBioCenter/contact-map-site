// ~contact-map-site~
// Error Message Component
// Renders an error message with details, if available.
// ~contact-map-site~

import { BioblocksPDB, CouplingContainer, IResidueMismatchResult } from 'bioblocks-viz';
import * as React from 'react';
import { Accordion, Message } from 'semantic-ui-react';

export interface IErrorMessageComponentProps {
  couplingScores: CouplingContainer;
  errorMsg: string;
  mismatches: IResidueMismatchResult[];
  pdbData?: BioblocksPDB;
}

export class ErrorMessageComponent extends React.Component<IErrorMessageComponentProps> {
  public static defaultProps = {
    couplingScores: new CouplingContainer(),
    errorMsg: '',
    mismatches: [],
  };

  constructor(props: IErrorMessageComponentProps) {
    super(props);
  }

  public render() {
    const { couplingScores, errorMsg, mismatches, pdbData } = this.props;

    return mismatches.length >= 1 || errorMsg.length >= 1 ? (
      <Message warning={true}>
        {mismatches.length >= 1 && pdbData ? (
          <div>
            <Message.Header>
              {`Residue numbering mismatch detected. Please upload a file to correct the position numbering differences.`}
              {<br />}
              {`EVCouplings and EVFold outputs this file in the `}
              <strong>OUTPUT</strong>
              {` directory.
                This file might be named similar to
                '${pdbData.name}.csv' or '${pdbData.name}.indextableplus'`}
            </Message.Header>
            <Message.List>{errorMsg}</Message.List>
            <Message.Content>
              <Accordion
                fluid={true}
                exclusive={false}
                defaultActiveIndex={[]}
                panels={[
                  this.renderSequenceAccordionMessage('PDB sequence', pdbData.sequence, mismatches, 'pdb'),
                  this.renderSequenceAccordionMessage(
                    'Couplings Score sequence',
                    couplingScores.sequence,
                    mismatches,
                    'coupling',
                  ),
                ]}
              />
            </Message.Content>
          </div>
        ) : (
          errorMsg
        )}
      </Message>
    ) : null;
  }

  protected renderSequenceAccordionMessage = (
    title: string,
    sequence: string,
    mismatches: IResidueMismatchResult[],
    pdbOrCoupling: 'pdb' | 'coupling',
  ) => {
    let startIndex = 0;
    let prevResno = mismatches[0].resno;
    const result = new Array<JSX.Element>();

    for (const mismatch of mismatches) {
      const aminoAcid = pdbOrCoupling === 'pdb' ? mismatch.pdbAminoAcid : mismatch.couplingAminoAcid;
      const resIndex = sequence.indexOf(aminoAcid.singleLetterCode, startIndex + (mismatch.resno - prevResno));

      if (resIndex >= 0) {
        result.push(
          <React.Fragment key={`mismatch-${mismatch.resno}`}>
            <span style={{ color: 'black', fontSize: '12px' }}>{sequence.substring(startIndex, resIndex)}</span>
            <span style={{ color: 'red', fontSize: '16px', textDecoration: 'underline' }}>
              {sequence.charAt(resIndex)}
            </span>
          </React.Fragment>,
        );

        prevResno = mismatch.resno + 1;
        startIndex = resIndex + 1;
      }
    }

    result.push(
      <span key={'mismatch-final'} style={{ color: 'black', fontSize: '12px' }}>
        {sequence.substring(startIndex)}
      </span>,
    );

    return {
      content: {
        content: <p style={{ width: '80%', wordBreak: 'break-word' }}>{result}</p>,
      },
      key: `panel-${title}`,
      title: {
        content: `${title} (${sequence.length} Amino Acids)`,
      },
    };
  };
}
