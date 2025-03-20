import { useAppDispatch } from "mastodon/store";
import { useCallback, useState } from "react";
import { defineMessages, injectIntl, useIntl } from "react-intl";
import { connect } from "react-redux";
import UploadIcon from "@/material-icons/400-24px/uploadIcon.svg?react";
import PdfIcon from "@/material-icons/400-24px/pdfIcon.svg?react";
import CloseIcon from '@/material-icons/400-24px/close-fill.svg?react';
import { createJobApplication } from "mastodon/actions/job_applications";
import { showAlert, showAlertForError } from 'mastodon/actions/alerts';

const messages = defineMessages({
    phone_number: { id: "application.phone_number", defaultMessage: "Phone Number" },
    full_name: { id: "application.full_name", defaultMessage: "Full Name" },
    submit: { id: "application.submit", defaultMessage: "Submit" },
    cancel: { id: "application.cancel", defaultMessage: "Cancel" },
    file_type: { id: "application.restrict_file_type", defaultMessage: "Only accept file type .pdf, .doc, .docx, application/msword" },
    submit_success: { id: "application.success_submit", defaultMessage: "Successfully applied" },
    submit_error: { id: "application.error_submit", defaultMessage: "Error applying" },
})

const ApplicationModal = ({ jobId, setOpenModal }) => {
    const intl = useIntl();
    const dispatch = useAppDispatch();

    const [appData, setAppData] = useState({
        resume: undefined,
        cover_letter: '',
        applicant_fullname: '',
        applicant_phone_number: '',
        applicant_email: '',
    });
    const [previewFile, setPreviewFile] = useState();

    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setAppData(prev => ({
           ...prev,
            [id]: value
        }));
    }

    const handleResumeChange = useCallback((e) => {
        const file = e.target.files[0];
        if (!file) return;
    
        // Revoke previous blob URL if exists
        if (previewFile?.startsWith('blob:')) {
            URL.revokeObjectURL(previewFile);  // Fixed variable name
        }
    
        const newURL = URL.createObjectURL(file);
        setPreviewFile(newURL);
        setAppData(prev => ({
            ...prev,
            'resume': file
        }))
    }, [previewFile])

    const handleClearResume = (e) => {
        e.stopPropagation();

        if (previewFile?.startsWith('blob:')) {
            URL.revokeObjectURL(previewFile);
        }
        setPreviewFile(undefined);
        setAppData(prev => ({
            ...prev,
            'resume': undefined
        }));
    }

    const handleSubmit = (e) => {
        e.preventDefault();

        if (appData.resume) {
            dispatch(createJobApplication(jobId, appData)).then(res => {
                if (res) {
                    dispatch(showAlert({
                        message: intl.formatMessage(messages.submit_success)
                    }));
                    setOpenModal(false);
                }
            }).catch(err => {
                dispatch(showAlertForError({
                    error: intl.formatMessage(messages.submit_error) + err
                }));
            });
        }
    }

    return (
        <div className="application-modal">
            <form className="application-modal__box">
                <div className="resume">
                    <h3>Resume</h3>
                    {previewFile ? (
                        <div className="pdf-box">
                            <div className="box">
                                <div onClick={handleClearResume}>
                                    <CloseIcon className="close-icon" fill="var(--on-input-color)" width={14}/>
                                </div>
                                <PdfIcon />
                            </div>
                            <p>{appData.resume?.name}</p>
                        </div>
                    ) : (
                        <label htmlFor="resume">
                            <input 
                                type="file" 
                                hidden 
                                id="resume"
                                accept=".pdf, .doc,.docx,.xml,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                onChange={handleResumeChange}
                                required
                            />
                            <div className="upload-box">
                                <UploadIcon />
                                <p>{intl.formatMessage(messages.file_type)}</p>
                            </div>
                        </label>
                    )}
                </div>
                <div className="cover-letter">
                    <label htmlFor="cover_letter">Cover Letter</label>
                    <textarea required onChange={handleInputChange} id="cover_letter" value={appData.cover_letter}></textarea>
                </div>
                <div className="applicant-info">
                    <div className="group-2-items">
                        <div className="item">
                            <label htmlFor="applicant_fullname">{intl.formatMessage(messages.full_name)}</label>
                            <input required onChange={handleInputChange} type="text" id="applicant_fullname" value={appData.applicant_fullname}/>
                        </div>
                        <div className="item">
                            <label htmlFor="applicant_phone_number">{intl.formatMessage(messages.phone_number)}</label>
                            <input 
                                onChange={(e) => {
                                    const numbersOnly = e.target.value.replace(/[^0-9]/g, '');
                                    setAppData(prev => ({
                                        ...prev,
                                        applicant_phone_number: numbersOnly
                                    }));
                                }} 
                                type="text" 
                                required
                                id="applicant_phone_number" 
                                value={appData.applicant_phone_number}
                            />
                        </div>
                    </div>
                    <div className="email">
                        <label htmlFor="applicant_email">Email</label>
                        <input required onChange={handleInputChange} type="email" id="applicant_email" value={appData.applicant_email}/>
                    </div>
                </div>

                <div className="form-action">
                    <button onClick={() => setOpenModal(false)}>
                        {intl.formatMessage(messages.cancel)}
                    </button>
                    <button type="submit" onClick={handleSubmit}>
                        {intl.formatMessage(messages.submit)}
                    </button>
                </div>
            </form>
        </div>
    )
}

export default connect()(injectIntl(ApplicationModal));