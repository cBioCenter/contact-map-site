import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';

import { configureStore, ContactMapSitePage } from '~contact-map-site~';

const Store = configureStore();

ReactDOM.render(
  <Provider store={Store}>
    <ContactMapSitePage />
  </Provider>,
  document.getElementById('contact-map-root'),
);

if (module.hot) {
  module.hot.accept();
}
