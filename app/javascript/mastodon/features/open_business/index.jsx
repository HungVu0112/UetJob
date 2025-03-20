import { Helmet } from 'react-helmet';
import { defineMessages, injectIntl } from 'react-intl';
import { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { createOrganization } from 'mastodon/actions/organizations';
import { showAlert, showAlertForError } from 'mastodon/actions/alerts';

const messages = defineMessages({
    heading: { id: 'column.open_business', defaultMessage: 'Create organization' },
    empty: { id: 'empty_column.open_business', defaultMessage: 'Look like you have not created any organization yet. Lets create a new one!' },
    form_name: { id: 'create_organization_form.name', defaultMessage: 'Name' },
    form_description: { id: 'create_organization_form.description', defaultMessage: 'Description' },
    form_button: { id: 'create_organization_form.button_text', defaultMessage: 'Create' },
    form_fetching: { id: 'create_organization_form.fetching', defaultMessage: 'Creating...' },
    success_message: { id: 'create_organization_form.success_message', defaultMessage: 'Organization created successfully!' },
    error_message: { id: 'create_organization_form.error_message', defaultMessage: 'Error creating organization' },
})

class OpenBusiness extends PureComponent {
    static propTypes = {
        dispatch: PropTypes.func.isRequired,
        intl: PropTypes.object.isRequired,
    }

    state = {
        name: '',
        description: '',
        isLoading: false,
        error: null,
        successMessage: null,
    }

    handleInputChange = (e) => {
        const { id, value } = e.target;
        this.setState({ [id]: value });
    }

    handleSubmit = async (e) => {
        e.preventDefault();

        const { dispatch, intl } = this.props;
        const { name, description } = this.state;

        if (!name.trim()) {
            this.setState({ 
                error: 'Organization name is required',
                successMessage: null 
            });
            return;
        }

        this.setState({ 
            isLoading: true, 
            error: null,
            successMessage: null 
        });


        try {
            // Gọi action creator createOrganization
            const response = await dispatch(createOrganization({
                name,
                description
            }));

            dispatch(showAlert({
                message: intl.formatMessage(messages.success_message),
            }));

            // Redirect to organization page
            setTimeout(() => {
                window.location.replace(`/organization/${response.id}`)
            }, 3000)
            
        } catch (error) {
            this.setState({
                isLoading: false,
                error: intl.formatMessage(messages.error_message)
            });
            dispatch(showAlertForError({
                error: intl.formatMessage(messages.error_message),
            }));
            console.error('Organization Creation Error:', error);
        }
    }

    render() {
        const { intl } = this.props;
        const { name, description, isLoading, error, successMessage } = this.state;

        

        return (
            <div className='open-business'>
                <Helmet>
                    <title>{intl.formatMessage(messages.heading)}</title>
                    <meta name='robots' content='noindex' />
                </Helmet>

                <div className='heading'>
                    <h1>{intl.formatMessage(messages.empty)}</h1>
                </div>

                <form onSubmit={this.handleSubmit} className='create-organization-form'>
                    <div className='form-group'>
                        <label htmlFor="name">{intl.formatMessage(messages.form_name)}</label>
                        <input 
                            type="text" 
                            id="name" 
                            value={name}
                            onChange={this.handleInputChange}
                            disabled={isLoading} 
                            required
                        />
                    </div>

                    <div className='form-group'>
                        <label htmlFor="description">{intl.formatMessage(messages.form_description)}</label>
                        <textarea 
                            id="description"
                            value={description}
                            onChange={this.handleInputChange}
                            disabled={isLoading} 
                            required
                        />
                    </div>

                    <button type="submit" disabled={isLoading}>
                        {isLoading ? intl.formatMessage(messages.form_fetching) : intl.formatMessage(messages.form_button)}
                    </button>
                </form>
            </div>
        )
    }
}

export default connect()(injectIntl(OpenBusiness));