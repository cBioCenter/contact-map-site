import * as React from 'react';
// tslint:disable-next-line: import-name
import Dropzone, { DropEvent } from 'react-dropzone';

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
          <section>
            <div style={style} {...getRootProps()}>
              <input {...getInputProps()} />
              <p>Drag 'n' drop some files here, or click to select files</p>
            </div>
          </section>
        )}
      </Dropzone>
    );
  }
}
