# frozen_string_literal: true

class AddAvatarAttachmentToOrganizations < ActiveRecord::Migration[8.0]
  def up
    safety_assured do
      change_table :organizations do |t|
        t.string   :avatar_file_name
        t.string   :avatar_content_type
        t.integer  :avatar_file_size
        t.datetime :avatar_updated_at
      end

      # Xóa cột avatar cũ nếu không còn cần thiết
      remove_column :organizations, :avatar if column_exists?(:organizations, :avatar)
    end
  end

  def down
    remove_attachment :organizations, :avatar
  end
end
