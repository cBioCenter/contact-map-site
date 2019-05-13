import * as React from 'react';
// tslint:disable-next-line: import-name
import Dropzone, { DropEvent } from 'react-dropzone';
import { Icon, Label } from 'semantic-ui-react';

export interface IDropzoneFile extends File {
  path?: string;
}

export interface IFolderUploadZoneComponent {
  style: React.CSSProperties;
  onDrop?(acceptedFiles: IDropzoneFile[], rejectedFiles: IDropzoneFile[], event: DropEvent): Promise<void>;
}

export class FolderUploadComponent extends React.Component<IFolderUploadZoneComponent, any> {
  public static defaultProps = {
    style: {
      backgroundColor: 'lightblue',
      border: '7px dashed blue',
      height: '90vmin',
      textAlign: 'center' as const,
    },
  };

  constructor(props: IFolderUploadZoneComponent) {
    super(props);
  }

  public render() {
    const { onDrop, style } = this.props;

    const combinedStyle = { ...FolderUploadComponent.defaultProps.style, ...style };

    return (
      <Dropzone onDrop={onDrop}>
        {({ getRootProps, getInputProps }) => {
          const { ref, ...rootProps } = getRootProps();

          return (
            <div ref={ref as React.RefObject<HTMLDivElement>} style={combinedStyle} {...rootProps}>
              <input {...getInputProps()} />
              <Label size={'massive'}>
                <Icon name={'upload'} size={'large'} />
                Drop 'em here!
              </Label>
            </div>
          );
        }}
      </Dropzone>
    );
  }
}
