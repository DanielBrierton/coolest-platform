import Vue from 'vue';
import UserService from '@/user/service';

describe('User service', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.reset();
    sandbox.restore();
  });

  describe('create()', () => {
    it('should make a post call to /api/v1/users with the given email', async () => {
      // ARRANGE
      const email = 'example@example.com';
      sandbox.stub(Vue.http, 'post')
        .withArgs('/api/v1/users', { email })
        .resolves('success');

      // ACT
      const response = await UserService.create(email);

      // ASSERT
      expect(response).to.equal('success');
    });

    it('should add authToken to localStorage and to req headers if returned', async () => {
      // ARRANGE
      const email = 'example@example.com';
      const res = {
        body: {
          auth: {
            token: 'foo',
          },
        },
      };
      sandbox.stub(Vue.http, 'post')
        .withArgs('/api/v1/users', { email })
        .resolves(res);
      sandbox.stub(localStorage, 'setItem');

      // ACT
      await UserService.create(email);

      // ASSERT
      expect(localStorage.setItem).to.have.been.calledWith('authToken', 'foo');
      expect(Vue.http.headers.common.Authorization).to.equal('Bearer foo');
    });
  });
});
