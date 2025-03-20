# frozen_string_literal: true

# == Schema Information
#
# Table name: job_applications
#
#  id                     :bigint(8)        not null, primary key
#  applicant_email        :string           not null
#  applicant_fullname     :string           not null
#  applicant_phone_number :string           not null
#  cover_letter           :text
#  resume_content_type    :string           not null
#  resume_file_name       :string           not null
#  resume_file_size       :bigint(8)        not null
#  resume_updated_at      :datetime         not null
#  status                 :string           default("pending"), not null
#  created_at             :datetime         not null
#  updated_at             :datetime         not null
#  job_id                 :bigint(8)        not null
#  user_id                :bigint(8)        not null
#
#  id           :bigint(8)        not null, primary key
#  user_id      :bigint(8)        not null
#  job_id       :bigint(8)        not null
#  status       :string           default("pending"), not null
#  cover_letter :text
#  resume_file_name    :string
#  resume_content_type :string
#  resume_file_size    :integer
#  resume_updated_at   :datetime
#  created_at   :datetime         not null
#  updated_at   :datetime         not null
#  applicant_email :string
#  applicant_phone_number :string
#  applicant_fullname :string

class JobApplication < ApplicationRecord
  include Paginable

  # Constants
  STATUS_TYPES = %w(pending reviewing interviewed accepted rejected withdrawn).freeze
  COVER_LETTER_MAX_LENGTH = 5000

  # Validations
  validates :status, inclusion: { in: STATUS_TYPES }
  validates :cover_letter, length: { maximum: COVER_LETTER_MAX_LENGTH }, allow_blank: true
  validate :validate_user_can_apply
  validate :validate_job_is_open
  validate :validate_one_application_per_job_per_user, on: :create

  # Associations
  belongs_to :user
  belongs_to :job, counter_cache: :application_count
  has_attached_file :resume,
                    storage: :filesystem,
                    path: ':rails_root/public/system/job_applications/:id/:style/:filename',
                    url: '/system/job_applications/:id/:style/:filename'

  validates_attachment_content_type :resume,
                                    content_type: ['application/pdf', 'application/msword',
                                                   'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
  validates_attachment_size :resume, less_than: 5.megabytes

  # Scopes
  scope :pending, -> { where(status: 'pending') }
  scope :reviewing, -> { where(status: 'reviewing') }
  scope :interviewed, -> { where(status: 'interviewed') }
  scope :accepted, -> { where(status: 'accepted') }
  scope :rejected, -> { where(status: 'rejected') }
  scope :withdrawn, -> { where(status: 'withdrawn') }
  scope :active, -> { where(status: %w(pending reviewing interviewed)) }
  scope :by_job, ->(job_id) { where(job_id: job_id) }
  scope :by_user, ->(user_id) { where(user_id: user_id) }
  scope :recent, -> { order(created_at: :desc) }

  # Callbacks
  after_create :notify_job_poster
  after_create :increment_application_count
  after_update :notify_status_change, if: :saved_change_to_status?

  # Instance methods
  def pending?
    status == 'pending'
  end

  def reviewing?
    status == 'reviewing'
  end

  def interviewed?
    status == 'interviewed'
  end

  def accepted?
    status == 'accepted'
  end

  def rejected?
    status == 'rejected'
  end

  def withdrawn?
    status == 'withdrawn'
  end

  def review!
    update(status: 'reviewing')
  end

  def interview!
    update(status: 'interviewed')
  end

  def accept!
    update(status: 'accepted')
  end

  def reject!
    update(status: 'rejected')
  end

  def withdraw!
    update(status: 'withdrawn')
  end

  private

  def validate_user_can_apply
    errors.add(:user, I18n.t('job_applications.errors.cannot_apply')) unless user&.can_apply_job?
  end

  def validate_job_is_open
    errors.add(:job, I18n.t('job_applications.errors.job_closed')) if job.present? && !job.open?
  end

  def validate_one_application_per_job_per_user
    errors.add(:base, I18n.t('job_applications.errors.already_applied')) if JobApplication.exists?(user_id: user_id, job_id: job_id)
  end

  def notify_job_poster
    JobMailer.new_application_notification(self).deliver_later
  end

  def notify_status_change
    case status
    when 'reviewing'
      JobMailer.application_reviewing_notification(self).deliver_later
    when 'interviewed'
      JobMailer.application_interview_notification(self).deliver_later
    when 'accepted'
      JobMailer.application_accepted_notification(self).deliver_later
    when 'rejected'
      JobMailer.application_rejected_notification(self).deliver_later
    end
  end

  def increment_application_count
    job.increment!(:application_count)
  end
end
