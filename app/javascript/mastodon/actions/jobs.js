import api from '../api';

// Action Types
export const JOB_FETCH_REQUEST = 'JOB_FETCH_REQUEST';
export const JOB_FETCH_SUCCESS = 'JOB_FETCH_SUCCESS';
export const JOB_FETCH_FAIL = 'JOB_FETCH_FAIL';

export const JOB_CREATE_REQUEST = 'JOB_CREATE_REQUEST';
export const JOB_CREATE_SUCCESS = 'JOB_CREATE_SUCCESS';
export const JOB_CREATE_FAIL = 'JOB_CREATE_FAIL';

export const JOB_UPDATE_REQUEST = 'JOB_UPDATE_REQUEST';
export const JOB_UPDATE_SUCCESS = 'JOB_UPDATE_SUCCESS';
export const JOB_UPDATE_FAIL = 'JOB_UPDATE_FAIL';

export const JOB_DELETE_REQUEST = 'JOB_DELETE_REQUEST';
export const JOB_DELETE_SUCCESS = 'JOB_DELETE_SUCCESS';
export const JOB_DELETE_FAIL = 'JOB_DELETE_FAIL';

export const JOB_SAVE_REQUEST = 'JOB_SAVE_REQUEST';
export const JOB_SAVE_SUCCESS = 'JOB_SAVE_SUCCESS';
export const JOB_SAVE_FAIL = 'JOB_SAVE_FAIL';

export const JOB_UNSAVE_REQUEST = 'JOB_UNSAVE_REQUEST';
export const JOB_UNSAVE_SUCCESS = 'JOB_UNSAVE_SUCCESS';
export const JOB_UNSAVE_FAIL = 'JOB_UNSAVE_FAIL';

export const JOB_FILTER_REQUEST = 'JOB_FILTER_REQUEST';
export const JOB_FILTER_SUCCESS = 'JOB_FILTER_SUCCESS';
export const JOB_FILTER_FAIL = 'JOB_FILTER_FAIL';

export const SAVED_JOBS_FETCH_REQUEST = 'SAVED_JOBS_FETCH_REQUEST';
export const SAVED_JOBS_FETCH_SUCCESS = 'SAVED_JOBS_FETCH_SUCCESS';
export const SAVED_JOBS_FETCH_FAIL = 'SAVED_JOBS_FETCH_FAIL';

export const CREATED_JOBS_FETCH_REQUEST = 'CREATED_JOBS_FETCH_REQUEST';
export const CREATED_JOBS_FETCH_SUCCESS = 'CREATED_JOBS_FETCH_SUCCESS';
export const CREATED_JOBS_FETCH_FAIL = 'CREATED_JOBS_FETCH_FAIL';

// Action creators
export function fetchJobRequest(id, skipLoading) {
  return {
    type: JOB_FETCH_REQUEST,
    id,
    skipLoading,
  };
}

export function fetchJob(id, forceFetch = false) {
  return (dispatch, getState) => {
    const skipLoading = !forceFetch && getState().getIn(['jobs', id], null) !== null;

    if (skipLoading) {
      return Promise.resolve();
    }

    dispatch(fetchJobRequest(id, skipLoading));

    return api().get(`/api/v1/jobs/${id}`).then(response => {
      dispatch(importFetchedJob(response.data));
      dispatch(fetchJobSuccess(id, skipLoading));
      return response.data;
    }).catch(error => {
      dispatch(fetchJobFail(id, error, skipLoading));
    });
  };
}

export function fetchJobSuccess(id, skipLoading) {
  return {
    type: JOB_FETCH_SUCCESS,
    id,
    skipLoading,
  };
}

export function fetchJobFail(id, error, skipLoading) {
  return {
    type: JOB_FETCH_FAIL,
    id,
    error,
    skipLoading,
    skipAlert: true,
  };
}

export function createJob(params) {
  return (dispatch) => {
    dispatch({ type: JOB_CREATE_REQUEST });

    return api().post('/api/v1/jobs', params).then(response => {
      dispatch({
        type: JOB_CREATE_SUCCESS,
        job: response.data,
      });
      return response.data;
    }).catch(error => {
      dispatch({
        type: JOB_CREATE_FAIL,
        error: error.response.data,
      });
      throw error;
    });
  };
}

export function updateJob(id, params) {
  return (dispatch) => {
    dispatch({ type: JOB_UPDATE_REQUEST, id });

    return api().put(`/api/v1/jobs/${id}`, params).then(response => {
      dispatch({
        type: JOB_UPDATE_SUCCESS,
        job: response.data,
      });
      return response.data;
    }).catch(error => {
      dispatch({
        type: JOB_UPDATE_FAIL,
        id,
        error: error.response.data,
      });
      throw error;
    });
  };
}

