import ContainerDetail from '@/components/common/ContainerDetail';
import { Chart1 } from './components/Chart1';
import { Chart2 } from './components/Chart2';
import { Chart3 } from './components/Chart3';
import { Chart4 } from './components/Chart4';
import { Chart5 } from './components/Chart5';
import { Chart6 } from './components/Chart6';

function Home() {
  return (
    <ContainerDetail className='flex flex-col !overflow-hidden'>
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5'>
        <Chart1 />
        <Chart2 />
        <Chart3 />
        <Chart4 />
        <Chart5 />
        <Chart6 />
      </div>
    </ContainerDetail>
  );
}

export default Home;
