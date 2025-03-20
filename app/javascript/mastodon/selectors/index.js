import { createSelector } from '@reduxjs/toolkit';
import { List as ImmutableList, Map as ImmutableMap } from 'immutable';

import { me } from '../initial_state';

import { getFilters } from './filters';

export { makeGetAccount } from "./accounts";

export const makeGetStatus = () => {
  return createSelector(
    [
      (state, { id }) => state.getIn(['statuses', id]),
      (state, { id }) => state.getIn(['statuses', state.getIn(['statuses', id, 'reblog'])]),
      (state, { id }) => state.getIn(['accounts', state.getIn(['statuses', id, 'account'])]),
      (state, { id }) => state.getIn(['accounts', state.getIn(['statuses', state.getIn(['statuses', id, 'reblog']), 'account'])]),
      getFilters,
    ],

    (statusBase, statusReblog, accountBase, accountReblog, filters) => {
      if (!statusBase || statusBase.get('isLoading')) {
        return null;
      }

      if (statusReblog) {
        statusReblog = statusReblog.set('account', accountReblog);
      } else {
        statusReblog = null;
      }

      let filtered = false;
      if ((accountReblog || accountBase).get('id') !== me && filters) {
        let filterResults = statusReblog?.get('filtered') || statusBase.get('filtered') || ImmutableList();
        if (filterResults.some((result) => filters.getIn([result.get('filter'), 'filter_action']) === 'hide')) {
          return null;
        }
        filterResults = filterResults.filter(result => filters.has(result.get('filter')));
        if (!filterResults.isEmpty()) {
          filtered = filterResults.map(result => filters.getIn([result.get('filter'), 'title']));
        }
      }

      return statusBase.withMutations(map => {
        map.set('reblog', statusReblog);
        map.set('account', accountBase);
        map.set('matched_filters', filtered);
      });
    },
  );
};

export const makeGetPictureInPicture = () => {
  return createSelector([
    (state, { id }) => state.picture_in_picture.statusId === id,
    (state) => state.getIn(['meta', 'layout']) !== 'mobile',
  ], (inUse, available) => ImmutableMap({
    inUse: inUse && available,
    available,
  }));
};

const ALERT_DEFAULTS = {
  dismissAfter: 5000,
  style: false,
};

const formatIfNeeded = (intl, message, values) => {
  if (typeof message === 'object') {
    return intl.formatMessage(message, values);
  }

  return message;
};

export const getAlerts = createSelector([state => state.get('alerts'), (_, { intl }) => intl], (alerts, intl) =>
  alerts.map(item => ({
    ...ALERT_DEFAULTS,
    ...item,
    action: formatIfNeeded(intl, item.action, item.values),
    title: formatIfNeeded(intl, item.title, item.values),
    message: formatIfNeeded(intl, item.message, item.values),
  })).toArray());

export const makeGetNotification = () => createSelector([
  (_, base)             => base,
  (state, _, accountId) => state.getIn(['accounts', accountId]),
], (base, account) => base.set('account', account));

export const makeGetReport = () => createSelector([
  (_, base) => base,
  (state, _, targetAccountId) => state.getIn(['accounts', targetAccountId]),
], (base, targetAccount) => base.set('target_account', targetAccount));

export const getStatusList = createSelector([
  (state, type) => state.getIn(['status_lists', type, 'items']),
], (items) => items.toList());

export const getOrganization = createSelector(
  [(state, { org_id }) => state.getIn(['organizations', org_id])],
  (organization) => organization
);

export const makeGetOrganization = () => {
  return createSelector(
    [
      (state, { org_id }) => state.getIn(['organizations', org_id]),
      (state, { org_id }) => state.getIn(['organizations', org_id, 'members'])
    ],
    (organization, members) => {
      if (!organization) return null;
      
      return organization.set('members', members);
    }
  );
};

export const getJob = createSelector(
  [(state, { job_id }) => state.getIn(['jobs', job_id])],
  (job) => job
);

export const makeGetJob = () => {
  return createSelector(
    [
      (state, { job_id }) => state.getIn(['jobs', job_id]),
      (state, { job_id }) => state.getIn(['organizations', state.getIn(['jobs', job_id, 'organization'])]),
      (state, { job_id }) => state.getIn(['accounts', state.getIn(['jobs', job_id, 'user'])])
    ],
    (job, organization, user) => {
      if (!job) return null;
      
      return job.withMutations(map => {
        if (organization) {
          map.set('organization', organization);
        }
        if (user) {
          map.set('user', user);
        }
      });
    }
  );
};

export const getJobsList = createSelector([
  (state, type) => state.getIn(['job_lists', type, 'items']),
], (items) => items.toList());

export const getSavedJobs = createSelector([
  (state) => state.getIn(['jobs']),
], (jobs) => {
  return jobs.filter(job => job.get('saved') === true).toList();
});

export const getJobsByOrganization = createSelector(
  [
    (state, { org_id }) => state.getIn(['jobs']),
    (state, { org_id }) => org_id
  ],
  (jobs, orgId) => {
    return jobs.filter(job => 
      job.get('organization') === orgId
    ).toList();
  }
);

export const getFilteredJobs = createSelector(
  [
    (state) => state.getIn(['jobs']),
    (_, { filters }) => filters
  ],
  (jobs, filters) => {
    if (!filters) return jobs.toList();

    return jobs.filter(job => {
      // Apply various filters
      const matchesJobType = !filters.job_type || job.get('job_type') === filters.job_type;
      const matchesLocation = !filters.location || job.get('location') === filters.location;
      const matchesCategory = !filters.job_category || job.get('job_category') === filters.job_category;
      
      return matchesJobType && matchesLocation && matchesCategory;
    }).toList();
  }
);