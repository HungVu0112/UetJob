import Column from 'mastodon/features/ui/components/column';
import ImmutablePureComponent from "react-immutable-pure-component";
import { ColumnBackButton } from 'mastodon/components/column_back_button';
import { withRouter } from 'react-router';
import { defineMessages, FormattedMessage, injectIntl } from 'react-intl';
import ScrollableList from 'mastodon/components/scrollable_list';
import PropTypes from 'prop-types';
import { OrganizationHeader } from './components/organization_header';
import JobCard from 'mastodon/components/job_card';
import { fetchJobsByOrganization, fetchSavedJobs, saveJob, unsaveJob, updateJob } from 'mastodon/actions/jobs'; 
import { Map as ImmutableMap, List as ImmutableList } from 'immutable';
import { showAlert, showAlertForError } from 'mastodon/actions/alerts';
import { connect } from 'react-redux';
import { JOB_TYPES, JOB_CATEGORIES } from '../create_job/constants';
import { identityContextPropShape } from 'mastodon/identity_context';
import { withIdentity } from 'mastodon/identity_context';

const messages = defineMessages({
    job_update_success: { id: 'job.success_update', defaultMessage: 'Job updated successfully!' },
    job_update_error: { id: 'job.error_update', defaultMessage: 'Error updating job!' },
})

const mapStateToProps = state => ({
    savedJobs: state.getIn(['jobs', 'savedJobLists', 'items'], ImmutableList())
});

class Organization extends ImmutablePureComponent {
    static propTypes = {
        intl: PropTypes.object.isRequired,
        match: PropTypes.object.isRequired,
        history: PropTypes.object.isRequired,
        dispatch: PropTypes.func.isRequired,
        identity: identityContextPropShape,
        savedJobs: PropTypes.instanceOf(ImmutableList)
    }

    state = {
        jobs: ImmutableList(),
        isLoading: true,
        hasMore: true,
        page: 1,
        savedJobIds: new Set()
    }

    componentDidMount() {
        const { dispatch, match, identity } = this.props;
        const { id } = match.params;
        const { user_type } = identity;
        
        if (id) {
            this.fetchJobs(id);
        }

        // If the user is a student, fetch their saved jobs to know which jobs are saved
        if (user_type === 'student') {
            this.fetchSavedJobs();
        }
    }

    componentDidUpdate(prevProps) {
        const { match, savedJobs } = this.props;
        const { id } = match.params;
        const prevId = prevProps.match.params.id;
        
        // If organization ID changed, reset state and fetch new jobs
        if (id !== prevId) {
            this.setState({ jobs: ImmutableList(), isLoading: true, hasMore: true, page: 1 }, () => {
                this.fetchJobs(id);
            });
        }

        // If savedJobs list changed, update the savedJobIds Set
        if (savedJobs !== prevProps.savedJobs) {
            this.updateSavedJobsSet(savedJobs);
        }
    }

    fetchJobs = (organization_id) => {
        const { dispatch } = this.props;
        
        this.setState({ isLoading: true });
        
        dispatch(fetchJobsByOrganization(organization_id)).then(response => {
            this.setState(prevState => ({
                jobs: ImmutableList(response),
                isLoading: false,
                hasMore: response.length === 20,
            }));
        }).catch(error => {
            this.setState({ isLoading: false });
            console.error('Error fetching jobs:', error);
        });
    }

    fetchSavedJobs = () => {
        const { dispatch } = this.props;
        
        dispatch(fetchSavedJobs()).then(() => {
            this.updateSavedJobsSet(this.props.savedJobs);
        }).catch(error => {
            console.error('Error fetching saved jobs:', error);
        });
    }

    updateSavedJobsSet = (savedJobs) => {
        if (savedJobs && savedJobs.size > 0) {
            const savedJobIds = new Set(savedJobs.map(id => id.toString()));
            this.setState({ savedJobIds });
        }
    }

    isJobSaved = (jobId) => {
        return this.state.savedJobIds.has(jobId.toString());
    }

    handleCloseJob = (jobId, e) => {
        e.stopPropagation();

        const { dispatch, intl, match } = this.props;
        const { id } = match.params;
        const status = "closed";

        try {
            dispatch(updateJob(jobId, { status })).then(res => {
                if (res) {
                    dispatch(showAlert({
                        message: intl.formatMessage(messages.job_update_success)
                    }))
                    this.setState({ jobs: ImmutableList() }, () => {
                        this.fetchJobs(id);
                    });
                }
            }).catch(error => {
                dispatch(showAlertForError({
                    error: intl.formatMessage(messages.job_update_error)
                }))
            });
        } catch (error) {
            dispatch(showAlertForError({
                error: intl.formatMessage(messages.job_update_error)
            }))
        }
    }

