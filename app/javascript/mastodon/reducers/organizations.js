import { Map as ImmutableMap, fromJS } from "immutable";

import { normalizeOrganization } from "../actions/importer/normalizer";
import { 
  ORGANIZATION_FETCH_REQUEST,
  ORGANIZATION_FETCH_SUCCESS,
  ORGANIZATION_FETCH_FAIL,
  ORGANIZATION_CREATE_SUCCESS,
  ORGANIZATION_UPDATE_SUCCESS,
  ORGANIZATION_DELETE_SUCCESS,
  ORGANIZATION_MEMBERS_FETCH_SUCCESS
} from '../actions/organizations';


function importOrganization(state, organization) {
  return state.set(organization.id, fromJS(normalizeOrganization(organization, state.get(organization.id))));
}

function importOrganizations(state, organizations) {
  return state.withMutations(mutable => {
    organizations.forEach(organization => {
      importOrganization(mutable, organization);
    });
  });
}

const initialState = ImmutableMap();
/** @type {import('@reduxjs/toolkit').Reducer<typeof initialState>} */
export default function organizations(state = initialState, action) {
  switch(action.type) {
  case 'ORGANIZATION_IMPORT':
    return importOrganization(state, action.organization);
    
  case 'ORGANIZATIONS_IMPORT':
    return importOrganizations(state, action.organizations);
    
  case ORGANIZATION_FETCH_REQUEST:
    return state.setIn([action.id, 'isLoading'], true);
    
  case ORGANIZATION_FETCH_SUCCESS:
    return state.setIn([action.id, 'isLoading'], false);
    
  case ORGANIZATION_FETCH_FAIL:
    return state.delete(action.id);
    
  case ORGANIZATION_CREATE_SUCCESS:
    return importOrganization(state, action.organization);
    
  case ORGANIZATION_UPDATE_SUCCESS:
    return importOrganization(state, action.organization);
    
  case ORGANIZATION_DELETE_SUCCESS:
    return state.delete(action.id);
    
  case ORGANIZATION_MEMBERS_FETCH_SUCCESS:
    return state.setIn([action.id, 'members'], fromJS(action.members));
    
  default:
    return state;
  }
}