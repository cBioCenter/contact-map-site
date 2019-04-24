import { ConnectedRouter } from 'connected-react-router';
import * as React from 'react';
import { Route, Switch } from 'react-router-dom';
import { Container } from 'semantic-ui-react';

import { SiteHeader } from '~contact-map-site~/container';
import { ManuscriptPage, VisualizationPage } from '~contact-map-site~/page';
import { history } from '~contact-map-site~/reducer';

export class ContactMapSitePage extends React.Component {
  public render() {
    return (
      <ConnectedRouter history={history}>
        <Container id={'ContactMapSitePage'} fluid={true}>
          <SiteHeader />
          <Switch>
            <Route path={'/manuscript'} render={this.renderManuscriptPage} />
            <Route exact={true} path={'/'} render={this.renderVisualizationPage} />
          </Switch>
        </Container>
      </ConnectedRouter>
    );
  }

  protected renderVisualizationPage = () => {
    return <VisualizationPage />;
  };

  protected renderManuscriptPage = () => {
    return <ManuscriptPage />;
  };
}
