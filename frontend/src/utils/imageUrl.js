export const getPostImageUrl = (image) => {
  const url = image?.url?.trim();
  if (!url || !/^https?:\/\//i.test(url)) {
    return null;
  }
  return url;
};
