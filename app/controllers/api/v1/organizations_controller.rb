# frozen_string_literal: true

class Api::V1::OrganizationsController < Api::BaseController
  include Authorization

  before_action -> { authorize_if_got_token! :read, :'read:organizations' }, except: [:create, :update]
  before_action -> { doorkeeper_authorize! :write, :'write:organizations' }, only: [:create, :update, :destroy]
  before_action :require_user!, except: [:index, :show]
  before_action :set_organization, only: [:show, :update, :destroy]
  before_action :check_organization_ownership, only: [:update, :destroy]

  def index
    @organizations = Organization.page(params[:page]).per(20)
    render json: @organizations, each_serializer: REST::OrganizationSerializer
  end

  def show
    render json: @organization, serializer: REST::OrganizationSerializer
  end

  def create
    # Kiểm tra xem người dùng có phải là organization type không
    unless current_user.organization?
      render json: { error: I18n.t('organizations.errors.not_organization_type') }, status: 403
      return
    end

    # Kiểm tra xem người dùng đã thuộc về tổ chức nào chưa
    if current_user.organization.present?
      render json: { error: I18n.t('organizations.errors.already_in_organization') }, status: 422
      return
    end

    @organization = Organization.new(organization_params)
    @organization.email_domain = current_user.email_domain

    if @organization.save
      # Kết nối người dùng với tổ chức mới
      current_user.update(organization: @organization)
      render json: @organization, serializer: REST::OrganizationSerializer
    else
      render json: { error: @organization.errors.full_messages.join(', ') }, status: 422
    end
  end

  def update
    if organization_params[:avatar].present?
      @organization.assign_attributes(organization_params)
      @organization.save_with_optional_media!
      render json: @organization, serializer: REST::OrganizationSerializer
    elsif @organization.update(organization_params)
      render json: @organization, serializer: REST::OrganizationSerializer
    else
      render json: { error: @organization.errors.full_messages.join(', ') }, status: 422
    end
  end

  def destroy
    @organization = Organization.find(params[:id])

    unless current_user.organization? && current_user.organization_id == @organization.id
      render json: { error: I18n.t('organizations.errors.not_authorized') }, status: 403
      return
    end

    # Remove organization association from all users
    @organization.users.update_all(organization_id: nil)

    if @organization.destroy
      render json: { success: true }, status: 200
    else
      render json: { error: @organization.errors.full_messages.join(', ') }, status: 422
    end
  end

  def members
    @organization = Organization.find(params[:id])
    @users = @organization.users.page(params[:page]).per(20)

    render json: @users, each_serializer: REST::AccountSerializer
  end

  private

  def set_organization
    @organization = Organization.find(params[:id])
  end

  def organization_params
    params.permit(:name, :description, :avatar)
  end

  def check_organization_ownership
    render json: { error: I18n.t('organizations.errors.not_authorized') }, status: 403 unless current_user.organization? && current_user.organization_id == @organization.id
  end
end
