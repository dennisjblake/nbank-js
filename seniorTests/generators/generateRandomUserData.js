import  RandExp  from "randexp";
import CreateUserRequest from "../models/createUserRequest.js";

export const generateUser = () => {
    const rules = CreateUserRequest.validationRules;
    
    return {
        username: new RandExp(rules.username.regex).gen(),
        password: new RandExp(rules.password.regex).gen(),
        role: 'USER'
    };
};