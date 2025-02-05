import { useState } from "react";
import { Cocktail } from "../type";
import LZString from "lz-string";

interface ShareButtonProps {
  cocktail: Cocktail;
}

export default function ShareButton({ cocktail }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const generateShareUrl = () => {
    const compressed = LZString.compressToEncodedURIComponent(
      JSON.stringify(cocktail),
    );
    return `${window.location.origin}/cocktails/${compressed}`;
  };

  const handleShare = async () => {
    const url = generateShareUrl();
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      alert("Failed to copy URL");
    }
  };

  return (
    <button
      onClick={handleShare}
      className="mt-4 rounded-full border border-white px-4 py-2 text-white hover:bg-white hover:text-black"
    >
      {copied ? "Copied!" : "Share"}
    </button>
  );
}
