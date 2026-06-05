"use client";

import {
  Share2,
  Copy,
  Check,
  QrCode,
  CircleUserRound,
  MessageCircle,
  Send,
  Smartphone,
} from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import toast from "react-hot-toast";
import Image from "next/image";

type ProductShareButtonProps = {
  urlToShare: string;
  title: string;
  image?: string;
};

export default function ProductShareButton({
  urlToShare,
  title,
  image,
}: ProductShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const shareLinks = {
    whatsapp: `https://wa.me/?text=${encodeURIComponent(title + " " + urlToShare)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(urlToShare)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(urlToShare)}`,
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(urlToShare);
    setCopied(true);
    toast.success("Link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      await navigator.share({ title, url: urlToShare });
    } else {
      toast.error("Not supported");
    }
  };

  return (
    <Dialog>
      {/* Trigger */}
      <DialogTrigger asChild>
        <button className="rounded-full border border-slate-200 bg-white p-2 text-slate-900 shadow-sm transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700">
          <Share2 className="h-5 w-5" />
        </button>
      </DialogTrigger>

      {/* Modal */}
      <DialogContent className="max-w-md space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-700 dark:bg-slate-900">
        <h3 className="text-lg font-semibold text-center">
          Share this product
        </h3>

        {/* 🔥 Product Preview */}
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800">
          {image && (
            <Image
              src={image}
              alt={title}
              width={60}
              height={60}
              className="rounded-xl object-cover"
            />
          )}
          <p className="text-sm font-medium line-clamp-2">
            {title}
          </p>
        </div>

        {/* 🔥 Social Buttons */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <a href={shareLinks.whatsapp} target="_blank">
            <div className="rounded-2xl p-3 transition hover:bg-slate-100 dark:hover:bg-slate-800">
              <MessageCircle className="mx-auto h-5 w-5 text-primary" />
              <p className="text-xs">WhatsApp</p>
            </div>
          </a>

          <a href={shareLinks.facebook} target="_blank">
            <div className="rounded-2xl p-3 transition hover:bg-slate-100 dark:hover:bg-slate-800">
              <CircleUserRound className="mx-auto h-5 w-5 text-primary" />
              <p className="text-xs">Facebook</p>
            </div>
          </a>

          <a href={shareLinks.twitter} target="_blank">
            <div className="rounded-2xl p-3 transition hover:bg-slate-100 dark:hover:bg-slate-800">
              <Send className="mx-auto h-5 w-5 text-primary" />
              <p className="text-xs">Twitter</p>
            </div>
          </a>
        </div>

        {/* 🔥 Actions */}
        <div className="space-y-2">
          {/* Copy */}
          <button
            onClick={copyToClipboard}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-slate-950 p-2.5 text-white shadow-sm transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
          >
            {copied ? <Check size={18} /> : <Copy size={18} />}
            {copied ? "Copied!" : "Copy Link"}
          </button>

          {/* Native Share */}
          <button
            onClick={handleNativeShare}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-slate-200 bg-white p-2.5 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700"
          >
            <Smartphone size={18} />
            Share via Apps
          </button>

          {/* QR Code */}
          <div className="flex flex-col items-center gap-2 pt-3">
            <QrCode />
            <Image
              src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(
                urlToShare
              )}`}
              alt="QR Code"
              width={120}
              height={120}
              unoptimized
              className="rounded-2xl border border-slate-200 bg-white p-2 dark:border-slate-700 dark:bg-slate-800"
            />
            <p className="text-xs text-slate-500 dark:text-white/55">
              Scan to open product
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
