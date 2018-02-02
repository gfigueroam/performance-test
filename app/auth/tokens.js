const SERVICE_TOKEN = 'service';
const USER_TOKEN = 'user';

class AuthToken {
  constructor(token) {
    this.token = token;
  }
}

class UserToken extends AuthToken {
  constructor(token, userId) {
    super(token);
    this.userId = userId;
    this.tokenType = USER_TOKEN;
  }
}

class ServiceToken extends AuthToken {
  constructor(token) {
    super(token);
    this.tokenType = SERVICE_TOKEN;
  }
}

export default {
  SERVICE_TOKEN,
  ServiceToken,
  USER_TOKEN,
  UserToken,
};
