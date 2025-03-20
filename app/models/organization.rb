# frozen_string_literal: true

# == Schema Information
#
# Table name: organizations
#
#  id                  :bigint(8)        not null, primary key
#  avatar_content_type :string
#  avatar_file_name    :string
#  avatar_file_size    :integer
#  avatar_updated_at   :datetime
#  description         :text
#  email_domain        :string           not null
#  name                :string           not null
#  created_at          :datetime         not null
#  updated_at          :datetime         not null
#
#  id           :bigint(8)        not null, primary key
#  name         :character varying not null
#  description  :text
#  email_domain :character varying not null
#  created_at   :timestamp(6)     not null
#  updated_at   :timestamp(6)     not null
#  avatar_file_name              :string
#  avatar_content_type           :string
#  avatar_file_size              :integer
#  avatar_updated_at             :datetime
#  avatar_remote_url             :string

class Organization < ApplicationRecord
  include Organization::Avatar
  include DomainNormalizable

  NAME_LENGTH_LIMIT = 50
  DESCRIPTION_LENGTH_LIMIT = 500

  # Validations
  validates :name, presence: true, length: { maximum: NAME_LENGTH_LIMIT }
  validates :email_domain, presence: true, uniqueness: true
  validates :description, length: { maximum: DESCRIPTION_LENGTH_LIMIT }, if: -> { description.present? }

  # Associations
  has_many :users, dependent: :nullify

  # Normalizations
  normalizes :name, with: ->(name) { name.squish }
  normalizes :email_domain, with: ->(domain) { domain.downcase }

  # Scopes
  scope :alphabetic, -> { order(name: :asc) }
  scope :recent, -> { order(created_at: :desc) }
  scope :with_email_domain, ->(value) { where(arel_table[:email_domain].lower.eq(value.to_s.downcase)) }

  # Callbacks
  before_validation :normalize_domain
  after_commit :update_users_organization, on: :create

  def self.find_or_create_from_email_domain(email_domain, user)
    organization = find_by(email_domain: email_domain)

    unless organization
      organization_name = email_domain.split('.').first.capitalize
      organization = create(
        name: organization_name,
        email_domain: email_domain,
        description: "Tổ chức #{organization_name}"
      )

      # Connect user to new organization
      user.update(organization: organization)
    end

    organization
  end

  def save_with_optional_media!
    save!
  rescue ActiveRecord::RecordInvalid => e
    errors = e.record.errors.errors
    errors.each do |err|
      self.avatar = nil if err.attribute == :avatar
    end

    save!
  end

  def emojis
    @emojis ||= CustomEmoji.from_text(emojifiable_text, nil)
  end

  def to_param
    id.to_s
  end

  def to_log_human_identifier
    name
  end

  private

  def normalize_domain
    self.email_domain = email_domain.downcase if email_domain.present?
  end

  def update_users_organization
    User.where('email LIKE ?', "%@#{email_domain}").find_each do |user|
      user.update(organization: self)
    end
  end

  def emojifiable_text
    [name, description].join(' ')
  end
end
