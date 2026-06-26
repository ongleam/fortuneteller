// AI SDK v5+ removed the `Attachment` type. This is the minimal shape the app
// uses for file-upload previews and outgoing message files.
export type Attachment = {
  url: string;
  name?: string;
  contentType?: string;
};
