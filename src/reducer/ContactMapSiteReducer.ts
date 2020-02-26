// ~contact-map-site~
// Contact Map Site Reducer
// Responsible for any state specific to the site - in this case, routing.
// ~contact-map-site~

import { connectRouter, RouterState } from 'connected-react-router';
import { History } from 'history';
import { combineReducers, Reducer } from 'redux';

export interface IContactMapSiteState {
  router: RouterState;
}

export const ContactMapSiteReducer = (history: History): Reducer<IContactMapSiteState> =>
  combineReducers({
    router: connectRouter(history),
  });