    handleSaveJob = (jobId, e) => { 
        e.stopPropagation();

        const { dispatch, intl, match } = this.props;
        const { id } = match.params;

        try {
            dispatch(saveJob(jobId)).then(res => {
                if (res) {
                    // Update local state to reflect the change immediately
                    this.setState(prevState => {
                        const updatedSavedJobIds = new Set(prevState.savedJobIds);
                        updatedSavedJobIds.add(jobId.toString());
                        return { savedJobIds: updatedSavedJobIds };
                    });
                    
                    // Refresh saved jobs list
                    this.fetchSavedJobs();
                }
            }).catch(error => {
                console.error('Error saving job:', error);
                dispatch(showAlertForError({
                    error: error.response ? error.response.data.error : error.message
                }));
            });
        } catch (error) {
            console.error('Error saving job:', error);
            dispatch(showAlertForError({
                error: error.message
            }));
        }
    }

    handleUnsaveJob = (jobId, e) => {
        e.stopPropagation();

        const { dispatch, intl, match } = this.props;
        const { id } = match.params;

        try {
            dispatch(unsaveJob(jobId)).then(res => {
                if (res) {
                   // Update local state to reflect the change immediately
                    this.setState(prevState => {
                        const updatedSavedJobIds = new Set(prevState.savedJobIds);
                        updatedSavedJobIds.delete(jobId.toString());
                        return { savedJobIds: updatedSavedJobIds };
                    });
                    
                    // Refresh saved jobs list
                    this.fetchSavedJobs();
                }
            }).catch(error => {
                console.error('Error unsaving job:', error);
                dispatch(showAlertForError({
                    error: error.response ? error.response.data.error : error.message
                }));
            });
        } catch (error) {
            console.error('Error unsaving job:', error);
            dispatch(showAlertForError({
                error: error.message
            }));
        }
    }

    handleLoadMore = () => {
        const { match } = this.props;
        const { id } = match.params;
        
        if (id && !this.state.isLoading && this.state.hasMore) {
            this.fetchJobs(id);
        }
    }

    getHumanJobType = (jobType) => {
        const index = JOB_TYPES.value.findIndex(type => type === jobType);
        return index !== -1 ? JOB_TYPES.human_value[index] : jobType;
    };

    getHumanJobCategory = (jobCategory) => {
        for (const category of JOB_CATEGORIES) {
            const index = category.value.findIndex(cat => cat === jobCategory);
            if (index !== -1) {
                return category.human_value[index];
            }
        }
        return jobCategory;
    };
      
    render() {
        const { intl, match, identity, history } = this.props;
        const { id } = match.params;
        const { jobs, isLoading, hasMore } = this.state;
        const { user_type, organization_id } = identity;

        let emptyMessage = <FormattedMessage
            id='organization.empty_jobs'
            defaultMessage='There arent any jobs yet!'
        />
        
        return (
            <Column>
                <ColumnBackButton />

                <ScrollableList
                    className='organization-container'
                    prepend={
                        id && (
                            <OrganizationHeader org_id={id} />
                        )
                    }
                    scrollKey='organization-jobs'
                    alwaysPrepend
                    isLoading={isLoading}
                    hasMore={hasMore}
                    onLoadMore={this.handleLoadMore}
                    emptyMessage={emptyMessage}
                    bindToDocument={false}
                >
                    {jobs.map(job => (
                        <JobCard 
                            key={job.id}
                            jobData={{
                                id: job.id,
                                title: job.title,
                                organization_name: job.organization.name,
                                organization_logo: job.organization.avatar,
                                location: job.location,
                                salary_range: job.salary_range,
                                job_type: this.getHumanJobType(job.job_type),
                                job_category: this.getHumanJobCategory(job.job_category),
                                status: job.status,
                            }}
                            isStaff={user_type === 'organization' && organization_id.toString() === id}
                            isOrganizationType={user_type === 'organization'}
                            isStudent={user_type === "student"}
                            isSaved={this.isJobSaved(job.id)}
                            handleCloseJob={this.handleCloseJob}
                            handleSaveJob={this.handleSaveJob}
                            handleUnsaveJob={this.handleUnsaveJob}
                            intl={intl}
                            history={history}
                        />
                    ))}
                </ScrollableList>
            </Column>
        )
    }
}

export default connect(mapStateToProps)(injectIntl(withRouter(withIdentity(Organization))));