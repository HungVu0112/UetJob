# frozen_string_literal: true

class ConvertSavedJobsToArray < ActiveRecord::Migration[8.0]
  def change
    # Xóa cột cũ
    safety_assured { remove_column :users, :saved_jobs if column_exists?(:users, :saved_jobs) }

    # Thêm cột mới với kiểu mảng
    add_column :users, :saved_jobs, :string, array: true, default: []
  end
end
