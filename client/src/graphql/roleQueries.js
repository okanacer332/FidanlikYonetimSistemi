// src/graphql/roleQueries.js
import { gql } from '@apollo/client';

export const GET_ROLES_AND_PERMISSIONS = gql`
  query GetRolesAndPermissions {
    rolleriGetir {
      id
      name
      permissions {
        id
        action
      }
    }
    izinleriGetir {
      id
      action
      description
    }
  }
`;

export const UPDATE_ROLE_PERMISSIONS = gql`
  mutation RolGuncelle($roleId: ID!, $permissionIds: [ID!]!) {
    rolGuncelle(roleId: $roleId, permissionIds: $permissionIds) {
      id
      name
      permissions {
        id
      }
    }
  }
`;