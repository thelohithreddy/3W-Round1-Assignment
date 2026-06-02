import User from '../models/User.js';

export const pushNotification = async (recipientId, { type, fromUser, fromUsername, postId, message }) => {
  if (!recipientId || !fromUser) return;
  if (recipientId.toString() === fromUser.toString()) return;

  await User.findByIdAndUpdate(recipientId, {
    $push: {
      notifications: {
        $each: [
          {
            type,
            fromUser,
            fromUsername,
            postId: postId || undefined,
            message,
            read: false,
            createdAt: new Date(),
          },
        ],
        $position: 0,
        $slice: 50,
      },
    },
  });
};

/** Notify everyone who follows this author when they publish a post. */
export const notifyFollowersOfNewPost = async (author, postId) => {
  if (!author?._id || !postId) return;

  const followers = author.followers || [];
  if (!followers.length) return;

  const message = `${author.username} shared a new post`;

  await Promise.all(
    followers.map((f) =>
      pushNotification(f.user, {
        type: 'post',
        fromUser: author._id,
        fromUsername: author.username,
        postId,
        message,
      })
    )
  );
};
