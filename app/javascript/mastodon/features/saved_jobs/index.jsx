import SavedJobsIcon from '@/material-icons/400-24px/save_job_fill.svg';
import { defineMessages, injectIntl, useIntl } from 'react-intl';
import { Column } from 'mastodon/components/column';
import { ColumnHeader } from 'mastodon/components/column_header';
import { useAppDispatch } from 'mastodon/store';
import { connect } from 'react-redux';
import { useEffect, useState } from 'react';
import { fetchSavedJobs, unsaveJob } from 'mastodon/actions/jobs';
import JobCard from 'mastodon/components/job_card';
import { useHistory, withRouter } from 'react-router';
import { JOB_CATEGORIES, JOB_TYPES } from '../create_job/constants';

const messages = defineMessages({
    heading: { id: "navigation_bar.saved_jobs", defaultMessage: "Saved Jobs" },
    empty: { id: "job.empty_save_jobs", defaultMessage: "You haven't saved any jobs yet!" }
})

const SavedJobs = () => {
    const intl = useIntl();
    const dispatch = useAppDispatch();
    const history = useHistory();
    const [jobsData, setJobsData] = useState([]);
    const [reload, setReload] = useState(0);

    useEffect(() => {
        fetchJobsData();
    }, [dispatch, reload])

    const fetchJobsData = async () => {
        try {
            const res = await dispatch(fetchSavedJobs());
            if (res) {
                setJobsData(res);
            }    
        } catch (error) {
            console.error('Error fetching saved jobs:', error);
        }
    }

    const handleUnsaveJob = (jobId, e) => {
        e.stopPropagation();

        try {
            dispatch(unsaveJob(jobId)).then(res => {
                if (res) {
                   setReload(n=>n+1);
                }
            }).catch(error => {
                console.error('Error unsaving job:', error);
            });
        } catch (error) {
            console.error('Error unsaving job:', error);
        }
    }

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

    return (
        <Column
            label={intl.formatMessage(messages.heading)}
        >
            <ColumnHeader 
                title={intl.formatMessage(messages.heading)}
                icon='saved'
                iconComponent={SavedJobsIcon}
            />
            <div className='saved-jobs-container'>
                {jobsData.length === 0 ?
                    <p className='empty'>{intl.formatMessage(messages.empty)}</p>
                    :
                    jobsData?.map(job => {
                        return <JobCard 
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
                            isStudent={true}
                            isSaved={true}
                            handleUnsaveJob={handleUnsaveJob}
                            intl={intl}
                            history={history}
                        />
                    })
                }
            </div>
        </Column>
    )
}

export default connect()(injectIntl(withRouter(SavedJobs)));