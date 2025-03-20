# frozen_string_literal: true

class REST::JobSerializer < ActiveModel::Serializer
  attributes :id, :title, :description, :requirements, :location,
             :salary_range, :deadline, :status, :job_type, :job_category,
             :created_at, :views_count, :application_count

  belongs_to :organization, serializer: REST::OrganizationSerializer
  belongs_to :user, serializer: REST::UserSerializer

  def saved
    object.saved_by?(current_user)
  end

  class Detailed < REST::JobSerializer
    attributes :contact_email
  end
end
