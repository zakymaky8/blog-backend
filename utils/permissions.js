export const permissions = {
  ADMIN: [
    "manage_users",
    "create_post",
    "edit_post",
    "delete_post",
    "publish_post",
    "manage_categories",
    "manage_suggestions",
    "delete_comments",
    "delete_replies"
  ],

  EDITOR: [
    "create_post",
    "edit_post",
    "delete_post",
    "publish_post",
    "manage_categories",
  ],

  CREATOR: [
    "create_post",
    "edit_own_post",
    "delete_own_post",
  ],

  MEMBER: [
    "comment",
    "like_post",
    "bookmark_post",
  ],
};


export const hasPermission = (user, permission) => {
  return permissions[user.role].includes(permission);
}