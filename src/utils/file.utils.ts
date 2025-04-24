import path from "path"

export const getFileInfo = (filename: string) => {
  const extension = path.extname(filename).substring(1)
  const name = path.basename(filename, `.${extension}`)

  return {
    name,
    extension,
  }
}

export const getMimeType = (extension: string): string => {
  const mimeTypes: Record<string, string> = {
    txt: "text/plain",
    pdf: "application/pdf",
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    xls: "application/vnd.ms-excel",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ppt: "application/vnd.ms-powerpoint",
    pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    jpeg: "image/jpeg",
    jpg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    svg: "image/svg+xml",
    zip: "application/zip",
    rar: "application/x-rar-compressed",
    mp3: "audio/mpeg",
    mp4: "video/mp4",
  }

  return mimeTypes[extension.toLowerCase()] || "application/octet-stream"
}
