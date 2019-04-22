import * as React from 'react';

import { LandingPage } from '~contact-map-site~/page';

export class ManuscriptPage extends React.Component {
  public render() {
    return <div>Here there be manuscripts</div>;
  }

  protected renderLandingPage = () => {
    return <LandingPage />;
  };

  protected renderManuscriptPage = () => {
    return <LandingPage />;
  };
}
