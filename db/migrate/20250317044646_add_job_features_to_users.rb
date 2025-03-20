# frozen_string_literal: true

class AddJobFeaturesToUsers < ActiveRecord::Migration[8.0]
  disable_ddl_transaction!

  def change
    # Remove if existed
    safety_assured do
      remove_index :users, :user_type, if_exists: true

      remove_column :users, :user_type, if_exists: true
      remove_column :users, :can_post_job, if_exists: true
      remove_column :users, :can_seek_job, if_exists: true
      remove_column :users, :can_apply_job, if_exists: true
      remove_column :users, :saved_jobs, if_exists: true
    end

    # Add new features
    add_column :users, :user_type, :string, default: 'guest'
    add_column :users, :saved_jobs, :jsonb, default: '[]'

    add_index :users, :user_type, algorithm: :concurrently
  end
end
