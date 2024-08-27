'use client';

import { signOut } from "next-auth/react";

const Logout = () => {
  return (
    <button onClick={() => signOut({
      redirect: true,
      callbackUrl: `${window.location.origin}/signin`
  })} className='mr-8 mt-1 md:mt-0 text-gray-700 bg-transparent border border-solid border-gray-700 hover:bg-gray-700 hover:text-white active:bg-gray-800 text-[0.5rem] md:text-sm font-bold uppercase px-3 py-2 rounded outline-none focus:outline-none mb-1 ease-linear transition-all duration-150'>
      Sign Out
      </button>
  )
}

export default Logout;