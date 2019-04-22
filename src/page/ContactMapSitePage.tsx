import { ConnectedRouter } from 'connected-react-router';
import * as React from 'react';
import { Route, Switch } from 'react-router-dom';
import { Container } from 'semantic-ui-react';

import { LandingPage, ManuscriptPage } from '~contact-map-site~/page';
import { history } from '~contact-map-site~/reducer';

export class ContactMapSitePage extends React.Component {
  public render() {
    return (
      <ConnectedRouter history={history}>
        <Container id={'ContactMapSitePage'} fluid={true}>
          <Switch>
            <Route path={'/manuscript'} render={this.renderManuscriptPage} />
            <Route exact={true} path={'/'} render={this.renderLandingPage} />
          </Switch>
        </Container>
      </ConnectedRouter>
    );
  }

  protected renderLandingPage = () => {
    return <LandingPage />;
  };

  protected renderManuscriptPage = () => {
    return <ManuscriptPage />;
  };
}
