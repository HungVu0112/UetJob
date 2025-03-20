# frozen_string_literal: true

class CreateJobs < ActiveRecord::Migration[8.0]
  def change
    create_table :jobs do |t|
      t.string :title, null: false
      t.text :description, null: false
      t.text :requirements
      t.string :location
      t.string :salary_range
      t.datetime :deadline
      t.string :status, default: 'open', null: false
      t.string :job_type, default: 'full-time'
      t.string :job_category
      t.string :contact_email
      t.integer :views_count, default: 0
      t.integer :application_count, default: 0
      t.timestamps

      t.references :organization, null: false, foreign_key: true
      t.references :user, null: false, foreign_key: true
    end

    add_index :jobs, :status
    add_index :jobs, :job_type
    add_index :jobs, :created_at
  end
end
