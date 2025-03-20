import { useEffect } from "react";

import { defineMessages, useIntl } from "react-intl";

import { Helmet } from 'react-helmet';
import { useHistory } from "react-router";

import { fetchOrganization } from "mastodon/actions/organizations";
import { LoadingIndicator } from "mastodon/components/loading_indicator";
import { useIdentity } from "mastodon/identity_context";
import { useAppDispatch, useAppSelector } from "mastodon/store";




const messages = defineMessages({
    edit: { id: 'organization.edit_button', defaultMessage: 'Edit' },
    add_job: { id: 'organization.add_job', defaultMessage: 'Add Job' },
    join_date: { id: 'organization.join_date', defaultMessage: 'JOINED' },
    jobs: { id: 'organization.jobs', defaultMessage: 'Jobs' },
    members: { id: 'organization.members', defaultMessage: 'Members' },
    follow_text: { id: 'organization.follow_text', defaultMessage: 'Follow' },
});

export const OrganizationHeader: React.FC<{
    org_id: string
}> = ({ org_id }) => {
    const dispatch = useAppDispatch();
    const intl = useIntl();
    const history = useHistory();
    const { organization_id } = useIdentity(); 
    
    useEffect(() => {
        dispatch(fetchOrganization(org_id));
    }, [dispatch, org_id]);

    const organization = useAppSelector(state => 
        state.organizations.get(org_id)
    )?.toJS();

    const handleEdit = () => {
        history.push(`/organization/${org_id}/edit`);
    };

    const handleAddJob = () => { 
        history.push(`/organization/${org_id}/create_job`);
    };
    
    if (!organization) {
        return <LoadingIndicator />;
    } else {
        return (
            <>
                <div className='organization-header'>
                    <Helmet>
                        <title>{organization.nameHtml}</title>
                        <meta name='robots' content='noindex' />
                    </Helmet>
                    <div className='organization-header__avatar'>
                        <div className='organization-header__avatar__tabs'>
                            <div className='organization-header__avatar__container'>
                                <img src={organization.avatar} alt='Company Avatar' />
                            </div>
                            <div className='organization-header__avatar__edit'>
                                <button onClick={
                                    organization_id?.toString() === org_id ? handleEdit : () => {}
                                }>
                                    {organization_id?.toString() === org_id ? intl.formatMessage(messages.edit) : intl.formatMessage(messages.follow_text)}
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className='organization-header__info'>
                        <h1>{organization.nameHtml}</h1>
                        <p>{organization.descriptionHtml}</p>

                        <div className='organization-header__info__date'>
                            <h1>{intl.formatMessage(messages.join_date)}</h1>
                            <p>
                                {intl.formatDate(organization.created_at, {
                                    year: 'numeric',
                                    month: 'short',
                                    day: '2-digit',
                                })}
                        </p>
                        </div>

                        <div className='organization-header__info__amounts'>
                            <div className='organization-header__info__amounts__jobs'>
                                <h3>0</h3>
                                <p>{intl.formatMessage(messages.jobs)}</p>
                            </div>
                            <div className='organization-header__info__amounts__members'>
                                <h3>{organization.members_count}</h3>
                                <p>{intl.formatMessage(messages.members)}</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className='organization-content'>
                    <div className='organization-content__header'>
                        <h1>
                            {intl.formatMessage(messages.jobs)}
                        </h1>
                        {organization_id?.toString() === org_id &&
                            <button
                                title={intl.formatMessage(messages.add_job)}
                                onClick={handleAddJob}
                            >
                                +
                            </button>
                        }
                    </div>
                </div>
            </>
        );
    }

};