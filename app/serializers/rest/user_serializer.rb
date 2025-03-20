# frozen_string_literal: true

class REST::UserSerializer < ActiveModel::Serializer
  attributes :id, :email, :user_type, :saved_jobs
end
