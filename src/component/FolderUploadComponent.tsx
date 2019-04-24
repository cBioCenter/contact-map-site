import * as React from 'react';
// tslint:disable-next-line: import-name
import Dropzone, { DropEvent } from 'react-dropzone';
import { Icon, Label } from 'semantic-ui-react';

export interface IFolderUploadZoneComponent {
  style: React.CSSProperties;
  onDrop?(acceptedFiles: File[], rejectedFiles: File[], event: DropEvent): Promise<void>;
}

export class FolderUploadComponent extends React.Component<IFolderUploadZoneComponent, any> {
  public static defaultProps = {
    style: {
      border: '7px dashed lightblue',
      padding: '20px',
      textAlign: 'center' as const,
    },
  };

  constructor(props: IFolderUploadZoneComponent) {
    super(props);
  }

  public render() {
    const { onDrop, style } = this.props;

    return (
      <Dropzone onDrop={onDrop}>
        {({ getRootProps, getInputProps }) => {
          const { ref, ...rootProps } = getRootProps();

          return (
            <div
              ref={ref as React.RefObject<HTMLDivElement>}
              style={{ ...FolderUploadComponent.defaultProps.style, ...style }}
              {...rootProps}
            >
              <input {...getInputProps()} />
              <Label circular={true} size={'massive'}>
                <Icon name={'upload'} size={'large'} />
                Upload an EVCouplings folder or files!
              </Label>
            </div>
          );
        }}
      </Dropzone>
    );
  }
}
