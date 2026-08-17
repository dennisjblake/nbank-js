import RandExp from 'randexp';
import CreateUserRequest from '../models/createUserRequest.js';
import ROLE from '../utils/roles.js';

export const generateUser = () => {
  const rules = CreateUserRequest.validationRules;

  return {
    username: new RandExp(rules.username.regex).gen(),
    password: new RandExp(rules.password.regex).gen(),
    role: ROLE.USER,
  };
};
