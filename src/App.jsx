import SearchInput from './components/SearchInput';
import BrandList from './components/BrandList';
import OffersTable from './components/OffersTable';

export default function App() {
  return (
    <div className="container py-4" style={{ maxWidth: 1000 }}>
      <h1 className="h3 mb-1">Подбор автозапчастей и аналогов</h1>
      <p className="text-secondary mb-4">
        Введите артикул, выберите производителя и получите предложения со складов.
      </p>
      <SearchInput />
      <BrandList />
      <OffersTable />
    </div>
  );
}
