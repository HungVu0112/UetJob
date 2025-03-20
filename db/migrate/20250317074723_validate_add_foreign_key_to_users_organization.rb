# frozen_string_literal: true

class ValidateAddForeignKeyToUsersOrganization < ActiveRecord::Migration[8.0]
  disable_ddl_transaction!

  def change
    validate_foreign_key :users, :organizations
  end
end
