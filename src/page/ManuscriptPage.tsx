import * as React from 'react';

import { VisualizationPage } from '~contact-map-site~/page';

export class ManuscriptPage extends React.Component {
  public render() {
    return <div>Here there be manuscripts</div>;
  }

  protected renderVisualizationPage = () => {
    return <VisualizationPage />;
  };

  protected renderManuscriptPage = () => {
    return <VisualizationPage />;
  };
}
