# frozen_string_literal: true

class REST::JobApplicationSerializer < ActiveModel::Serializer
  attributes :id, :status, :created_at, :updated_at, :applicant_email, :applicant_phone_number, :applicant_fullname

  belongs_to :user, serializer: REST::UserSerializer
  belongs_to :job, serializer: REST::JobSerializer

  class Detailed < REST::JobApplicationSerializer
    attributes :cover_letter, :resume_url, :applicant_email, :applicant_phone_number, :applicant_fullname

    def resume_url
      object.resume.url if object.resume.present?
    end
  end
end
