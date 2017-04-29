import * as express from 'express';
import * as morgan from 'morgan';
export const app = express();

app.use(morgan('common'));

app.get('/', (req, res) => {
    res.send("Hello again");
})



let server;
export function runServer() {
    const port: number = 8080
    return new Promise((resolve, reject) => {
        server = app.listen(port, () => {
            console.log(`Your app is listening on port ${port}`);
            resolve(server);
        }).on('error', err => {
            reject(err);
        });
    });
}
export function closeServer() {
  return new Promise((resolve, reject) => {
    console.log('Closing server');
    server.close(err => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });
}

if (require.main === module) {
  runServer().catch(err => console.error(err));
};