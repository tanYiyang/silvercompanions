import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="h-full w-full flex flex-col mt-24 items-center">
      <h1 className="text-4xl font-bold mb-6">Silver Companions</h1>
      <div className="flex flex-col md:flex-row items-center mb-10 max-w-4xl">
        <div className="w-1/2 flex justify-center mb-4 md:mr-8">
          <Image 
            src="/images/volunteer.jpg" 
            alt="Volunteer" 
            width={500} 
            height={300} 
            className="rounded-lg shadow-lg"
          />
        </div>
        <div className="w-1/2 flex flex-col justify-center">
        <h1 className="text-xl font-semibold">About Us</h1>
          <p className="md:text-xl text-gray-700 mb-4 text-justify text-sm">
            Silver Companions is dedicated to helping the elderly in Singapore by connecting them with caring volunteers. Our platform ensures that every elder finds a compatible volunteer based on their preferences. Join us in making a positive impact in our community!
          </p>
          <div className="flex justify-center mt-5">
      <Link href='/signup' className='md:text-xl text-center w-1/2 text-gray-700 bg-transparent border border-solid border-gray-700 hover:bg-gray-700 hover:text-white active:bg-gray-800 font-bold uppercase px-3 py-2 rounded outline-none focus:outline-none mb-1 ease-linear transition-all duration-150'>
      Sign Up
      </Link>
      </div>
      </div>
      </div>

      <div className="flex flex-col items-center mb-10 max-w-4xl">
      <h1 className="text-xl font-semibold mb-6">How It Works</h1>
      <p className="md:text-xl text-gray-700 mb-4 text-center text-sm mx-2">1. Click on the <b>Sign Up</b> button and fill up the form accordingly.</p>
      <p className="md:text-xl text-gray-700 mb-4 text-center text-sm mx-2">2. Once you have logged in, select your role and fill up your personal particulars and preferences.</p>
      <p className="md:text-xl text-gray-700 mb-4 text-center text-sm mx-2">3. Click on <b>Matches</b> to find the details of your volunteer or elder. </p>
      </div>

    </div>
  )
}