import devEnv from './environment.dev';
import prodEnv from './environment.prod';

let envMap = new Map([
  ['dev', devEnv],
  ['development', devEnv],
  ['prod', prodEnv],
  ['production', prodEnv],
]);

let env = envMap.get(process.env.REACT_APP_ENV) || devEnv;

export default env;
