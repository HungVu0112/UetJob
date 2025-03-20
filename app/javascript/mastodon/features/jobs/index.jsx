import React, { useCallback, useEffect, useState } from 'react';
import Column from 'mastodon/features/ui/components/column';
import ColumnHeader from 'mastodon/components/column_header';
import { Helmet } from 'react-helmet';
import { defineMessages, injectIntl, useIntl } from 'react-intl';
import JobIcon from '@/material-icons/400-24px/jobs-fill.svg?react';
import { connect } from 'react-redux';
import { JOB_CATEGORIES, JOB_TYPES } from '../create_job/constants';
import { useAppDispatch } from 'mastodon/store';
import SearchIcon from '@/material-icons/400-24px/search.svg?react';
import { filterJobs, saveJob, unsaveJob, fetchSavedJobs } from 'mastodon/actions/jobs';
import JobCard from 'mastodon/components/job_card';
import { useIdentity, withIdentity } from 'mastodon/identity_context';
import { withRouter } from 'react-router';
import { useHistory } from 'react-router';

const messages = defineMessages({
    heading: { id: 'column.jobs', defaultMessage: 'Jobs' },
    job_type: { id: "job.job_type", defaultMessage: "Job Type" },
    job_category: { id: "job.job_category", defaultMessage: "Job Category" },
    all_job: { id: "job.all", defaultMessage: "All" },
    filter: { id: "job.filter", defaultMessage: "Filter" },
    search_placeholder: { id: "job.search_placeholder", defaultMessage: "Search for jobs..."},
    search: { id: "job.search", defaultMessage: "Search"},
    empty: { id: 'organization.empty_jobs', defaultMessage: "There are no suitable jobs!"},
    saved_jobs: { id: 'job.saved_jobs', defaultMessage: "Saved Jobs" },
});

