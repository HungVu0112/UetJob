import { defineMessages, injectIntl, useIntl } from "react-intl";
import FullNameICon from '@/material-icons/400-24px/full_name.svg?react';
import EmailIcon from '@/material-icons/400-24px/email.svg?react';
import PhoneNumberIcon from '@/material-icons/400-24px/phone_number.svg?react';
import { useAppDispatch } from "mastodon/store";
import { connect } from "react-redux";
import { updateJobApplicationStatus } from "mastodon/actions/job_applications";

const messages = defineMessages({
    pending: { id: "application.pending", defaultMessage: "pending" },
    interviewed: { id: "application.interviewed", defaultMessage: "interviewed" },
    accepted: { id: "application.accepted", defaultMessage: "accepted" },
    rejected: { id: "application.rejected", defaultMessage: "rejected" },
    status: { id: "job.status", defaultMessage: "Status" },
})
const ApplicationCard = ({ appData, reFetch }) => {
    const intl = useIntl();
    const dispatch = useAppDispatch();
    const { id, status, applicant_email, applicant_phone_number, applicant_fullname } = appData;
    const statusMes = {
        pending: intl.formatMessage(messages.pending),
        interviewed: intl.formatMessage(messages.interviewed),
        accepted: intl.formatMessage(messages.accepted),
        rejected: intl.formatMessage(messages.rejected),
    }

    let statusChangeList = [];

    if (status === "pending") {
        statusChangeList = [
            {
                statusText: statusMes.interviewed,
                color: "gold",
                action: () => handleAction("interviewed")
            },
            {
                statusText: statusMes.rejected,
                color: "red",
                action: () => handleAction("rejected")
            },
            {
                statusText: statusMes.accepted,
                color: "green",
                action: () => handleAction("accepted")
            }
        ]
    } else if (status === "interviewed") {
        statusChangeList = [
            {
                statusText: statusMes.accepted,
                color: "green",
                action: () => handleAction("accepted")
            },
            {
                statusText: statusMes.rejected,
                color: "red",
                action: () => handleAction("rejected")
            }
        ]
    }

    const handleAction = (stsString) => {
        try {
            const params = {
                status: stsString
            }
            dispatch(updateJobApplicationStatus(id, params));    
            reFetch(n=>n+1);      
        } catch (error) {
            console.error('Error handling application status:', error);
        }
    }

    return (
        <div className="application-card">
            <div className="application-card__info">
                <div className="item">
                    <FullNameICon fill="#6364ff"/>
                    <p>{applicant_fullname}</p>
                </div>
                <div className="item">
                    <EmailIcon fill="#6364ff"/>
                    <p>{applicant_email}</p>
                </div>
                <div className="item">
                    <PhoneNumberIcon fill="#6364ff"/>
                    <p>{applicant_phone_number}</p>
                </div>
                <div className="sts">
                    <h3>{intl.formatMessage(messages.status)}</h3>
                    <p>{statusMes[status]}</p>
                </div>
            </div>
            <div className="application-card__action">
                {statusChangeList.map(sts => {
                    return (
                        <button key={sts.statusText} className={sts.color} onClick={sts.action}>{sts.statusText}</button>
                    )
                })}
            </div>
        </div>
    )
}

export default connect()(injectIntl(ApplicationCard));