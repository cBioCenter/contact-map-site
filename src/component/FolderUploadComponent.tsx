import * as React from 'react';
// tslint:disable-next-line: import-name
import Dropzone, { DropEvent } from 'react-dropzone';
import { Container, Label } from 'semantic-ui-react';

export interface IFolderUploadZoneComponent {
  style: React.CSSProperties;
  onDrop?(acceptedFiles: File[], rejectedFiles: File[], event: DropEvent): void;
}

export class FolderUploadComponent extends React.Component<IFolderUploadZoneComponent, any> {
  public static defaultProps = {
    style: {
      border: '3px dashed black',
    },
  };

  constructor(props: IFolderUploadZoneComponent) {
    super(props);
  }

  public render() {
    const { onDrop, style } = this.props;

    return (
      <Dropzone onDrop={onDrop}>
        {({ getRootProps, getInputProps }) => (
          <Container style={{ ...FolderUploadComponent.defaultProps.style, ...style }} {...getRootProps()}>
            <input {...getInputProps()} />
            <Label>Drag your files or folder here!</Label>
          </Container>
        )}
      </Dropzone>
    );
  }
}
