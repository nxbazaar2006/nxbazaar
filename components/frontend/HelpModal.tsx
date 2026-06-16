"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  HelpCircle,
  Mail,
  Phone,
  MessageCircle,
} from "lucide-react";

export default function HelpModal() {
  return (
    <Dialog>
      <DialogTrigger
        className="
          flex items-center gap-2
          rounded-2xl border border-white/10
          bg-white/10 px-4 py-2
          backdrop-blur-xl
          transition-all duration-300
          hover:scale-105
          hover:bg-gradient-to-r
          hover:from-orange-500/20
          hover:via-pink-500/20
          hover:to-purple-500/20
        "
      >
        <HelpCircle size={18} />
        <span className="font-medium">Help</span>
      </DialogTrigger>

      <DialogContent
        className="
          border bg-card text-card-foreground shadow-sm
          rounded-3xl border-white/20
          bg-white/10
          shadow-2xl dark:bg-slate-950/20
          sm:max-w-md
        "
      >
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Need Help?
          </DialogTitle>
        </DialogHeader>

        <p className="text-sm text-muted-foreground">
          Our support team is here to help you with orders,
          payments, shipping, returns, and account issues.
        </p>

        <div className="mt-6 space-y-3">
          <div
            className="
              flex items-center gap-3
              rounded-2xl border border-white/10
              bg-white/5 p-4
            "
          >
            <Mail className="h-5 w-5 text-orange-500" />
            <div>
              <p className="font-medium">Email Support</p>
              <p className="text-xs text-muted-foreground">
                support@nxbazaar.com
              </p>
            </div>
          </div>

          <div
            className="
              flex items-center gap-3
              rounded-2xl border border-white/10
              bg-white/5 p-4
            "
          >
            <Phone className="h-5 w-5 text-green-500" />
            <div>
              <p className="font-medium">Call Support</p>
              <p className="text-xs text-muted-foreground">
                +91 XXXXX XXXXX
              </p>
            </div>
          </div>

          <div
            className="
              flex items-center gap-3
              rounded-2xl border border-white/10
              bg-white/5 p-4
            "
          >
            <MessageCircle className="h-5 w-5 text-blue-500" />
            <div>
              <p className="font-medium">Live Chat</p>
              <p className="text-xs text-muted-foreground">
                Available 24/7
              </p>
            </div>
          </div>
        </div>

        <button
          className="
            mt-6 w-full rounded-2xl
            bg-gradient-to-r
            from-orange-500
            via-pink-500
            to-purple-500
            py-3 font-semibold text-white
            shadow-lg
            transition-all duration-300
            hover:scale-[1.02]
          "
        >
          Contact Support
        </button>
      </DialogContent>
    </Dialog>
  );
}
