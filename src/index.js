const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find(user => user.username === username);

  if (!user) {
    return response.status(404).json({ error: 'User not found' });
  }

  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;
  const id = uuidv4();
  const userExists = users.find(user => user.username === username);

  if (userExists) {
    return response.status(400).json({ error: 'User already exists.' });
  }

  const newUser = {
    id,
    name,
    username,
    todos: []
  };

  users.push(newUser);

  response.status(201).json(newUser);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  const selectedUser = users.find(user => user.username === username);

  if (selectedUser) {
    return response.status(200).json(selectedUser.todos);
  } 

  return response.status(404).send();
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  const { title, deadline } = request.body;
  const selectedUser = users.find(user => user.username === username);

  if (selectedUser) {
    const todo = {
      id: uuidv4(),
      title,
      done: false,
      deadline: new Date(deadline),
      created_at: new Date(),
    };
    selectedUser.todos.push(todo);

    return response.status(201).json(todo);
  } 
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  const { id } = request.params;
  const { title, deadline } = request.body;

  const selectedUser = users.find(user => user.username === username);

  if (selectedUser) {
    const selectedTodo = selectedUser.todos.find(todo => todo.id === id);

    if (selectedTodo) {
      selectedTodo.title = title ?? selectedTodo.title;
      selectedTodo.deadline = deadline ?? selectedTodo.deadline;

      return response.status(201).json(selectedTodo);
    }
    return response.status(404).json({ error: 'Todo not found' });
  }

  return response.status(404).json({ error: 'User not found' });
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  const { id } = request.params;

  const selectedUser = users.find(user => user.username === username);

  if (selectedUser) {
    const selectedTodo = selectedUser.todos.find(todo => todo.id === id);

    if (selectedTodo) {
     selectedTodo.done = !selectedTodo.done;

     return response.status(201).json(selectedTodo);
    }

    return response.status(404).json({ error: 'Todo not found' });
  }

  return response.status(404).json({ error: 'User not found' });
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  const { id } = request.params;

  const selectedUser = users.find(user => user.username === username);

  if (selectedUser) {
    const selectedTodoIndex = selectedUser.todos.findIndex(todo => todo.id === id);

    // If element is in array
    if (selectedTodoIndex > -1) {
     selectedUser.todos[selectedTodoIndex] = selectedUser.todos[selectedUser.todos.length - 1];
     selectedUser.todos.pop();

     return response.status(204).send();
    }

    return response.status(404).json({ error: 'Todo not found' });
  }

  return response.status(404).json({ error: 'User not found' });
});

module.exports = app;