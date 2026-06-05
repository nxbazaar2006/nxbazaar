import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

export const ourFileRouter = {

  categoryImageUploader: f({
    image: { maxFileSize: "4MB", maxFileCount: 1 },
  }).onUploadComplete(async ({ file }) => {
    return { url: file.ufsUrl };
  }),

  subcategoryImageUploader: f({
    image: { maxFileSize: "4MB", maxFileCount: 1 },
  }).onUploadComplete(async ({ file }) => {
    return { url: file.ufsUrl };
  }),

  bannerImageUploader: f({
    image: { maxFileSize: "4MB", maxFileCount: 1 },
  }).onUploadComplete(async ({ file }) => {
    return { url: file.ufsUrl };
  }),

  marketLogoUploader: f({
    image: { maxFileSize: "4MB", maxFileCount: 1 },
  }).onUploadComplete(async ({ file }) => {
    return { url: file.ufsUrl };
  }),

  productImageUploader: f({
    image: { maxFileSize: "4MB", maxFileCount: 1 },
  }).onUploadComplete(async ({ file }) => {
    return { url: file.ufsUrl };
  }),

  sellerProfileUploader: f({
    image: { maxFileSize: "4MB", maxFileCount: 1 },
  }).onUploadComplete(async ({ file }) => {
    return { url: file.ufsUrl };
  }),

  customerProfileUploader: f({
    image: { maxFileSize: "4MB", maxFileCount: 1 },
  }).onUploadComplete(async ({ file }) => {
    return { url: file.ufsUrl };
  }),

  multipleProductsUploader: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 10,
    },
  })
    .middleware(async () => {
      return {};
    })
    .onUploadComplete(async ({ file }) => {
      console.log("upload completed", file.ufsUrl);

      return {
        url: file.ufsUrl,
      };
    }),

} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
