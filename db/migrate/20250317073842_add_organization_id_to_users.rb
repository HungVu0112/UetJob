# frozen_string_literal: true

class AddOrganizationIdToUsers < ActiveRecord::Migration[8.0]
  disable_ddl_transaction!

  def change
    add_reference :users, :organization, index: { algorithm: :concurrently }
  end
end
