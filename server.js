import app from './src/app.js';
import connnectDB from './src/config/database.js';


connnectDB();


app.listen(3000, () => {
  console.log('Server is running on port 3000');
});