const Jobs = () => {
    const intl = useIntl();
    const dispatch = useAppDispatch();
    const identity = useIdentity();
    const history = useHistory();
    const { user_type } = identity;
    const [filterParams, setFilterParams] = useState({
        job_type: "all",
        job_category: "all",
        query: ""
    });
    const [jobs, setJobs] = useState([]);
    const [savedJobIds, setSavedJobIds] = useState([]);
    const [reLoad, setReLoad] = useState(0);

    // Fetch both regular jobs and saved jobs on mount
    useEffect(() => {
        // Fetch regular jobs
        dispatch(filterJobs({})).then(res => {
            if (res) {
                setJobs(res);
            }
        }).catch(error => {
            console.error('Error fetching jobs:', error);
        });
    }, [dispatch]);

    useEffect(() => {
        // Fetch saved jobs if user is a student
        if (user_type === 'student') {
            dispatch(fetchSavedJobs()).then(res => {
                if (res) {
                    // Extract just the IDs of saved jobs for easier comparison
                    const ids = res.map(job => job.id.toString());
                    setSavedJobIds(ids);
                }
            }).catch(error => {
                console.error('Error fetching saved jobs:', error);
            });
        }
    }, [reLoad, user_type])

    const handleInputChange = useCallback((e) => {
        const { name, value } = e.target;
        setFilterParams(prev => ({
            ...prev,
            [name]: value
        }));
    }, []);

    const handleFilter = useCallback(() => {
        const { job_type, job_category, query } = filterParams;

        const params = {
            job_type: job_type === "all" ? "" : job_type,
            job_category: job_category === "all" ? "" : job_category,
            q: query
        };

        dispatch(filterJobs(params)).then(res => {
            if (res) {
                setJobs(res);
            } else {
                setJobs([]);
            }
        }).catch(error => {
            console.error('Error filtering jobs:', error);
        });
    }, [filterParams.job_type, filterParams.job_category, filterParams.query, dispatch]);

    const getHumanJobType = (jobType) => {
        const index = JOB_TYPES.value.findIndex(type => type === jobType);
        return index !== -1 ? JOB_TYPES.human_value[index] : jobType;
    };

    const getHumanJobCategory = (jobCategory) => {
        for (const category of JOB_CATEGORIES) {
            const index = category.value.findIndex(cat => cat === jobCategory);
            if (index !== -1) {
                return category.human_value[index];
            }
        }
        return jobCategory;
    };
    
    const handleSaveJob = async (id, e) => { 
        e.stopPropagation();
        
        try {
            const res = await dispatch(saveJob(id));
            if (res) {
                // Add the job ID to the savedJobIds array
                setSavedJobIds(prev => [...prev, id.toString()]);
                setReLoad(n => n + 1);
            }
        } catch (error) {
            console.error('Error saving job:', error);
        }
    };

    const handleUnsaveJob = async (id, e) => {
        e.stopPropagation();

        try {
            const res = await dispatch(unsaveJob(id));
            if (res) {
                // Remove the job ID from the savedJobIds array
                setSavedJobIds(prev => prev.filter(jobId => jobId !== id.toString()));
                setReLoad(n => n + 1);
            }
        } catch (error) {
            console.error('Error unsaving job:', error);
        }
    };

    // Check if a job is saved by the current user
    const isJobSaved = (jobId) => {
        return savedJobIds.includes(jobId.toString());
    };

    return (
        <Column>
            <ColumnHeader
                title={intl.formatMessage(messages.heading)}
                icon='jobs'
                iconComponent={JobIcon}
            />
            <Helmet>
                <title>{intl.formatMessage(messages.heading)}</title>
                <meta name='robots' content='noindex' />
            </Helmet>
            <div className='jobs-container'>
                <div className='jobs-container__filter_tab'>
                    <div className='dropdown'>
                        <label htmlFor="job_type">{intl.formatMessage(messages.job_type)}:</label>
                        <select name="job_type" id="job_type" value={filterParams.job_type} onChange={handleInputChange} >
                            <option value="all">{intl.formatMessage(messages.all_job)}</option>
                            {JOB_TYPES.value.map((val, index) => (
                                <option key={val} value={val}>{JOB_TYPES.human_value[index]}</option>
                            ))}        
                        </select>
                    </div>
                    <div className='dropdown'>
                        <label htmlFor="job_category">
                            {intl.formatMessage(messages.job_category)}:
                        </label>
                        <select name="job_category" id="job_category" value={filterParams.job_category} onChange={handleInputChange}>
                            <option value="all">{intl.formatMessage(messages.all_job)}</option>
                            {JOB_CATEGORIES.map((jobCat) => (
                                <optgroup key={jobCat.key} label={jobCat.key}>
                                    {jobCat.value.map((val, index) => (
                                        <option key={val} value={val}>{jobCat.human_value[index]}</option>
                                    ))}
                                </optgroup>
                            ))}   
                        </select>                       
                    </div>
                    <button onClick={handleFilter}>
                        {intl.formatMessage(messages.filter)}
                    </button>
                </div>

                <div className='jobs-container__search_tab'>
                    <div className='search_input'>
                        <SearchIcon fill='var(--on-input-color)' width={20}/>
                        <input 
                            type="text" 
                            id="search" 
                            name="query" 
                            placeholder={intl.formatMessage(messages.search_placeholder)} 
                            value={filterParams.query}
                            onChange={handleInputChange}
                        />
                    </div>

                    <button onClick={handleFilter}>
                        {intl.formatMessage(messages.search)}
                    </button>
                </div>
                
                <div className='jobs-container__job_list'>
                    {jobs.length === 0 ? (
                        <p className='empty_job'>{intl.formatMessage(messages.empty)}</p>
                    ) : (
                        jobs.map(job => (
                            <JobCard 
                                key={job.id}
                                jobData={{
                                    id: job.id,
                                    title: job.title,
                                    organization_name: job.organization.name,
                                    organization_logo: job.organization.avatar,
                                    location: job.location,
                                    salary_range: job.salary_range,
                                    job_type: getHumanJobType(job.job_type),
                                    job_category: getHumanJobCategory(job.job_category),
                                    status: job.status,
                                }}
                                isOrganizationType={user_type === 'organization'}
                                isStudent={user_type === 'student'}
                                isSaved={isJobSaved(job.id)}
                                handleSaveJob={handleSaveJob}
                                handleUnsaveJob={handleUnsaveJob}
                                intl={intl}
                                history={history}
                            />
                        ))
                    )}
                </div>
            </div>
        </Column>
    );
};

const mapStateToProps = state => ({
    savedJobs: state.getIn(['savedJobLists', 'items'], [])
});

export default connect(mapStateToProps)(injectIntl(withIdentity(withRouter(Jobs))));