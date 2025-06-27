import { Logo } from '@/components/ui/Logo';
import { SiginForm } from './components/SiginForm';

export default function Login() {
  return (
    <div className='w-screen h-screen relative flex justify-center items-center'>
      <img
        className='absolute -z-10 w-full h-full object-cover'
        src={'/images/banner-home.webp'}
        alt='img'
      />
      <div
        style={{
          backdropFilter: 'blur(10px)',
        }}
        className='bg-white/50 w-[500px] rounded-xl px-16 py-10 flex flex-col gap-4'>
        <div className='flex flex-col justify-center items-center'>
          <Logo />
          <p className='text-center px-5 pt-1 pb-3'>Chào mừng bạn đến với trang quản trị</p>
          <SiginForm />
        </div>
      </div>
    </div>
  );
}
