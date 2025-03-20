# frozen_string_literal: true

class Api::V1::JobApplicationsController < Api::BaseController
  include Authorization

  before_action -> { authorize_if_got_token! :read, :'read:applications' }, except: [:create, :update, :withdraw, :check_applied, :applied_jobs]
  before_action -> { doorkeeper_authorize! :write, :'write:applications' }, only: [:create, :update, :withdraw, :destroy]
  before_action :require_user!
  before_action :set_job, only: [:create, :index_by_job]
  before_action :set_application, only: [:show, :update, :withdraw, :destroy]
  before_action :check_can_apply, only: [:create]
  before_action :check_application_ownership, only: [:withdraw]
  before_action :check_job_ownership, only: [:index_by_job]
  before_action :check_job_ownership_with_application, only: [:update]

  def index
    @applications = if current_user.organization?
                      # Organization users see applications to their jobs
                      JobApplication.joins(:job)
                                    .where(jobs: { organization_id: current_user.organization_id })
                                    .includes(:user, :job)
                                    .recent
                                    .page(params[:page])
                                    .per(15)
                    else
                      # Regular users see their own applications
                      JobApplication.by_user(current_user.id)
                                    .includes(:job)
                                    .recent
                                    .page(params[:page])
                                    .per(15)
                    end

    render json: @applications, each_serializer: REST::JobApplicationSerializer
  end

  def show
    if owner_or_job_poster?
      render json: @application, serializer: REST::JobApplicationSerializer::Detailed
    else
      render json: { error: I18n.t('job_applications.errors.not_authorized') }, status: 403
    end
  end

  def create
    @application = JobApplication.new(application_params)
    @application.user = current_user
    @application.job = @job

    if @application.save
      render json: @application, serializer: REST::JobApplicationSerializer::Detailed, status: 201
    else
      render json: { error: @application.errors.full_messages.join(', ') }, status: 422
    end
  end

  def update
    # Only job posters can update application status
    unless current_user.organization_id == @application.job.organization_id
      render json: { error: I18n.t('job_applications.errors.not_authorized') }, status: 403
      return
    end

    if @application.update(status_params)
      render json: @application, serializer: REST::JobApplicationSerializer::Detailed
    else
      render json: { error: @application.errors.full_messages.join(', ') }, status: 422
    end
  end

  def withdraw
    if @application.withdraw!
      render json: @application, serializer: REST::JobApplicationSerializer::Detailed
    else
      render json: { error: @application.errors.full_messages.join(', ') }, status: 422
    end
  end

  def destroy
    # Kiểm tra xem người dùng có phải là chủ sở hữu của công việc hay không
    # unless current_user.organization_id == @application.job.organization_id
    #   render json: { error: I18n.t('job_applications.errors.not_authorized') }, status: :forbidden
    #   return
    # end

    if @application.destroy
      render json: { success: true }, status: 200
    else
      render json: { error: @application.errors.full_messages.join(', ') }, status: 422
    end
  end

  # Thêm một action mới trong JobApplicationsController
  def check_applied
    @job = Job.find(params[:job_id])
    already_applied = JobApplication.exists?(user_id: current_user.id, job_id: @job.id)

    render json: {
      applied: already_applied,
      application_status: already_applied ? JobApplication.find_by(user_id: current_user.id, job_id: @job.id).status : nil,
    }
  end

  def applied_jobs
    @applications = JobApplication.by_user(current_user.id)
                                  .includes(:job)
                                  .recent
                                  .page(params[:page])
                                  .per(15)

    @jobs = @applications.map(&:job).uniq

    render json: @jobs, each_serializer: REST::JobSerializer
  end

  def index_by_job
    @applications = @job.job_applications
                        .includes(:user)
                        .recent
                        .page(params[:page])
                        .per(15)

    render json: @applications, each_serializer: REST::JobApplicationSerializer
  end

  private

  def set_job
    @job = Job.find(params[:job_id])
  end

  def set_application
    @application = JobApplication.find(params[:id])
  end

  def application_params
    params.permit(:cover_letter, :resume, :applicant_email, :applicant_phone_number, :applicant_fullname)
  end

  def status_params
    params.permit(:status, :notes)
  end

  def check_can_apply
    render json: { error: I18n.t('job_applications.errors.cannot_apply') }, status: 403 unless current_user.can_apply_job?
  end

  def check_application_ownership
    render json: { error: I18n.t('job_applications.errors.not_authorized') }, status: 403 unless current_user.id == @application.user_id
  end

  def check_job_ownership
    render json: { error: I18n.t('job_applications.errors.not_authorized') }, status: 403 unless current_user.organization_id == @job.organization_id
  end

  def check_job_ownership_with_application
    render json: { error: I18n.t('job_applications.errors.not_authorized') }, status: 403 unless current_user.organization_id == @application.job.organization_id
  end

  def owner_or_job_poster?
    current_user.id == @application.user_id ||
      (current_user.organization? && current_user.organization_id == @application.job.organization_id)
  end
end
