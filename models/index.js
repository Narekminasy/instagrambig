import users from '../models/users.js';
import comments from '../models/Comments.js';
import posts from '../models/posts.js';

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
    foreignKey: 'postId',
});

comments.belongsTo(users, {
    foreignKey: 'postId',
});

//userId


// Post -> Comments
// Մեկ post-ը կարող է ունենալ շատ comment
posts.hasMany(comments, {
    foreignKey: 'postId',
});

comments.belongsTo(posts, {
    foreignKey: 'postId',
});


export default {
    users,
    comments,
    posts,
};