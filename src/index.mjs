import express from 'express';
import path from 'path';
import methodOverride from 'method-override';
import { fileURLToPath } from 'url';
import session from 'express-session';
import flash from 'connect-flash';

const app = express();
const PORT = process.env.PORT || 3000;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(session({ secret: 'secret', resave: false, saveUninitialized: true }));
app.use(flash());

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));

app.use((req, res, next) => {
  res.locals.messages = req.flash();
  next();
});

let temporaryDb = [
  { id: 1, userName: 'Angel', displayName: 'War angel' },
  { id: 2, userName: 'Greg', displayName: 'Almanac' },
  { id: 3, userName: 'Quinn', displayName: 'Mihawk' },
];

const getIndexByUserId = (req, res, next) => {
  const {
    params: { id },
  } = req;

  const parsedId = parseInt(id);
  if (isNaN(parsedId)) return res.status(400).json({ message: 'Bad request!' });
  const findUserIndex = temporaryDb.findIndex((user) => user.id === parsedId);
  if (findUserIndex === -1)
    return res.status(404).json({ message: 'User not found!' });
  req.findUserIndex = findUserIndex;
  next();
};

app.get('/', (req, res) => {
  res.render('home');
});
app.get('/users', (req, res) => {
  res.render('users', { temporaryDb });
});

app.get('/post', (req, res) => {
  res.render('post');
});

app.get('/edit', (req, res) => {
  res.render('edit');
});

app.get('/delete', (req, res) => {
  res.render('delete');
});

app.post('/post', (req, res) => {
  const { body } = req;
  const newUserId = temporaryDb[temporaryDb.length - 1].id + 1;

  if (!body.userName || !body.displayName)
    return res.status(400).json({ message: 'Bad request!' });
  if (body.userName || body.displayName)
    temporaryDb.push({ id: newUserId, ...body });
  req.flash('success', 'New user added!');
  return res.status(201).redirect('/post');
});

app.patch('/edit/:id', getIndexByUserId, (req, res) => {
  const { body } = req;
  const user = temporaryDb[req.findUserIndex];

  user.userName = body.userName ? body.userName : user.userName;
  user.displayName = body.displayName ? body.displayName : user.displayName;

  req.flash('success', 'Update completed!');
  return res.status(200).redirect('/edit');
});

app.delete('/delete/:id', getIndexByUserId, (req, res) => {
  const user = req.findUserIndex;
  temporaryDb.splice(user, 1);

  req.flash('success', 'Deletion completed!');
  return res.status(200).redirect('/delete');
});

app.listen(PORT, () => {
  console.log(`Listening to port ${PORT}!`);
});
