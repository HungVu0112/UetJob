import { defineMessages, injectIntl } from "react-intl";

import SaveJobActiveIcon from '@/material-icons/400-24px/bookmark-fill.svg?react'; 
import SaveJobIcon from '@/material-icons/400-24px/bookmark.svg?react';
import CloseJobIcon from '@/material-icons/400-24px/close_job.svg?react';
import JobTypeIcon from '@/material-icons/400-24px/job_type.svg?react';
import LocationIcon from '@/material-icons/400-24px/location.svg?react';
import SalaryIcon from '@/material-icons/400-24px/salary.svg?react';    

interface JobDataType {
    id: string | number,
    title: string,
    organization_name: string,
    organization_logo: string,
    location: string,
    salary_range: string,
    job_type: string,
    job_category: string,
    status: string,
}

interface JobCardProps {
    intl?: any;
    history?: any;
    jobData: JobDataType;
    isStaff: boolean;
    isOrganizationType: boolean;
    isStudent: boolean;
    isSaved?: boolean;
    handleCloseJob?: (jobId: string | number, e: any) => void;
    handleSaveJob?: (jobId: string | number, e: any) => void;
    handleUnsaveJob?: (jobId: string | number, e: any) => void;
}

const messages = defineMessages({
    close_job: { id: 'job.close_job', defaultMessage: 'Close job' },
});

const JobCard: React.FC<JobCardProps> = ({ 
    intl,
    history, 
    jobData, 
    isStaff = false, 
    isSaved = false,
    isOrganizationType=false, 
    isStudent=false, 
    handleCloseJob, 
    handleSaveJob, 
    handleUnsaveJob 
}) => {
    const handleNavigate = () => {
        history.push(`/jobs/${jobData.id}`);
    };

    return (
        <div className='job-card-container' onClick={handleNavigate}>
            <div className='job-card-container__company_logo'>
                <img src={jobData.organization_logo} alt='' />    
            </div>

            <div className='job-card-container__info'>
                <h2 title={jobData.title}>{jobData.title}</h2>
                <p title={jobData.organization_name} className='mt-4'>{jobData.organization_name}</p>

                <div className='job_category'>
                    <p>{jobData.job_category}</p>
                </div>

                <div className='icon_with_text'>
                    <div className='item'>
                        <LocationIcon fill='var(--on-input-color)' width={16} />
                        <p>{jobData.location}</p>
                    </div>
                    <div className='item'>
                        <SalaryIcon fill='var(--on-input-color)' width={16} />
                        <p>{jobData.salary_range}</p>
                    </div>
                    <div className='item'>
                        <JobTypeIcon fill='var(--on-input-color)' width={16} />
                        <p>{jobData.job_type}</p>
                    </div>  
                </div>
            </div>
            
            <div className='job-card-container__interaction'>
                {jobData.status == "open" && isStaff && <CloseJobIcon title={intl?.formatMessage(messages.close_job)} width={20} onClick={(e) => handleCloseJob && handleCloseJob(jobData.id, e)} />}
                {jobData.status == 'closed' && <CloseJobIcon width={20} fill='red' />}
                {isSaved && !isStaff && !isOrganizationType && isStudent && <SaveJobActiveIcon width={20} onClick={(e) => handleUnsaveJob && handleUnsaveJob(jobData.id, e)} fill='#6364ff' />}
                {!isSaved && !isStaff && !isOrganizationType && isStudent && <SaveJobIcon fill='var(--on-input-color)' width={20} onClick={(e) => handleSaveJob && handleSaveJob(jobData.id, e)} /> }
            </div>

        </div>
    );
};

export default JobCard;