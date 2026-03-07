import Image from "next/image";

export default function Home() {
  return (
    <div className="relative flex flex-row px-3 h-25 items-center">
      <Image 
        src="/vercel.svg"
        width={50}
        height={50}
        className="object-left hidden md:block"
        alt="vercel logo"
      />
      <Image
        src="/next.svg"
        width={100}
        height={100}
        className="Object-left hidden md:block invert ml-5"
        alt="next logo"
      />
      <h1 className="absolute left-0 right-0 text-center text-4xl font-bold">Joshua Shoemaker</h1>
    </div>
  );
}
