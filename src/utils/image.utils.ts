const extractFirstImage = (body: string): string | null => {
  const imgRegex = /!\[.*?\]\((.*?)\)/;
  const match = imgRegex.exec(body);
  if (match && match[1]) return match[1];
  const htmlImgRegex = /<img\s+[^>]*src=["']([^"']+)["'][^>]*>/i;
  const htmlMatch = htmlImgRegex.exec(body);
  if (htmlMatch && htmlMatch[1]) return htmlMatch[1];
  return null;
};

export const ImageUtils = { extractFirstImage };
