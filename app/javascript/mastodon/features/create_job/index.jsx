import { Column } from 'mastodon/components/column';
import { ColumnHeader } from 'mastodon/components/column_header';
import { defineMessages, injectIntl, useIntl } from 'react-intl';
import HeaderIcon from '@/material-icons/400-24px/edit_note-fill.svg';
import { useCallback, useState } from 'react';
import Editor from './components/editor';
import { JOB_TYPES, JOB_CATEGORIES } from './constants';
import { ColumnBackButton } from 'mastodon/components/column_back_button';
import { showAlert, showAlertForError } from 'mastodon/actions/alerts';
import { useAppDispatch } from 'mastodon/store';
import { createJob } from 'mastodon/actions/jobs';
import { useHistory } from 'react-router';
import { withRouter } from 'react-router';

const messages = defineMessages({
    heading: { id: "organization.create_job_heading", defaultMessage: "Create Job" },
    title: { id: "job.title", defaultMessage: "Title" },
    description: { id: "job.description", defaultMessage: "Description" },
    requirements: { id: "job.requirements", defaultMessage: "Requirements" },
    location: { id: "job.location", defaultMessage: "Location" },
    salary_range: { id: "job.salary_range", defaultMessage: "Salary Range" },
    job_type: { id: "job.job_type", defaultMessage: "Job Type" },
    job_category: { id: "job.job_category", defaultMessage: "Job Category" },
    contact_email: { id: "job.contact_email", defaultMessage: "Contact Email" },
    deadline: { id: "job.deadline", defaultMessage: "Deadline" },
    submit: { id: "job.submit", defaultMessage: "Submit" },
    empty_fields: { id: "job.empty_fields", defaultMessage: "You should fill all the empty fields!" },
    success_create: {  id: "job.success_create", defaultMessage: "Successfully created!"},
    error_create: { id:  "job.error_create", defaultMessage: "Error creating job!"}
});

const CreateJobPage = () => {
    const intl = useIntl();
    const dispatch = useAppDispatch();
    const history = useHistory();
    const [jobData, setJobData] = useState({
        title: '',
        description: '',
        requirements: '',
        location: '',
        salary_range: '',
        job_type: 'full_time',
        job_category: 'software_engineering',
        contact_email: '',
        deadline: ''
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleInputChange = useCallback((e) => {
        const { name, value } = e.target;
        setJobData(prev => ({
            ...prev,
            [name]: value
        }));
    }, []);

    const handleEditorChange = useCallback((field, content) => {
        setJobData(prev => ({
            ...prev,
            [field]: content
        }));
    }, []);    

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();

        if (jobData.description != '' && jobData.requirements != ''    ) {
            setIsLoading(true);

            try {
                const res = await dispatch(createJob(jobData));

                console.log(res);

                dispatch(showAlert({
                    message: intl.formatMessage(messages.success_create),
                }));

                setTimeout(() => {
                    history.goBack();
                }, 2000);
            } catch (error) {
                setIsLoading(false);
                dispatch(showAlertForError({
                    message: intl.formatMessage(messages.error_create)
                }));
            }
        } else {
            dispatch(showAlert({
                messages: intl.formatMessage(messages.empty_fields)
            }));
        }
        
    }, [dispatch, jobData, intl]);

    return (
        <Column>
            <ColumnBackButton />
            <ColumnHeader
                title={intl.formatMessage(messages.heading)}
                icon='edit_note'
                iconComponent={HeaderIcon}
            />
            <form className="create-job-container" onSubmit={handleSubmit}>
                <div className='flex-direction-column'>
                    <label htmlFor='title'>
                        {intl.formatMessage(messages.title)}
                    </label>
                    <input 
                        id='title'
                        type="text"
                        name="title"
                        value={jobData.title}
                        onChange={handleInputChange}
                        placeholder="Nhập tiêu đề công việc"
                        required
                    />
                </div>

                <div className='create-job-container__quill_input mt-20'>
                    <label htmlFor='description'>
                        {intl.formatMessage(messages.description)}
                    </label>
                    <Editor
                        id="description"
                        value={jobData.description}
                        onChange={(content) => handleEditorChange('description', content)}
                        placeholder="Mô tả chi tiết công việc"
                    />
                </div>

                <div className='create-job-container__quill_input mt-20'>
                    <label htmlFor='requirements'>
                        {intl.formatMessage(messages.requirements)}
                    </label>
                    <Editor
                        id="requirements"
                        value={jobData.requirements}
                        onChange={(content) => handleEditorChange('requirements', content)}
                        placeholder="Yêu cầu công việc"
                        required
                    />
                </div>

                <div className='create-job-container__group_3_input mt-20'>
                    <div className='dropdown flex-direction-column'>
                        <label htmlFor="job_type">
                            {intl.formatMessage(messages.job_type)}
                        </label>
                        <select name="job_type" id="job_type" value={jobData.job_type} onChange={handleInputChange} >
                            {JOB_TYPES.value.map((val, index) => {
                                return (
                                    <option value={val}>{JOB_TYPES.human_value[index]}</option>
                                )
                            })}        
                        </select>
                    </div>

                    <div className='dropdown flex-direction-column'>
                        <label htmlFor="job_category">
                            {intl.formatMessage(messages.job_category)}
                        </label>
                        <select name="job_category" id="job_category" value={jobData.job_category} onChange={handleInputChange}>
                            {JOB_CATEGORIES.map((jobCat) => {
                                return (
                                    <optgroup label={jobCat.key}>
                                        {jobCat.value.map((val, index) => {
                                            return (
                                                <option value={val}>{jobCat.human_value[index]}</option>
                                            )
                                        })}
                                    </optgroup>
                                )
                            })}   
                        </select>
                    </div>
                    
                    <div className='date flex-direction-column'>
                        <label htmlFor="deadline">{intl.formatMessage(messages.deadline)}</label>
                        <input 
                            id='deadline'
                            type="date"
                            name='deadline'
                            value={jobData.deadline}
                            onChange={handleInputChange} 
                            required
                        />
                    </div>
                </div>

                <div className='create-job-container__group_2_input mt-20'>
                    <div className='input_item flex-direction-column'>
                        <label htmlFor="location">{intl.formatMessage(messages.location)}</label>
                        <input 
                            type="text"
                            id='location'
                            name='location'
                            value={jobData.location}
                            onChange={handleInputChange}
                            placeholder="Nhập địa chỉ công việc" 
                            required
                        />
                    </div>

                    <div className='input_item flex-direction-column'>
                        <label htmlFor='salary_range'>
                            {intl.formatMessage(messages.salary_range)}
                        </label>
                        <input 
                            type="text"
                            id='salary_range'
                            name='salary_range'
                            value={jobData.salary_range}
                            onChange={handleInputChange}
                            placeholder="Nhập khoảng lương mong muốn"
                            required
                        />
                    </div>
                </div>

                <div className='flex-direction-column mt-20'>
                    <label htmlFor='contact_email'>
                        {intl.formatMessage(messages.contact_email)}
                    </label>
                    <input 
                        id='contact_email'
                        type="email"
                        name="contact_email"
                        value={jobData.contact_email}
                        onChange={handleInputChange}
                        placeholder="Nhập email liên hệ"
                        required
                    />
                </div>

                <button className='mt-20'>
                    {isLoading ? "Đang tạo..." : intl.formatMessage(messages.submit)}
                </button>
            </form>
        </Column>
    );
};

export default withRouter(injectIntl(CreateJobPage));