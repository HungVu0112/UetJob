# frozen_string_literal: true

class CreateJobApplications < ActiveRecord::Migration[8.0]
  def change
    create_table :job_applications do |t|
      t.string :status, default: 'pending', null: false
      t.text :cover_letter
      t.string :applicant_email, null: false
      t.string :applicant_phone_number, null: false
      t.string :applicant_fullname, null: false
      t.attachment :resume, null: false
      t.timestamps

      t.references :user, null: false, foreign_key: true
      t.references :job, null: false, foreign_key: true
    end

    add_index :job_applications, [:user_id, :job_id], unique: true
    add_index :job_applications, :status
    add_index :job_applications, :created_at
  end
end
