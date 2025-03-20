import { Map as ImmutableMap, List, fromJS } from "immutable";

import { normalizeJob } from "../actions/importer/normalizer";
import { 
  JOB_FETCH_REQUEST,
  JOB_FETCH_SUCCESS,
  JOB_FETCH_FAIL,
  JOB_CREATE_SUCCESS,
  JOB_UPDATE_SUCCESS,
  JOB_DELETE_SUCCESS,
  JOB_SAVE_SUCCESS,
  JOB_UNSAVE_SUCCESS,
  JOB_FILTER_REQUEST,
  JOB_FILTER_SUCCESS,
  JOB_FILTER_FAIL,
  SAVED_JOBS_FETCH_REQUEST,
  SAVED_JOBS_FETCH_SUCCESS,
  SAVED_JOBS_FETCH_FAIL,
  CREATED_JOBS_FETCH_REQUEST,
  CREATED_JOBS_FETCH_SUCCESS,
  CREATED_JOBS_FETCH_FAIL,
} from '../actions/jobs';


function importJob(state, job) {
  return state.set(job.id, fromJS(normalizeJob(job, state.get(job.id))));
}

function importJobs(state, jobs) {
  return state.withMutations(mutable => {
    jobs.forEach(job => {
      importJob(mutable, job);
    });
  });
}

const initialState = ImmutableMap({
  jobLists: ImmutableMap({
    items: List(),
    isLoading: false,
    page: 1,
    totalPages: 0,
    totalCount: 0,
    error: null
  }),
  savedJobLists: ImmutableMap({
    items: List(),
    isLoading: false,
    page: 1,
    totalPages: 0,
    totalCount: 0,
    error: null
  }),
  createdJobLists: ImmutableMap({
    items: List(),
    isLoading: false,
    page: 1,
    totalPages: 0,
    totalCount: 0,
    error: null
  })
});

/** @type {import('@reduxjs/toolkit').Reducer<typeof initialState>} */
export default function jobs(state = initialState, action) {
  switch(action.type) {
  case 'JOB_IMPORT':
    return importJob(state, action.job);
    
  case 'JOBS_IMPORT':
    return importJobs(state, action.jobs);
    
  case JOB_FETCH_REQUEST:
    return state.setIn([action.id, 'isLoading'], true);
    
  case JOB_FETCH_SUCCESS:
    return state.setIn([action.id, 'isLoading'], false);
    
  case JOB_FETCH_FAIL:
    return state.delete(action.id);
    
  case JOB_CREATE_SUCCESS:
    return importJob(state, action.job);
    
  case JOB_UPDATE_SUCCESS:
    return importJob(state, action.job);
    
  case JOB_DELETE_SUCCESS:
    return state.delete(action.id);
    
  case JOB_SAVE_SUCCESS:
    return state.updateIn([action.id, 'saved'], () => true);
    
  case JOB_UNSAVE_SUCCESS:
    return state.updateIn([action.id, 'saved'], () => false);

  case JOB_FILTER_REQUEST:
    return state.setIn(['jobLists', 'isLoading'], true)
      .setIn(['jobLists', 'error'], null);
    
  case JOB_FILTER_SUCCESS:
    // Normalize and import all jobs
    const normalizedJobs = action.jobs.map(job => normalizeJob(job));
      
    return state.withMutations(mutable => {
      // Import individual jobs
      normalizedJobs.forEach(job => {
        mutable.set(job.id, fromJS(job));
      });
        
      // Update job list metadata
      mutable.setIn(['jobLists', 'items'], fromJS(normalizedJobs.map(job => job.id)));
      mutable.setIn(['jobLists', 'isLoading'], false);
      mutable.setIn(['jobLists', 'page'], action.page);
      mutable.setIn(['jobLists', 'totalPages'], action.totalPages);
      mutable.setIn(['jobLists', 'totalCount'], action.totalCount);
      mutable.setIn(['jobLists', 'error'], null);
    });
    
  case JOB_FILTER_FAIL:
    return state.setIn(['jobLists', 'isLoading'], false)
      .setIn(['jobLists', 'error'], fromJS(action.error));
    
  case SAVED_JOBS_FETCH_REQUEST:
    return state.setIn(['savedJobLists', 'isLoading'], true)
      .setIn(['savedJobLists', 'error'], null);

  case SAVED_JOBS_FETCH_SUCCESS:
    // Normalize and import all jobs
    const savedJobs = action.jobs.map(job => normalizeJob(job));
      
    return state.withMutations(mutable => {
      // Update saved jobs list metadata
      mutable.setIn(['savedJobLists', 'items'], fromJS(savedJobs.map(job => job.id)));
      mutable.setIn(['savedJobLists', 'isLoading'], false);
      mutable.setIn(['savedJobLists', 'page'], action.page);
      mutable.setIn(['savedJobLists', 'totalPages'], action.totalPages);
      mutable.setIn(['savedJobLists', 'totalCount'], action.totalCount);
      mutable.setIn(['savedJobLists', 'error'], null);
    });

  case SAVED_JOBS_FETCH_FAIL:
    return state.setIn(['savedJobLists', 'isLoading'], false)
      .setIn(['savedJobLists', 'error'], fromJS(action.error));
    
  case CREATED_JOBS_FETCH_REQUEST:
    return state.setIn(['createdJobLists', 'isLoading'], true)
      .setIn(['createdJobLists', 'error'], null);

  case CREATED_JOBS_FETCH_SUCCESS:
    // Normalize and import all jobs
    const createdJobs = action.jobs.map(job => normalizeJob(job));
      
    return state.withMutations(mutable => {
      // Update created jobs list metadata
      mutable.setIn(['createdJobLists', 'items'], fromJS(createdJobs.map(job => job.id)));
      mutable.setIn(['createdJobLists', 'isLoading'], false);
      mutable.setIn(['createdJobLists', 'page'], action.page);
      mutable.setIn(['createdJobLists', 'totalPages'], action.totalPages);
      mutable.setIn(['createdJobLists', 'totalCount'], action.totalCount);
      mutable.setIn(['createdJobLists', 'error'], null);
    });

  case CREATED_JOBS_FETCH_FAIL:
    return state.setIn(['createdJobLists', 'isLoading'], false)
      .setIn(['createdJobLists', 'error'], fromJS(action.error));
                
  default:
    return state;
  }
}