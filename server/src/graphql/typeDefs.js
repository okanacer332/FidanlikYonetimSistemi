// server/src/graphql/typeDefs.js
const { gql } = require('apollo-server-express');

const typeDefs = gql`
  # ============== TEMEL TİPLER ==============
  type Permission { id: ID!, action: String!, description: String! }
  type Role { id: ID!, name: String!, permissions: [Permission]! }
  type Kullanici { id: ID!, email: String!, role: Role! }

  type Fidan {
    id: ID!
    name: String!
    parentId: ID
    # fidanKodu: String # Kaldırıldı
    # satisFiyati: Float # Kaldırıldı
    children: [Fidan]!
  }

  type AuthPayload { token: String!, kullanici: Kullanici! }

  # ============== INPUT TİPLERİ ==============
  input FidanEkleInput {
      name: String!
      parentId: ID
      # fidanKodu: String # Kaldırıldı
      # satisFiyati: Float # Kaldırıldı
  }

  # ============== ANA SORGULAR (QUERIES) ==============
  type Query {
    fidanTreeGetir: [Fidan]!
    izinleriGetir: [Permission]!
    rolleriGetir: [Role]!
  }

  # ============== ANA MUTASYONLAR ==============
  type Mutation {
    fidanEkle(input: FidanEkleInput!): Fidan!
    fidanGuncelle(id: ID!, name: String!): Fidan!
    fidanSil(id: ID!): Boolean

    girisYap(email: String!, sifre: String!): AuthPayload!
    kullaniciOlustur(email: String!, sifre: String!, roleId: ID!): Kullanici!
    rolGuncelle(roleId: ID!, permissionIds: [ID!]!): Role!
  }
`;

module.exports = typeDefs;