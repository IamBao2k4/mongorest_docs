import { useForm } from 'react-hook-form';
import { Button, buttonVariants } from '@/components/ui/Button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/Form';
import { Input } from '@/components/ui/Input';
import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { authApi } from '@/services';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { setToken } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { Link } from '@/components/ui/Link';
import { cn } from '@/lib/utils';

export function SiginForm() {
  const { login } = authApi();
  const { setUser, setRoles } = useAuth();
  const { toast } = useToast();
  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  async function onSubmit(data) {
    setLoading(true);
    try {
      const res = await login(data);
      const _token = res?.data?.accessToken;
      if (_token) {
        setToken(_token);
        Cookies.set('userToken', _token);
        setUser(res?.data?.user);
        setRoles(res?.data?.user?.role);
        navigate('/');
      }
      setLoading(false);
    } catch (error) {
      console.log('🚀 ~ onSubmit ~ error:', error);
      toast({
        title: 'Login failed',
        description: error?.response?.data?.message,
        variant: 'destructive',
      });
      setLoading(false);
    }
  }

  useEffect(() => {
    function handle(event) {
      if (event.key === 'Enter') {
        form.handleSubmit(onSubmit)();
      }
    }
    document.addEventListener('keydown', handle);
    return () => document.removeEventListener('keydown', handle);
  }, []);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className='w-full space-y-3'>
        <FormField
          control={form.control}
          name='email'
          rules={{ required: true }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                <span className='text-red-600 pr-1'>*</span>Email
              </FormLabel>
              <FormControl>
                <Input
                  placeholder='Email'
                  className='border-white border-2 !outline-none !ring-0'
                  autoComplete='email'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          rules={{ required: true }}
          name='password'
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                <span className='text-red-600 pr-1'>*</span>Password
              </FormLabel>
              <FormControl>
                <Input
                  placeholder='Password'
                  className='border-white border-2 !outline-none !ring-0'
                  autoComplete='current-password'
                  type='password'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className='flex justify-center gap-y-1 flex-col items-center'>
          <Button
            loading={loading}
            type='submit'
            className='w-[140px]'>
            Login
          </Button>
          <p className='text-base'>or</p>
          <Link
            href='/register'
            className={cn(buttonVariants({ variant: 'default' }), 'w-[140px]')}>
            Register
          </Link>
        </div>
      </form>
    </Form>
  );
}
