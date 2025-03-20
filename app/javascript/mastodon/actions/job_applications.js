import api from '../api';

import { importFetchedJob } from './jobs';

// Action Types
export const JOB_APPLICATION_FETCH_REQUEST = 'JOB_APPLICATION_FETCH_REQUEST';
export const JOB_APPLICATION_FETCH_SUCCESS = 'JOB_APPLICATION_FETCH_SUCCESS';
export const JOB_APPLICATION_FETCH_FAIL = 'JOB_APPLICATION_FETCH_FAIL';

export const JOB_APPLICATION_CREATE_REQUEST = 'JOB_APPLICATION_CREATE_REQUEST';
export const JOB_APPLICATION_CREATE_SUCCESS = 'JOB_APPLICATION_CREATE_SUCCESS';
export const JOB_APPLICATION_CREATE_FAIL = 'JOB_APPLICATION_CREATE_FAIL';

export const JOB_APPLICATION_UPDATE_REQUEST = 'JOB_APPLICATION_UPDATE_REQUEST';
export const JOB_APPLICATION_UPDATE_SUCCESS = 'JOB_APPLICATION_UPDATE_SUCCESS';
export const JOB_APPLICATION_UPDATE_FAIL = 'JOB_APPLICATION_UPDATE_FAIL';

export const JOB_APPLICATION_WITHDRAW_REQUEST = 'JOB_APPLICATION_WITHDRAW_REQUEST';
export const JOB_APPLICATION_WITHDRAW_SUCCESS = 'JOB_APPLICATION_WITHDRAW_SUCCESS';
export const JOB_APPLICATION_WITHDRAW_FAIL = 'JOB_APPLICATION_WITHDRAW_FAIL';

export const JOB_APPLICATION_DELETE_REQUEST = 'JOB_APPLICATION_DELETE_REQUEST';
export const JOB_APPLICATION_DELETE_SUCCESS = 'JOB_APPLICATION_DELETE_SUCCESS';
export const JOB_APPLICATION_DELETE_FAIL = 'JOB_APPLICATION_DELETE_FAIL';

export const JOB_APPLICATIONS_FETCH_REQUEST = 'JOB_APPLICATIONS_FETCH_REQUEST';
export const JOB_APPLICATIONS_FETCH_SUCCESS = 'JOB_APPLICATIONS_FETCH_SUCCESS';
export const JOB_APPLICATIONS_FETCH_FAIL = 'JOB_APPLICATIONS_FETCH_FAIL';

export const JOB_APPLICATIONS_BY_JOB_FETCH_REQUEST = 'JOB_APPLICATIONS_BY_JOB_FETCH_REQUEST';
export const JOB_APPLICATIONS_BY_JOB_FETCH_SUCCESS = 'JOB_APPLICATIONS_BY_JOB_FETCH_SUCCESS';
export const JOB_APPLICATIONS_BY_JOB_FETCH_FAIL = 'JOB_APPLICATIONS_BY_JOB_FETCH_FAIL';

export const JOB_APPLICATION_CHECK_REQUEST = 'JOB_APPLICATION_CHECK_REQUEST';
export const JOB_APPLICATION_CHECK_SUCCESS = 'JOB_APPLICATION_CHECK_SUCCESS';
export const JOB_APPLICATION_CHECK_FAIL = 'JOB_APPLICATION_CHECK_FAIL';

export const APPLIED_JOBS_FETCH_REQUEST = 'APPLIED_JOBS_FETCH_REQUEST';
export const APPLIED_JOBS_FETCH_SUCCESS = 'APPLIED_JOBS_FETCH_SUCCESS';
export const APPLIED_JOBS_FETCH_FAIL = 'APPLIED_JOBS_FETCH_FAIL';

// Action creators
export function fetchJobApplicationRequest(id, skipLoading) {
  return {
    type: JOB_APPLICATION_FETCH_REQUEST,
    id,
    skipLoading,
  };
}

export function fetchJobApplication(id, forceFetch = false) {
  return (dispatch, getState) => {
    const skipLoading = !forceFetch && getState().getIn(['jobApplications', id], null) !== null;

    if (skipLoading) {
      return Promise.resolve();
    }

    dispatch(fetchJobApplicationRequest(id, skipLoading));

    return api().get(`/api/v1/applications/${id}`).then(response => {
      dispatch(importFetchedJobApplication(response.data));
      dispatch(fetchJobApplicationSuccess(id, skipLoading));
      return response.data;
    }).catch(error => {
      dispatch(fetchJobApplicationFail(id, error, skipLoading));
      throw error;
    });
  };
}

export function fetchJobApplicationSuccess(id, skipLoading) {
  return {
    type: JOB_APPLICATION_FETCH_SUCCESS,
    id,
    skipLoading,
  };
}

export function fetchJobApplicationFail(id, error, skipLoading) {
  return {
    type: JOB_APPLICATION_FETCH_FAIL,
    id,
    error,
    skipLoading,
    skipAlert: true,
  };
}

export function createJobApplication(jobId, params) {
  return (dispatch) => {
    dispatch({ type: JOB_APPLICATION_CREATE_REQUEST });

    const formData = new FormData();
    
    // Append fields from params to formData
    Object.keys(params).forEach(key => {
      // Special handling for file fields
      if (key === 'resume' && params[key] instanceof File) {
        formData.append('resume', params[key]);
      } else {
        formData.append(key, params[key]);
      }
    });

    return api().post(`/api/v1/jobs/${jobId}/applications`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    }).then(response => {
      dispatch({
        type: JOB_APPLICATION_CREATE_SUCCESS,
        application: response.data,
      });
      return response.data;
    }).catch(error => {
      dispatch({
        type: JOB_APPLICATION_CREATE_FAIL,
        error: error.response?.data || error,
      });
      throw error;
    });
  };
}