export function deleteJob(id) {
  return (dispatch) => {
    dispatch({ type: JOB_DELETE_REQUEST, id });

    return api().delete(`/api/v1/jobs/${id}`).then(() => {
      dispatch({
        type: JOB_DELETE_SUCCESS,
        id,
      });
    }).catch(error => {
      dispatch({
        type: JOB_DELETE_FAIL,
        id,
        error: error.response.data,
      });
      throw error;
    });
  };
}

export function saveJob(id) {
  return (dispatch) => {
    dispatch({ type: JOB_SAVE_REQUEST, id });

    return api().post(`/api/v1/jobs/${id}/save_job`).then(response => {
      dispatch({
        type: JOB_SAVE_SUCCESS,
        id,
      });
      return response.data;
    }).catch(error => {
      dispatch({
        type: JOB_SAVE_FAIL,
        id,
        error: error.response.data,
      });
      throw error;
    });
  };
}

export function unsaveJob(id) {
  return (dispatch) => {
    dispatch({ type: JOB_UNSAVE_REQUEST, id });

    return api().delete(`/api/v1/jobs/${id}/unsave_job`).then(response => {
      dispatch({
        type: JOB_UNSAVE_SUCCESS,
        id,
      });
      return response.data;
    }).catch(error => {
      dispatch({
        type: JOB_UNSAVE_FAIL,
        id,
        error: error.response.data,
      });
      throw error;
    });
  };
}

export function filterJobs(params = {}) {
  return (dispatch) => {
    dispatch({ type: JOB_FILTER_REQUEST });

    // Prepare query parameters
    const queryParams = new URLSearchParams();

    // Add filter parameters from the controller
    if (params.organization_id) {
      queryParams.append('organization_id', params.organization_id);
    }

    if (params.job_type) {
      queryParams.append('job_type', params.job_type);
    }

    if (params.job_category) {
      queryParams.append('job_category', params.job_category);
    }

    if (params.q) {
      queryParams.append('q', params.q);
    }

    // Sorting options
    if (params.sort) {
      queryParams.append('sort', params.sort);
    }

    // Pagination
    // if (params.page) {
    //   queryParams.append('page', params.page);
    // }

    // Construct the URL with query parameters
    const url = `/api/v1/jobs?${queryParams.toString()}`;

    return api().get(url).then(response => {
      dispatch({
        type: JOB_FILTER_SUCCESS,
        jobs: response.data,
        page: params.page || 1,
        totalPages: response.headers['x-total-pages'], // Assuming the API returns total pages in headers
        totalCount: response.headers['x-total-count']  // Assuming the API returns total count in headers
      });
      return response.data;
    }).catch(error => {
      dispatch({
        type: JOB_FILTER_FAIL,
        error: error.response ? error.response.data : error
      });
      throw error;
    });
  };
}

// Convenience method for common filter scenarios
export function fetchJobsByType(jobType, page = 1) {
  return filterJobs({ job_type: jobType, page });
}

export function searchJobs(query, page = 1) {
  return filterJobs({ q: query, page });
}

export function fetchJobsByOrganization(organizationId) {
  return filterJobs({ organization_id: organizationId });
}

export function fetchSavedJobs(page = 1) {
  return (dispatch) => {
    dispatch({ type: SAVED_JOBS_FETCH_REQUEST });

    return api().get(`/api/v1/jobs/saved_jobs?page=${page}`).then(response => {
      // First import the jobs data
      if (response.data && response.data.length > 0) {
        dispatch(importFetchedJobs(response.data));
      }
      
      // Then update the saved jobs list
      dispatch({
        type: SAVED_JOBS_FETCH_SUCCESS,
        jobs: response.data,
        page: page,
        totalPages: response.headers['x-total-pages'],
        totalCount: response.headers['x-total-count']
      });
      return response.data;
    }).catch(error => {
      dispatch({
        type: SAVED_JOBS_FETCH_FAIL,
        error: error.response ? error.response.data : error
      });
      throw error;
    });
  };
}

export function fetchCreatedJobs(page = 1) {
  return (dispatch) => {
    dispatch({ type: CREATED_JOBS_FETCH_REQUEST });

    return api().get(`/api/v1/jobs/created_jobs?page=${page}`).then(response => {
      // First import the jobs data
      if (response.data && response.data.length > 0) {
        dispatch(importFetchedJobs(response.data));
      }
      
      // Then update the created jobs list
      dispatch({
        type: CREATED_JOBS_FETCH_SUCCESS,
        jobs: response.data,
        page: page,
        totalPages: response.headers['x-total-pages'],
        totalCount: response.headers['x-total-count']
      });
      return response.data;
    }).catch(error => {
      dispatch({
        type: CREATED_JOBS_FETCH_FAIL,
        error: error.response ? error.response.data : error
      });
      throw error;
    });
  };
}

export function importFetchedJob(job) {
  return {
    type: 'JOB_IMPORT',
    job
  };
}

export function importFetchedJobs(jobs) {
  return {
    type: 'JOBS_IMPORT',
    jobs
  };
}