# frozen_string_literal: true

class REST::OrganizationSerializer < ActiveModel::Serializer
  include RoutingHelper
  include FormattingHelper

  attributes :id, :name, :description, :email_domain, :created_at, :updated_at,
             :avatar, :avatar_static, :members_count

  has_many :emojis, serializer: REST::CustomEmojiSerializer

  def id
    object.id.to_s
  end

  def avatar
    full_asset_url(object.avatar_original_url)
  end

  def avatar_static
    full_asset_url(object.avatar_static_url)
  end

  def members_count
    object.users.count
  end

  def created_at
    object.created_at.iso8601
  end

  def updated_at
    object.updated_at.iso8601
  end

  def description
    object.description.presence || ''
  end
end
