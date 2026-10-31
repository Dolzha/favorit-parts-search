import SearchInput from './components/SearchInput';
import BrandList from './components/BrandList';
import OffersTable from './components/OffersTable';

export default function App() {
  return (
    <div className="app container py-4" style={{ maxWidth: 1000 }}>
      <header className="app-header mb-4">
        <h1 className="h3 mb-1">Подбор автозапчастей и аналогов</h1>
        <p className="text-secondary mb-0">
          Введите артикул, выберите производителя и получите предложения со складов.
        </p>
      </header>
      <SearchInput />
      <BrandList />
      <OffersTable />
    </div>
  );
}
