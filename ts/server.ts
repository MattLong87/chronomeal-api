import * as express from 'express';
import * as morgan from 'morgan';
const app = express();

app.use(morgan('common'));

app.get('/', (req, res) => {
    res.send("Hello again");
})

const port: number = 8080
app.listen(port, () => {
  console.log(`Your app is listening on port ${port}`);
});