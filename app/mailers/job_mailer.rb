# frozen_string_literal: true

class JobMailer < ApplicationMailer
  layout 'job_mailer'

  helper :accounts
  helper :languages
  helper :formatting

  before_action :process_params
  before_action :set_instance

  def format_text(text)
    # logic định dạng văn bản của bạn
    simple_format(text) # Ví dụ đơn giản, chuyển xuống dòng thành <br>
  end

  def new_application_notification(application)
    @application = application
    @job = application.job
    @user = application.user
    @organization = @job.organization

    # Trước tiên lấy User để có email
    @employer_user = User.find_by(organization_id: @organization.id)

    # Sau đó lấy Account tương ứng với User đó
    @employer = @employer_user&.account

    attachments["resume-#{@application.applicant_fullname}.#{@application.resume_file_name.split('.').last}"] = {
      mime_type: @application.resume_content_type,
      content: File.read(@application.resume.path),
    }

    if @employer && @employer_user
      locale_for_account(@employer) do
        mail(
          to: @employer_user.email, # Email vẫn lấy từ User
          subject: default_i18n_subject(job_title: @job.title, instance: @instance),
          reply_to: @application.applicant_email
        )
      end
    else
      # Fallback
      I18n.with_locale(I18n.default_locale) do
        mail(
          to: @employer_user&.email,
          subject: default_i18n_subject(job_title: @job.title, instance: @instance),
          reply_to: @application.applicant_email
        )
      end
    end
  end

  def application_reviewing_notification(application)
    @application = application
    @job = application.job
    @user_fake = application.user
    @user = @user_fake&.account

    locale_for_account(@user) do
      mail(
        to: @user_fake.email,
        subject: default_i18n_subject(job_title: @job.title, instance: @instance)
      )
    end
  end

  def application_interview_notification(application)
    @application = application
    @job = application.job
    @user_fake = application.user
    @user = @user_fake&.account

    locale_for_account(@user) do
      mail(
        to: @user_fake.email,
        subject: default_i18n_subject(job_title: @job.title, instance: @instance)
      )
    end
  end

  def application_accepted_notification(application)
    @application = application
    @job = application.job
    @user_fake = application.user
    @user = @user_fake&.account

    locale_for_account(@user) do
      mail(
        to: @user_fake.email,
        subject: default_i18n_subject(job_title: @job.title, instance: @instance)
      )
    end
  end

  def application_rejected_notification(application)
    @application = application
    @job = application.job
    @user_fake = application.user
    @user = @user_fake&.account

    locale_for_account(@user) do
      mail(
        to: @user_fake.email,
        subject: default_i18n_subject(job_title: @job.title, instance: @instance)
      )
    end
  end

  def job_closed_notification(application)
    @application = application
    @job = application.job
    @user_fake = application.user
    @user = @user_fake&.account
    @organization = @job.organization

    locale_for_account(@user) do
      mail(
        to: @user_fake.email,
        subject: default_i18n_subject(job_title: @job.title, instance: @instance)
      )
    end
  end

  private

  def process_params
    # Có thể sử dụng cho việc xử lý các tham số chung
  end

  def set_instance
    @instance = Rails.configuration.x.local_domain
  end
end
