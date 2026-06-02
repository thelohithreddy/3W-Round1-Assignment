/** Only return image object when URL is a valid http(s) link */
export const normalizePostImage = (image) => {
  const url = image?.url?.trim();
  if (!url || !/^https?:\/\//i.test(url)) {
    return null;
  }
  return {
    url,
    publicId: image.publicId || '',
  };
};
