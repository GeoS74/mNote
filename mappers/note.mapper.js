module.exports = (data) => ({
  id: data.id,
  title: data.title,
  message: data.message || '',
  isPublic: data.isPublic,
  files: data.files.map((f) => ({
    originalName: f.originalName,
    fileName: f.fileName,
  })),
  createdAt: data.createdAt,
  updatedAt: data.updatedAt,
});
