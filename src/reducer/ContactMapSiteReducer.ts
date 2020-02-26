// ~contact-map-site~
// Contact Map Site Reducer
// Responsible for any state specific to the site - in this case, routing.
// ~contact-map-site~

import { connectRouter, RouterState } from 'connected-react-router';
import { History } from 'history';
import { combineReducers } from 'redux';

export interface IContactMapSiteState {
  router: RouterState;
}

export const ContactMapSiteReducer = (history: History) =>
  combineReducers({
    router: connectRouter(history),
  });