export function updateJobApplicationStatus(id, params) {
  return (dispatch) => {
    dispatch({ type: JOB_APPLICATION_UPDATE_REQUEST, id });

    return api().put(`/api/v1/applications/${id}`, params).then(response => {
      dispatch({
        type: JOB_APPLICATION_UPDATE_SUCCESS,
        application: response.data,
      });
      return response.data;
    }).catch(error => {
      dispatch({
        type: JOB_APPLICATION_UPDATE_FAIL,
        id,
        error: error.response?.data || error,
      });
      throw error;
    });
  };
}

export function withdrawJobApplication(id) {
  return (dispatch) => {
    dispatch({ type: JOB_APPLICATION_WITHDRAW_REQUEST, id });

    return api().put(`/api/v1/applications/${id}/withdraw`).then(response => {
      dispatch({
        type: JOB_APPLICATION_WITHDRAW_SUCCESS,
        id,
        application: response.data,
      });
      return response.data;
    }).catch(error => {
      dispatch({
        type: JOB_APPLICATION_WITHDRAW_FAIL,
        id,
        error: error.response?.data || error,
      });
      throw error;
    });
  };
}

export function deleteJobApplication(id) {
  return (dispatch) => {
    dispatch({ type: JOB_APPLICATION_DELETE_REQUEST, id });

    return api().delete(`/api/v1/applications/${id}`).then(() => {
      dispatch({
        type: JOB_APPLICATION_DELETE_SUCCESS,
        id,
      });
    }).catch(error => {
      dispatch({
        type: JOB_APPLICATION_DELETE_FAIL,
        id,
        error: error.response?.data || error,
      });
      throw error;
    });
  };
}

export function fetchJobApplications(page = 1) {
  return (dispatch) => {
    dispatch({ type: JOB_APPLICATIONS_FETCH_REQUEST });

    return api().get(`/api/v1/applications?page=${page}`).then(response => {
      if (response.data && response.data.length > 0) {
        dispatch(importFetchedJobApplications(response.data));
      }
      
      dispatch({
        type: JOB_APPLICATIONS_FETCH_SUCCESS,
        applications: response.data,
        page: page,
        totalPages: response.headers['x-total-pages'],
        totalCount: response.headers['x-total-count']
      });
      return response.data;
    }).catch(error => {
      dispatch({
        type: JOB_APPLICATIONS_FETCH_FAIL,
        error: error.response?.data || error
      });
      throw error;
    });
  };
}

export function fetchJobApplicationsByJob(jobId, page = 1) {
  return (dispatch) => {
    dispatch({ type: JOB_APPLICATIONS_BY_JOB_FETCH_REQUEST, jobId });

    return api().get(`/api/v1/jobs/${jobId}/applications?page=${page}`).then(response => {
      if (response.data && response.data.length > 0) {
        dispatch(importFetchedJobApplications(response.data));
      }
      
      dispatch({
        type: JOB_APPLICATIONS_BY_JOB_FETCH_SUCCESS,
        jobId,
        applications: response.data,
        page: page,
        totalPages: response.headers['x-total-pages'],
        totalCount: response.headers['x-total-count']
      });
      return response.data;
    }).catch(error => {
      dispatch({
        type: JOB_APPLICATIONS_BY_JOB_FETCH_FAIL,
        jobId,
        error: error.response?.data || error
      });
      throw error;
    });
  };
}

export function checkJobApplication(jobId) {
  return (dispatch) => {
    dispatch({ type: JOB_APPLICATION_CHECK_REQUEST, jobId });

    return api().get(`/api/v1/jobs/${jobId}/applications/check_applied`).then(response => {
      dispatch({
        type: JOB_APPLICATION_CHECK_SUCCESS,
        jobId,
        applied: response.data.applied,
        applicationStatus: response.data.application_status
      });
      return response.data;
    }).catch(error => {
      dispatch({
        type: JOB_APPLICATION_CHECK_FAIL,
        jobId,
        error: error.response?.data || error
      });
      throw error;
    });
  };
}

export function fetchAppliedJobs(page = 1) {
  return (dispatch) => {
    dispatch({ type: APPLIED_JOBS_FETCH_REQUEST });

    return api().get(`/api/v1/applications/applied_jobs?page=${page}`).then(response => {
      // If we have jobs, import them
      if (response.data && response.data.length > 0) {
        // This will import the jobs into the jobs reducer
        dispatch({
          type: 'JOBS_IMPORT',
          jobs: response.data
        });
      }
      
      dispatch({
        type: APPLIED_JOBS_FETCH_SUCCESS,
        jobs: response.data,
        page: page,
        totalPages: response.headers['x-total-pages'],
        totalCount: response.headers['x-total-count']
      });
      return response.data;
    }).catch(error => {
      dispatch({
        type: APPLIED_JOBS_FETCH_FAIL,
        error: error.response?.data || error
      });
      throw error;
    });
  };
}

export function importFetchedJobApplication(application) {
  return {
    type: 'JOB_APPLICATION_IMPORT',
    application
  };
}

export function importFetchedJobApplications(applications) {
  return {
    type: 'JOB_APPLICATIONS_IMPORT',
    applications
  };
}