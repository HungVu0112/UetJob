# frozen_string_literal: true

class ApplicationMailer < ActionMailer::Base
  layout 'mailer'

  helper :application
  helper :instance
  helper :formatting

  after_action :set_autoreply_headers!

  protected

  def locale_for_account(account, &block)
    I18n.with_locale(account.user_locale || I18n.default_locale, &block)
  end

  def set_autoreply_headers!
    headers(
      'Auto-Submitted' => 'auto-generated',
      'Precedence' => 'list',
      'X-Auto-Response-Suppress' => 'All'
    )
  end

  def review_job_application_url(job_id:, id:)
    host = ActionMailer::Base.default_url_options[:host]
    protocol = ActionMailer::Base.default_url_options[:protocol] || 'http'
    port = ActionMailer::Base.default_url_options[:port]

    url = "#{protocol}://#{host}"
    url += ":#{port}" if port.present?
    url += "/web/jobs/#{job_id}/applications/#{id}"

    url
  end

  def view_job_application_url(job_id:, id:)
    host = ActionMailer::Base.default_url_options[:host]
    protocol = ActionMailer::Base.default_url_options[:protocol] || 'http'
    port = ActionMailer::Base.default_url_options[:port]

    url = "#{protocol}://#{host}"
    url += ":#{port}" if port.present?
    url += "/web/applications/#{id}"

    url
  end

  def jobs_url
    host = ActionMailer::Base.default_url_options[:host]
    protocol = ActionMailer::Base.default_url_options[:protocol] || 'http'
    port = ActionMailer::Base.default_url_options[:port]

    url = "#{protocol}://#{host}"
    url += ":#{port}" if port.present?
    url += '/web/jobs'

    url
  end

  def web_job_application_url(job, application)
    host = ActionMailer::Base.default_url_options[:host]
    protocol = ActionMailer::Base.default_url_options[:protocol] || 'http'
    port = ActionMailer::Base.default_url_options[:port]

    url = "#{protocol}://#{host}"
    url += ":#{port}" if port.present?
    url += "/web/jobs/#{job.id}/applications/#{application.id}"

    url
  end
end
