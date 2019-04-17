import { Store } from 'bioblocks-viz';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';

import { LandingPage } from '~contact-map-site~';

ReactDOM.render(
  <Provider store={Store}>
    <LandingPage />
  </Provider>,
  document.getElementById('contact-map-root'),
);

if (module.hot) {
  module.hot.accept();
}
