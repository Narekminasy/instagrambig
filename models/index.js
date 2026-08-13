import users from '../models/users.js';
import comments from '../models/Comments.js';
import posts from '../models/posts.js';
import confirm from '../models/confirm.js'

// User -> Posts
// Մեկ user-ը կարող է ունենալ շատ post
users.hasMany(posts, {
    foreignKey: 'userId',
});

posts.belongsTo(users, {
    foreignKey: 'userId',
});


// User -> Comments
// Մեկ user-ը կարող է գրել շատ comment
users.hasMany(comments, {
    foreignKey: 'user_id',
});

comments.belongsTo(users, {
    foreignKey: 'user_id',
    as: 'User'
});



// Post -> Comments
// Մեկ post-ը կարող է ունենալ շատ comment
posts.hasMany(comments, {
    foreignKey: 'post_id',
});

comments.belongsTo(posts, {
    foreignKey: 'post_id',
});

//confirm

users.hasOne(confirm, {
    foreignKey: 'userId',
    onDelete: 'CASCADE',
});

confirm.belongsTo(users, {
    foreignKey: 'userId',
});


export default {
    users,
    comments,
    posts,
    confirm,
};