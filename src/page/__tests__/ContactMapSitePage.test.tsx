import { ConnectedRouter } from 'connected-react-router';
import { mount, shallow } from 'enzyme';
import { createMemoryHistory } from 'history';
import * as React from 'react';
import { Provider } from 'react-redux';

import { ContactMapSitePage } from '~contact-map-site~/page';
import { configureStore } from '~contact-map-site~/reducer';

describe('ContactMapSitePage', () => {
  it('Should match existing snapshot when no props are provided.', () => {
    const wrapper = shallow(<ContactMapSitePage />);
    expect(wrapper).toMatchSnapshot();
  });

  it('Should update the menu buttons when changing pages.', () => {
    const store = configureStore();
    const history = createMemoryHistory();
    const wrapper = mount(
      <Provider store={store}>
        <ConnectedRouter history={history}>
          <ContactMapSitePage />
        </ConnectedRouter>
      </Provider>,
    );

    history.push('/manuscript');
    wrapper.update();
    expect(wrapper.find(ContactMapSitePage)).toMatchSnapshot();
  });
});
