import { useDispatch, useSelector } from 'react-redux';
import { searchBrands, searchOffers } from '../store';
import { Empty, ErrorMessage, Loader } from './Status';

export default function BrandList() {
  const dispatch = useDispatch();
  const { query, brands, selected } = useSelector((s) => s.search);

  if (brands.status === 'idle') return null;
  if (brands.status === 'loading') return <Loader text="Ищем производителей..." />;
  if (brands.status === 'error') {
    return <ErrorMessage text={brands.error} onRetry={() => dispatch(searchBrands(query))} />;
  }
  if (!brands.items.length) return <Empty text={`По артикулу «${query}» ничего не найдено.`} />;

  return (
    <section className="mb-4">
      <h2 className="h5">Производители ({brands.items.length})</h2>
      <div className="list-group">
        {brands.items.map((good) => {
          const active = selected?.brand === good.brand && selected?.number === good.number;
          return (
            <button
              key={good.goodsID}
              type="button"
              className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center${active ? ' active' : ''}`}
              // Номер берём из ответа API: он может отличаться от введённого (01089 и 01-89)
              onClick={() => dispatch(searchOffers({ number: good.number, brand: good.brand }))}
            >
              <span>
                <strong>{good.brand}</strong>
                <span className="ms-2">{good.name}</span>
              </span>
              <small className={active ? '' : 'text-secondary'}>{good.number}</small>
            </button>
          );
        })}
      </div>
    </section>
  );
}
