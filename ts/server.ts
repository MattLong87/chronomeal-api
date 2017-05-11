import * as express from 'express';
import * as morgan from 'morgan';
import * as bodyParser from 'body-parser';
import * as cors from 'cors';
import { router as apiRouter } from './routes/apiRouter';
export const app = express();
import { DATABASE_URL, PORT } from './config';

import * as mongoose from 'mongoose';
//use global promise instead of mongoose's
mongoose.promise = global.Promise;


app.use(cors());
app.options('*', cors())
app.use(morgan('common'));
app.use(bodyParser.json());

app.use('/api', apiRouter);

let server;
export function runServer(databaseUrl = DATABASE_URL, port = PORT) {
  return new Promise((resolve, reject) => {
    mongoose.connect(databaseUrl, err => {
      if (err) {
        return reject(err);
      }
      server = app.listen(port, () => {
        console.log(`Your app is listening on port ${port}`);
        resolve(server);
      })
        .on('error', err => {
          mongoose.disconnect();
          reject(err);
        });
    });
  })
} 

export function closeServer() {
  return mongoose.disconnect().then(() => {
    return new Promise((resolve, reject) => {
      console.log('Closing server');
      server.close(err => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  });
}

if (require.main === module) {
  runServer().catch(err => console.error(err));
};