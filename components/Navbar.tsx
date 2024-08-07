import { FaHandsHelping } from 'react-icons/fa';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Logout from './Logout';

const Navbar = async () => {
  const session = await getServerSession(authOptions);
  return (
    <div className=' bg-gray-100 py-2 border-b border-s-zinc-200 fixed w-full z-10 top-0'>
      <div className='pl-5 flex items-center justify-between'>
      <div className='flex items-center'>
        <FaHandsHelping className='text-lg text-gray-800 mr-2'/>
        <Link href="/" className='text-gray-800'>Silver Companions</Link>
      </div>
      <div>
      {session?.user ? (<Link href='/user' className='mr-8 text-black font-bold uppercase px-4 py-2'>Profile</Link>)
      : null}
      {session?.user ? (<Link href='/matches' className='mr-8 text-black font-bold uppercase px-4 py-2'>Matches</Link>)
      : null}
      </div>
      {session?.user ? (<Logout/>) : (<Link href='/signin' className='mr-8 text-gray-700 bg-transparent border border-solid border-gray-700 hover:bg-gray-700 hover:text-white active:bg-gray-800 text-xs font-bold uppercase px-3 py-2 rounded outline-none focus:outline-none ease-linear transition-all duration-150'>
      Sign In
      </Link>)}
      
      </div>
    </div>
  );
};

export default Navbar;