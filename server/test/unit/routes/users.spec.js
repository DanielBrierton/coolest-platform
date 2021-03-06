const proxy = require('proxyquire').noCallThru();

describe('router: user', () => {
  let handlers;
  describe('post', () => {
    let sandbox;
    let handler;
    const userController = class {};
    let loggerStub;
    let statusStub;
    let jsonStub;
    let nextMock;
    let errorHandler;
    before(() => {
      sandbox = sinon.sandbox.create();
      handlers = (proxy('../../../routes/handlers/users', {
        '../../controllers/users': userController,
      })).post;
      loggerStub = sandbox.stub();
      jsonStub = sandbox.stub();
      errorHandler = sandbox.stub();
      handler = (req, res, next) => {
        return handlers[0](req, res, next)
          .then(() => handlers[1](req, res, next))
          .then(() => handlers[2](req, res, next))
          .catch(err => errorHandler(err));
      };
    });

    beforeEach(() => {
      sandbox.reset();
      statusStub = sandbox.stub().returns({
        json: jsonStub,
      });
      nextMock = sandbox.stub().callsFake((err, data) => {
        if (err) return Promise.reject(err);
        return Promise.resolve(data);
      });
    });

    it('should format to json', async () => {
      const postController = sandbox.stub();
      const mockUser = { email: 'text@example.com' };
      const mockAnswer = { user: mockUser, auth: {} };
      const mockReq = {
        body: mockUser,
      };
      const mockRes = {
        status: statusStub,
        locals: {},
      };
      userController.post = postController.resolves(mockAnswer);
      await handler(mockReq, mockRes, nextMock);
      expect(postController).to.have.been.calledOnce;
      expect(postController).to.have.been.calledWith(mockReq.body.email);

      expect(statusStub).to.have.been.calledOnce;
      expect(statusStub).to.have.been.calledWith(200);
      expect(jsonStub).to.have.been.calledOnce;
      expect(jsonStub).to.have.been.calledWith(mockAnswer);
      expect(nextMock).to.have.been.calledTwice;
    });

    it('should allow login for existing user without project', async () => {
      const postController = sandbox.stub();
      const getController = sandbox.stub();
      const mockUser = { email: 'text@example.com' };
      const mockAnswer = Object.assign({}, mockUser, { auth: {} }, { project: [] });
      const mockReq = {
        body: mockUser,
        app: {
          locals: {
            logger: {
              error: loggerStub,
            },
          },
        },
      };
      const mockRes = {
        status: statusStub,
        locals: {},
      };
      const mockErr = new Error('Fake err');
      mockErr.status = 409;
      userController.post = postController.rejects(mockErr);
      userController.get = getController.resolves(mockAnswer);
      await handler(mockReq, mockRes, nextMock);
      expect(postController).to.have.been.calledWith(mockReq.body.email);
      expect(getController).to.have.been.calledOnce;
      expect(getController).to.have.been.calledWith({ email: mockReq.body.email }, ['project', 'auth']);
      expect(loggerStub).to.not.have.been.called;
      expect(jsonStub).to.have.been.calledWith({ user: mockUser, auth: {} });
      expect(nextMock).to.have.been.calledTwice;
    });

    it('should disallow login for existing user with project', async () => {
      const postController = sandbox.stub();
      const getController = sandbox.stub();
      const mockUser = { email: 'text@example.com' };
      const mockAnswer = Object.assign({}, mockUser, { auth: {} }, { project: { id: 1 } });
      const mockReq = {
        body: mockUser,
        app: {
          locals: {
            logger: {
              error: loggerStub,
            },
          },
        },
      };
      const mockRes = {
        status: statusStub,
        locals: {},
      };
      const mockErr = new Error('Fake err');
      mockErr.status = 409;
      userController.post = postController.rejects(mockErr);
      userController.get = getController.resolves(mockAnswer);
      await handler(mockReq, mockRes, nextMock);
      expect(postController).to.have.been.calledWith(mockReq.body.email);
      expect(getController).to.have.been.calledOnce;
      expect(getController).to.have.been.calledWith({ email: mockReq.body.email }, ['project', 'auth']);
      expect(loggerStub).to.have.been.calledOnce;
      expect(loggerStub.getCall(0).args[0].message).to.be.equal('Fake err');
      expect(nextMock).to.have.been.calledThrice;
      expect(nextMock.getCall(2).args[0].message).to.equal('Error while saving a user.');
      expect(nextMock.getCall(2).args[0].status).to.equal(409);
    });

    it('should log generic error triggered by the controller', async () => {
      const postController = sandbox.stub();
      const mockUser = { email: 'text@example.com' };
      const mockReq = {
        body: mockUser,
        app: {
          locals: {
            logger: {
              error: loggerStub,
            },
          },
        },
      };
      const mockRes = {
        status: statusStub,
        locals: {},
      };
      const mockErr = new Error('Fake err');

      userController.post = postController.rejects(mockErr);
      await handler(mockReq, mockRes, nextMock);
      expect(postController).to.have.been.calledWith(mockReq.body.email);
      expect(loggerStub).to.have.been.calledOnce;
      expect(loggerStub.getCall(0).args[0].message).to.be.equal('Fake err');
      expect(nextMock).to.have.been.calledThrice;
      expect(nextMock.getCall(2).args[0].message).to.have.equal('Error while saving a user.');
    });
  });
});
