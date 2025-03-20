# frozen_string_literal: true

class Api::V1::JobsController < Api::BaseController
  include Authorization

  before_action -> { authorize_if_got_token! :read, :'read:jobs' }, except: [:create, :update, :destroy, :save_job, :unsave_job, :created_jobs]
  before_action -> { doorkeeper_authorize! :write, :'write:jobs' }, only: [:create, :update, :destroy, :save_job, :unsave_job]
  before_action :require_user!, except: [:index, :show]
  before_action :set_job, only: [:show, :update, :destroy, :save_job, :unsave_job]
  before_action :check_job_ownership, only: [:update, :destroy]
  before_action :check_can_post_job, only: [:create]
  before_action :check_can_save_job, only: [:save_job, :unsave_job]

  def index
    @jobs = filtered_jobs.page(params[:page]).per(15)
    render json: @jobs, each_serializer: REST::JobSerializer
  end

  def show
    @job.increment_views! unless current_user&.id == @job.user_id
    render json: @job, serializer: REST::JobSerializer::Detailed
  end

  def create
    @job = Job.new(job_params)
    @job.user = current_user
    @job.organization = current_user.organization

    if @job.save
      render json: @job, serializer: REST::JobSerializer::Detailed, status: 201
    else
      render json: { error: @job.errors.full_messages.join(', ') }, status: 422
    end
  end

  def update
    if @job.update(job_params)
      render json: @job, serializer: REST::JobSerializer::Detailed
    else
      render json: { error: @job.errors.full_messages.join(', ') }, status: 422
    end
  end

  def destroy
    if @job.destroy
      render json: { success: true }, status: 200
    else
      render json: { error: @job.errors.full_messages.join(', ') }, status: 422
    end
  end

  def my_jobs
    @jobs = Job.by_organization(current_user.organization_id).active.recent.page(params[:page]).per(15)
    render json: @jobs, each_serializer: REST::JobSerializer
  end

  def saved_jobs
    return render json: [], status: 200 if current_user.saved_jobs.blank?

    job_ids = current_user.saved_jobs
    @jobs = Job.where(id: job_ids).active.recent.page(params[:page]).per(15)
    render json: @jobs, each_serializer: REST::JobSerializer
  end

  def save_job
    current_user.saved_jobs ||= []
    job_id_str = @job.id.to_s

    if current_user.saved_jobs.include?(job_id_str)
      render json: {
        message: I18n.t('jobs.already_saved'),
      }, status: 200
    else
      current_user.saved_jobs.push(job_id_str)

      if current_user.save
        render json: {
          success: true,
          message: I18n.t('jobs.saved_successfully'),
        }, status: 200
      else
        render json: {
          error: current_user.errors.full_messages.join(', '),
        }, status: 422
      end
    end
  end

  def unsave_job
    return render json: { error: I18n.t('jobs.no_saved_jobs') }, status: 400 if current_user.saved_jobs.nil?

    job_id_str = @job.id.to_s

    if current_user.saved_jobs.include?(job_id_str)
      current_user.saved_jobs.delete(job_id_str)

      if current_user.save
        render json: {
          success: true,
          message: I18n.t('jobs.unsaved_successfully'),
        }, status: 200
      else
        render json: {
          error: current_user.errors.full_messages.join(', '),
        }, status: 422
      end
    else
      render json: {
        message: I18n.t('jobs.not_in_saved_jobs'),
      }, status: 200
    end
  end

  def created_jobs
    @jobs = Job.where(user_id: current_user.id)
               .includes(:organization)
               .recent
               .page(params[:page])
               .per(15)

    render json: @jobs, each_serializer: REST::JobSerializer
  end

  private

  def set_job
    @job = Job.find(params[:id])
  end

  def job_params
    params.permit(:title, :description, :requirements, :location,
                  :salary_range, :deadline, :status, :job_type, :contact_email, :job_category)
  end

  def filtered_jobs
    jobs = Job.active.includes(:organization, :user)

    # Apply filters
    jobs = jobs.by_organization(params[:organization_id]) if params[:organization_id].present?
    jobs = jobs.by_job_type(params[:job_type]) if params[:job_type].present?
    jobs = jobs.by_job_category(params[:job_category]) if params[:job_category].present?
    jobs = jobs.by_query(params[:q]) if params[:q].present?

    # Sort options
    case params[:sort]
    when 'newest'
      jobs.order(created_at: :desc)
    when 'oldest'
      jobs.order(created_at: :asc)
    when 'deadline'
      jobs.order('deadline IS NULL, deadline ASC')
    else
      jobs.order(created_at: :desc)
    end
  end

  def check_job_ownership
    render json: { error: I18n.t('jobs.errors.not_authorized') }, status: 403 unless current_user.organization_id == @job.organization_id
  end

  def check_can_post_job
    render json: { error: I18n.t('jobs.errors.cannot_post') }, status: 403 unless current_user.can_post_job?
  end

  def check_can_save_job
    render json: { error: I18n.t('jobs.errors.cannot_save') }, status: 403 unless current_user.can_seek_job?
  end
end
