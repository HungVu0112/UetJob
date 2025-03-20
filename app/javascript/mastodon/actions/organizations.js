import api from '../api';

// Action Types
export const ORGANIZATION_FETCH_REQUEST = 'ORGANIZATION_FETCH_REQUEST';
export const ORGANIZATION_FETCH_SUCCESS = 'ORGANIZATION_FETCH_SUCCESS';
export const ORGANIZATION_FETCH_FAIL = 'ORGANIZATION_FETCH_FAIL';

export const ORGANIZATION_CREATE_REQUEST = 'ORGANIZATION_CREATE_REQUEST';
export const ORGANIZATION_CREATE_SUCCESS = 'ORGANIZATION_CREATE_SUCCESS';
export const ORGANIZATION_CREATE_FAIL = 'ORGANIZATION_CREATE_FAIL';

export const ORGANIZATION_UPDATE_REQUEST = 'ORGANIZATION_UPDATE_REQUEST';
export const ORGANIZATION_UPDATE_SUCCESS = 'ORGANIZATION_UPDATE_SUCCESS';
export const ORGANIZATION_UPDATE_FAIL = 'ORGANIZATION_UPDATE_FAIL';

export const ORGANIZATION_DELETE_REQUEST = 'ORGANIZATION_DELETE_REQUEST';
export const ORGANIZATION_DELETE_SUCCESS = 'ORGANIZATION_DELETE_SUCCESS';
export const ORGANIZATION_DELETE_FAIL = 'ORGANIZATION_DELETE_FAIL';

export const ORGANIZATION_MEMBERS_FETCH_REQUEST = 'ORGANIZATION_MEMBERS_FETCH_REQUEST';
export const ORGANIZATION_MEMBERS_FETCH_SUCCESS = 'ORGANIZATION_MEMBERS_FETCH_SUCCESS';
export const ORGANIZATION_MEMBERS_FETCH_FAIL = 'ORGANIZATION_MEMBERS_FETCH_FAIL';

// Action creators
export function fetchOrganizationRequest(id, skipLoading) {
  return {
    type: ORGANIZATION_FETCH_REQUEST,
    id,
    skipLoading,
  };
}

export function fetchOrganization(id, forceFetch = false) {
  return (dispatch, getState) => {
    const skipLoading = !forceFetch && getState().getIn(['organizations', id], null) !== null;

    if (skipLoading) {
      return;
    }

    dispatch(fetchOrganizationRequest(id, skipLoading));

    api().get(`/api/v1/organizations/${id}`).then(response => {
      dispatch(importFetchedOrganization(response.data));
      dispatch(fetchOrganizationSuccess(id, skipLoading));
    }).catch(error => {
      dispatch(fetchOrganizationFail(id, error, skipLoading));
    });
  };
}

export function fetchOrganizationSuccess(id, skipLoading) {
  return {
    type: ORGANIZATION_FETCH_SUCCESS,
    id,
    skipLoading,
  };
}

export function fetchOrganizationFail(id, error, skipLoading) {
  return {
    type: ORGANIZATION_FETCH_FAIL,
    id,
    error,
    skipLoading,
    skipAlert: true,
  };
}

export function createOrganization(params) {
  return (dispatch) => {
    dispatch({ type: ORGANIZATION_CREATE_REQUEST });

    return api().post('/api/v1/organizations', params).then(response => {
      dispatch({
        type: ORGANIZATION_CREATE_SUCCESS,
        organization: response.data,
      });
      return response.data;
    }).catch(error => {
      dispatch({
        type: ORGANIZATION_CREATE_FAIL,
        error: error.response.data,
      });
      throw error;
    });
  };
}

export function updateOrganization(id, params) {
  return (dispatch) => {
    dispatch({ type: ORGANIZATION_UPDATE_REQUEST, id });

    return api().put(`/api/v1/organizations/${id}`, params).then(response => {
      dispatch({
        type: ORGANIZATION_UPDATE_SUCCESS,
        organization: response.data,
      });
      return response.data;
    }).catch(error => {
      dispatch({
        type: ORGANIZATION_UPDATE_FAIL,
        id,
        error: error.response.data,
      });
      throw error;
    });
  };
}

export function deleteOrganization(id) {
  return (dispatch) => {
    dispatch({ type: ORGANIZATION_DELETE_REQUEST, id });

    return api().delete(`/api/v1/organizations/${id}`).then(() => {
      dispatch({
        type: ORGANIZATION_DELETE_SUCCESS,
        id,
      });
    }).catch(error => {
      dispatch({
        type: ORGANIZATION_DELETE_FAIL,
        id,
        error: error.response.data,
      });
      throw error;
    });
  };
}

export function fetchOrganizationMembers(id, page = 1) {
  return (dispatch) => {
    dispatch({ type: ORGANIZATION_MEMBERS_FETCH_REQUEST, id });

    return api().get(`/api/v1/organizations/${id}/members?page=${page}`).then(response => {
      dispatch({
        type: ORGANIZATION_MEMBERS_FETCH_SUCCESS,
        id,
        members: response.data,
        page,
      });
      return response.data;
    }).catch(error => {
      dispatch({
        type: ORGANIZATION_MEMBERS_FETCH_FAIL,
        id,
        error: error.response.data,
      });
      throw error;
    });
  };
}

export function importFetchedOrganization(organization) {
  return {
    type: 'ORGANIZATION_IMPORT',
    organization
  };
}

export function importFetchedOrganizations(organizations) {
  return {
    type: 'ORGANIZATIONS_IMPORT',
    organizations
  };
}

