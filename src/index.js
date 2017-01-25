import http from 'http';
import path from 'path';
import process from 'process';
import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import winston from 'winston';
import yamlConfig from 'node-yaml-config';
import passport from 'passport';

import db from './db';
import api from './api';
import facebook from './auth/facebook';
import middleware from './middleware';

winston.level = 'debug';

const config = yamlConfig.load(path.join(__dirname, '/config.yml'));

winston.log('info', config);

const app = express();

app.use(passport.initialize());
app.use(passport.session());

app.server = http.createServer(app);

app.use(cors({
  exposedHeaders: config.values.corsHeaders,
}));


app.use(bodyParser.json({
  limit: config.values.bodyLimit,
}));

db(config);

app.use(middleware());

app.use('/api', api());

app.use('/auth', facebook(config));

app.server.listen(process.env.PORT || config.server.port);

winston.info(`Server started on ${app.server.address().port}`);

export default app;
