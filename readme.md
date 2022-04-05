# TIC-TAC-TOE Multiplayer Game with Socket.io and Expressjs 

> You need to have "nodejs" installed on your computer and "npm" was used for this project.

#### Setup code

```
git clone https://github.com/damiisdandy/tictatctoe-multiplayer.com.git tictactoe

cd tictactoe

npm install
```

#### Add enviromental variables

```
touch .env
nano .env
```

Add the properties in the `template.env` file to the `.env` file

### Running application

```
# for development
npm run dev

# for production
npm start

```

### Development mode TailwindCSS compiling

```
npx tailwindcss -i ./public/css/tailwindcss-input.css -o ./public/css/tailwindcss-output.css --watch

```

### Live Output

```
http://tic-tac-toe.aolamide.com
```