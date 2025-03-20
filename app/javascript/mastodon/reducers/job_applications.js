import { Map as ImmutableMap, List, fromJS } from "immutable";

import { normalizeJobApplication } from "../actions/importer/normalizer";
import { 
  JOB_APPLICATION_FETCH_REQUEST,
  JOB_APPLICATION_FETCH_SUCCESS,
  JOB_APPLICATION_FETCH_FAIL,
  JOB_APPLICATION_CREATE_SUCCESS,
  JOB_APPLICATION_UPDATE_SUCCESS,
  JOB_APPLICATION_WITHDRAW_SUCCESS,
  JOB_APPLICATION_DELETE_SUCCESS,
  JOB_APPLICATIONS_FETCH_REQUEST,
  JOB_APPLICATIONS_FETCH_SUCCESS,
  JOB_APPLICATIONS_FETCH_FAIL,
  JOB_APPLICATIONS_BY_JOB_FETCH_REQUEST,
  JOB_APPLICATIONS_BY_JOB_FETCH_SUCCESS,
  JOB_APPLICATIONS_BY_JOB_FETCH_FAIL,
  JOB_APPLICATION_CHECK_SUCCESS,
  APPLIED_JOBS_FETCH_REQUEST,
  APPLIED_JOBS_FETCH_SUCCESS,
  APPLIED_JOBS_FETCH_FAIL,
} from '../actions/job_applications';


function importJobApplication(state, application) {
  return state.set(application.id, fromJS(normalizeJobApplication(application, state.get(application.id))));
}

function importJobApplications(state, applications) {
  return state.withMutations(mutable => {
    applications.forEach(application => {
      importJobApplication(mutable, application);
    });
  });
}

const initialState = ImmutableMap({
  applicationLists: ImmutableMap({
    items: List(),
    isLoading: false,
    page: 1,
    totalPages: 0,
    totalCount: 0,
    error: null
  }),
  jobApplicationLists: ImmutableMap(),  // Indexed by jobId
  appliedJobLists: ImmutableMap({
    items: List(),
    isLoading: false,
    page: 1,
    totalPages: 0,
    totalCount: 0,
    error: null
  })
});

export default function jobApplications(state = initialState, action) {
  switch(action.type) {
  case 'JOB_APPLICATION_IMPORT':
    return importJobApplication(state, action.application);
    
  case 'JOB_APPLICATIONS_IMPORT':
    return importJobApplications(state, action.applications);
    
  case JOB_APPLICATION_FETCH_REQUEST:
    return state.setIn([action.id, 'isLoading'], true);
    
  case JOB_APPLICATION_FETCH_SUCCESS:
    return state.setIn([action.id, 'isLoading'], false);
    
  case JOB_APPLICATION_FETCH_FAIL:
    return state.delete(action.id);
    
  case JOB_APPLICATION_CREATE_SUCCESS:
    return importJobApplication(state, action.application);
    
  case JOB_APPLICATION_UPDATE_SUCCESS:
    return importJobApplication(state, action.application);
    
  case JOB_APPLICATION_WITHDRAW_SUCCESS:
    return state.updateIn([action.id, 'status'], () => 'withdrawn')
      .updateIn([action.id, 'isWithdrawn'], () => true);
    
  case JOB_APPLICATION_DELETE_SUCCESS:
    return state.delete(action.id);

  case JOB_APPLICATIONS_FETCH_REQUEST:
    return state.setIn(['applicationLists', 'isLoading'], true)
      .setIn(['applicationLists', 'error'], null);
    
  case JOB_APPLICATIONS_FETCH_SUCCESS:
    // Normalize and import all applications
    const normalizedApplications = action.applications.map(app => normalizeJobApplication(app));
      
    return state.withMutations(mutable => {
      // Update application list metadata
      mutable.setIn(['applicationLists', 'items'], fromJS(normalizedApplications.map(app => app.id)));
      mutable.setIn(['applicationLists', 'isLoading'], false);
      mutable.setIn(['applicationLists', 'page'], action.page);
      mutable.setIn(['applicationLists', 'totalPages'], action.totalPages);
      mutable.setIn(['applicationLists', 'totalCount'], action.totalCount);
      mutable.setIn(['applicationLists', 'error'], null);
    });
    
  case JOB_APPLICATIONS_FETCH_FAIL:
    return state.setIn(['applicationLists', 'isLoading'], false)
      .setIn(['applicationLists', 'error'], fromJS(action.error));
    
  case JOB_APPLICATIONS_BY_JOB_FETCH_REQUEST:
    return state.setIn(['jobApplicationLists', action.jobId, 'isLoading'], true)
      .setIn(['jobApplicationLists', action.jobId, 'error'], null);

  case JOB_APPLICATIONS_BY_JOB_FETCH_SUCCESS:
    // Normalize and import all applications for this job
    const jobApplications = action.applications.map(app => normalizeJobApplication(app));
      
    return state.withMutations(mutable => {
      // Update job applications list metadata
      mutable.setIn(['jobApplicationLists', action.jobId, 'items'], fromJS(jobApplications.map(app => app.id)));
      mutable.setIn(['jobApplicationLists', action.jobId, 'isLoading'], false);
      mutable.setIn(['jobApplicationLists', action.jobId, 'page'], action.page);
      mutable.setIn(['jobApplicationLists', action.jobId, 'totalPages'], action.totalPages);
      mutable.setIn(['jobApplicationLists', action.jobId, 'totalCount'], action.totalCount);
      mutable.setIn(['jobApplicationLists', action.jobId, 'error'], null);
    });

  case JOB_APPLICATIONS_BY_JOB_FETCH_FAIL:
    return state.setIn(['jobApplicationLists', action.jobId, 'isLoading'], false)
      .setIn(['jobApplicationLists', action.jobId, 'error'], fromJS(action.error));

  case JOB_APPLICATION_CHECK_SUCCESS:
    return state.setIn(['jobApplicationStatus', action.jobId], {
      applied: action.applied,
      applicationStatus: action.applicationStatus
    });

  case APPLIED_JOBS_FETCH_REQUEST:
    return state.setIn(['appliedJobLists', 'isLoading'], true)
      .setIn(['appliedJobLists', 'error'], null);

  case APPLIED_JOBS_FETCH_SUCCESS:
    return state.withMutations(mutable => {
      // Update applied jobs list metadata
      mutable.setIn(['appliedJobLists', 'items'], fromJS(action.jobs.map(job => job.id)));
      mutable.setIn(['appliedJobLists', 'isLoading'], false);
      mutable.setIn(['appliedJobLists', 'page'], action.page);
      mutable.setIn(['appliedJobLists', 'totalPages'], action.totalPages);
      mutable.setIn(['appliedJobLists', 'totalCount'], action.totalCount);
      mutable.setIn(['appliedJobLists', 'error'], null);
    });

  case APPLIED_JOBS_FETCH_FAIL:
    return state.setIn(['appliedJobLists', 'isLoading'], false)
      .setIn(['appliedJobLists', 'error'], fromJS(action.error));
                
  default:
    return state;
  }
}