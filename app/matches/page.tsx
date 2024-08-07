import Matches from '@/components/Matches';

const page = async() => {
  return (
    <div className='w-1/2 h-5/6'>
      <h1>You have matched with:</h1>
      <Matches />
    </div>
  );
}

export default page
