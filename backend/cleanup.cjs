const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://KNIGHTFIRE007:darshan2256@gpacluster.apxfcl2.mongodb.net/gpadb?retryWrites=true&w=majority')
  .then(async () => {
    const db = mongoose.connection.db;
    const res = await db.collection('users').deleteMany({
      $or: [
        { password: { $exists: false } },
        { password: null }
      ]
    });
    console.log('Deleted invalid users:', res.deletedCount);
    process.exit(0);
  })
  .catch(console.error);
