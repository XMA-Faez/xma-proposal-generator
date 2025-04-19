import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex h-full flex-col items-center justify-center">
      <Link href="/proposal-generator">
        <button>Go To Proposal Generator</button>
      </Link>
    </div>
  );
}
