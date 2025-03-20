# frozen_string_literal: true

class AddForeignKeyToUsersOrganization < ActiveRecord::Migration[8.0]
  disable_ddl_transaction!

  def change
    add_foreign_key :users, :organizations, validate: false
  end
end
