const resolvers = require('../src/graphql/resolvers');

jest.mock('../src/models/Role', () => {
  return function(data) {
    this.data = data;
    this.id = 'role1';
    this.save = jest.fn().mockResolvedValue(this);
  };
});

jest.mock('../src/models/Permission', () => {
  return function(data) {
    this.data = data;
    this.id = 'perm1';
    this.save = jest.fn().mockResolvedValue(this);
  };
});

jest.mock('../src/models/Kullanici', () => {
  return function(data) {
    this.data = data;
    this.id = 'user1';
    this.save = jest.fn().mockResolvedValue(this);
  };
});

// Mock bcrypt
jest.mock('bcryptjs', () => ({
  hash: jest.fn(() => Promise.resolve('hashed')),
}));

describe('Authorization checks', () => {
  const adminUser = { roller: [{ rolAdi: 'Yönetici' }] };
  const normalUser = { roller: [{ rolAdi: 'User' }] };

  test('unauthenticated request should fail', async () => {
    await expect(
      resolvers.Mutation.rolOlustur(null, { rolAdi: 'test' }, { user: null })
    ).rejects.toThrow('Authentication required');
  });

  test('non-admin request should fail', async () => {
    await expect(
      resolvers.Mutation.rolOlustur(null, { rolAdi: 'test' }, { user: normalUser })
    ).rejects.toThrow('Yetki yok');
  });

  test('admin request succeeds', async () => {
    await expect(
      resolvers.Mutation.rolOlustur(null, { rolAdi: 'test' }, { user: adminUser })
    ).resolves.toBeDefined();
  });
});
