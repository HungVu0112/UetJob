import { useState, useEffect, useCallback } from 'react';
import { connect } from "react-redux";
import { withRouter } from "react-router";
import { injectIntl } from "react-intl";
import PropTypes from "prop-types";

import { fetchOrganization, updateOrganization } from "mastodon/actions/organizations";
import { Column } from 'mastodon/components/column';
import { ColumnHeader } from 'mastodon/components/column_header';
import { Icon } from 'mastodon/components/icon';
import { showAlert, showAlertForError } from 'mastodon/actions/alerts';

import OrganizationIcon from '@/material-icons/400-24px/organizations-fill.svg';
import EditIcon from '@/material-icons/400-24px/edit.svg?react';
import { ColumnBackButton } from 'mastodon/components/column_back_button';

const messages = {
    heading: { id: 'organization.edit_button', defaultMessage: 'Edit organization'},
    form_name: { id: 'create_organization_form.name', defaultMessage: 'Name' },
    form_description: { id: 'create_organization_form.description', defaultMessage: 'Description' },
    form_save: { id: 'organization.save_button', defaultMessage: 'Save' },
    form_save_success: { id: 'organization.saved_success', defaultMessage: 'Organization updated successfully' },
};

const OrganizationEdit = ({ 
    match, 
    organization, 
    dispatch, 
    intl 
}) => {
    const [name, setName] = useState(organization?.nameHtml ?? '');
    const [description, setDescription] = useState(organization?.descriptionHtml ?? '');
    const [avatarPreviewURL, setAvatarPreviewURL] = useState(organization?.avatar ?? '');
    const [newAvatar, setNewAvatar] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(false);

    // Fetch organization on mount if not exists
    useEffect(() => {
        const { id } = match.params;
        if (!organization) {
            setIsFetching(true);
            dispatch(fetchOrganization(id))
                .finally(() => setIsFetching(false));
        }
    }, [match.params.id, organization, dispatch]);

    // Update state when organization changes
    useEffect(() => {
        if (organization && !newAvatar) {
            setName(organization.nameHtml ?? name);
            setDescription(organization.descriptionHtml ?? description);
            setAvatarPreviewURL(organization.avatar ?? avatarPreviewURL);
        }
    }, [organization, newAvatar]);

    // Clean up blob URL
    useEffect(() => {
        return () => {
            if (avatarPreviewURL.startsWith('blob:')) {
                URL.revokeObjectURL(avatarPreviewURL);
            }
        };
    }, [avatarPreviewURL]);

    const handleNameChange = useCallback((e) => {
        setName(e.target.value);
    }, []);

    const handleDescriptionChange = useCallback((e) => {
        setDescription(e.target.value);
    }, []);

    const handleAvatarChange = useCallback((e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Revoke previous blob URL if exists
        if (avatarPreviewURL.startsWith('blob:')) {
            URL.revokeObjectURL(avatarPreviewURL);
        }

        const newURL = URL.createObjectURL(file);
        setAvatarPreviewURL(newURL);
        setNewAvatar(file);
    }, [avatarPreviewURL]);

    const handleSubmit = useCallback((e) => {
        e.preventDefault();

        const { id } = match.params;
        const formData = new FormData();

        // Add name and description to form data
        formData.append('name', name);
        formData.append('description', description);

        // Add avatar file if a new one was selected
        if (newAvatar) {
            formData.append('avatar', newAvatar);
        }

        // Set loading state
        setIsLoading(true);

        // Dispatch the update organization action
        dispatch(updateOrganization(id, formData))
            .then(updatedOrganization => {
                dispatch(showAlert({
                    message: intl.formatMessage(messages.form_save_success),
                }));
            })
            .catch(error => {
                dispatch(showAlertForError({
                    error: error,
                }));
            })
            .finally(() => {
                // Always remove loading state
                setIsLoading(false);
            });
    }, [dispatch, match.params.id, name, description, newAvatar, intl]);

    // Render null if no organization
    if (!organization) {
        return null;
    }

    return (
        <Column
            label={intl.formatMessage(messages.heading)}
        >
            <ColumnBackButton />
            <ColumnHeader 
                title={intl.formatMessage(messages.heading)}
                icon='building'
                iconComponent={OrganizationIcon}
            />
            <div className="organization-edit">
                <div className="organization-edit__heading">
                    <label htmlFor="avatar-holder" className="organization-edit__avatar_holder">
                        <input 
                            type="file"
                            accept="image/*" 
                            hidden
                            id="avatar-holder"
                            onChange={handleAvatarChange}
                        />

                        <img src={avatarPreviewURL} alt={organization.name} />

                        <Icon 
                            id=""
                            icon={EditIcon}
                        />
                    </label>
                </div>

                <form className="organization-edit__form" onSubmit={handleSubmit}>
                    <div className="organization-edit__form-group">
                        <label htmlFor="name">{intl.formatMessage(messages.form_name)}</label>
                        <input 
                            type="text" 
                            id="name" 
                            value={name}
                            onChange={handleNameChange}
                            required
                            disabled={isFetching || isLoading}
                        />
                    </div>

                    <div className="organization-edit__form-group">
                        <label htmlFor="description">{intl.formatMessage(messages.form_description)}</label>
                        <textarea 
                            id="description"
                            value={description}
                            onChange={handleDescriptionChange}
                            required
                            disabled={isFetching || isLoading}
                        />
                    </div>

                    <button 
                        type='submit' 
                        disabled={isFetching || isLoading}
                    >
                        {isLoading ? 'Saving...' : intl.formatMessage(messages.form_save)}
                    </button>
                </form>
            </div>
        </Column>
    );
};

OrganizationEdit.propTypes = {
    match: PropTypes.object.isRequired,
    organization: PropTypes.object,
    dispatch: PropTypes.func.isRequired,
    intl: PropTypes.object.isRequired,
};

const mapStateToProps = (state, ownProps) => {
    const { id } = ownProps.match.params;
    return {
        organization: state.organizations.get(id)?.toJS()
    };
};

export default withRouter(connect(mapStateToProps)(injectIntl(OrganizationEdit)));