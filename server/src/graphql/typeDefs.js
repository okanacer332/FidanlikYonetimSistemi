// Konum: server/src/graphql/typeDefs.js

const { gql } = require('apollo-server-express');

const typeDefs = gql`
  # Types
  type Kullanici {
    id: ID!
    kullaniciAdi: String!
    email: String!
    roller: [Role]
  }

  type Role {
    id: ID!
    rolAdi: String!
    izinler: [Permission]
  }

  type Permission {
    id: ID!
    izinAdi: String!
    aciklama: String
  }
  
  type Fidan {
    id: ID!
    ad: String!
    aciklama: String
    stokMiktari: Int!
    alisFiyati: Float
    satisFiyati: Float
    kategori: String
    tedarikci: String
    lokasyon: String
  }

  type AuthPayload {
    token: String!
    kullanici: Kullanici!
  }

  # ================== YENİ EKLENEN TİP ==================
  type DashboardData {
    toplamFidanCesidi: Int
    toplamStokAdedi: Int
  }
  # ======================================================

  # Queries
  type Query {
    kullanicilar: [Kullanici]
    roller: [Role]
    izinler: [Permission]
    fidanlar: [Fidan]
    
    # ================== YENİ EKLENEN SORGU ==================
    getDashboardData: DashboardData
    # ========================================================
  }

  # Mutations
  type Mutation {
    kullaniciOlustur(kullaniciAdi: String!, email: String!, sifre: String!, roller: [ID!]): Kullanici
    rolOlustur(rolAdi: String!, izinler: [ID!]): Role
    izinOlustur(izinAdi: String!, aciklama: String): Permission
    
    fidanEkle(ad: String!, aciklama: String, stokMiktari: Int!, alisFiyati: Float, satisFiyati: Float, kategori: String, tedarikci: String, lokasyon: String): Fidan
    fidanGuncelle(id: ID!, ad: String, aciklama: String, stokMiktari: Int, alisFiyati: Float, satisFiyati: Float, kategori: String, tedarikci: String, lokasyon: String): Fidan
    fidanSil(id: ID!): Boolean
    
    girisYap(kullaniciAdi: String!, sifre: String!): AuthPayload
  }
`;

module.exports = typeDefs;