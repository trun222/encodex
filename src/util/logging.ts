import Logz from 'logzio-nodejs';

export const logger = Logz.createLogger({ token: process?.env?.LOGZ_TOKEN! });