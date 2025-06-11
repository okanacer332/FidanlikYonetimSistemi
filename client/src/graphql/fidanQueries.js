// src/graphql/fidanQueries.js
import { gql } from '@apollo/client';

export const GET_FIDAN_TREE = gql`
  query FidanTreeGetir {
    fidanTreeGetir {
      id
      name
      parentId
      children {
        id
        name
        parentId
        children {
          id
          name
          parentId
        }
      }
    }
  }
`;

export const ADD_FIDAN = gql`
  mutation FidanEkle($input: FidanEkleInput!) {
    fidanEkle(input: $input) {
      id
      name
      parentId
    }
  }
`;

export const UPDATE_FIDAN = gql`
  mutation FidanGuncelle($id: ID!, $name: String!) {
    fidanGuncelle(id: $id, name: $name) {
      id
      name
    }
  }
`;

export const DELETE_FIDAN = gql`
  mutation FidanSil($id: ID!) {
    fidanSil(id: $id)
  }
`;