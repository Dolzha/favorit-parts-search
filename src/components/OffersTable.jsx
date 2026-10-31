import { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { searchOffers } from '../store';
import { Empty, ErrorMessage, Loader } from './Status';

const PAGE = 50;
const money = new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' });
const date = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short' });

// Цену берём со складов: поле price у самого товара в документации помечено «НЕ ИСПОЛЬЗОВАТЬ».
// Одна строка на позицию: минимальная цена, общий остаток, склады раскрываются по клику.
function toPositions(items) {
  return items
    .map((item) => {
      const warehouses = [...(item.warehouses || [])].sort((a, b) => a.price - b.price);
      const stock = warehouses.reduce((sum, w) => sum + w.stock, 0);
      return { ...item, warehouses, stock, minPrice: warehouses[0]?.price ?? null };
    })
    .sort((a, b) => {
      if (a.isAnalogue !== b.isAnalogue) return a.isAnalogue ? 1 : -1; // искомая деталь первой
      if (!a.stock !== !b.stock) return a.stock ? -1 : 1; // без остатка в конец
      return (a.minPrice ?? Infinity) - (b.minPrice ?? Infinity);
    });
}

function Warehouses({ list }) {
  return (
    <table className="table table-sm mb-0">
      <thead>
        <tr>
          <th>Склад</th>
          <th className="text-end">Цена</th>
          <th className="text-end">Остаток</th>
          <th>Отгрузка</th>
        </tr>
      </thead>
      <tbody>
        {list.map((w) => (
          <tr key={w.id}>
            <td>{w.code || 'склад без кода'}</td>
            <td className="text-end text-nowrap">{money.format(w.price)}</td>
            <td className="text-end">{w.stock} шт.</td>
            <td className="text-nowrap">{date.format(new Date(w.shipmentDate))}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function OffersTable() {
  const dispatch = useDispatch();
  const { selected, offers } = useSelector((s) => s.search);
  const [inStockOnly, setInStockOnly] = useState(true);
  const [limit, setLimit] = useState(PAGE);
  const [open, setOpen] = useState(null);

  const positions = useMemo(() => toPositions(offers.items), [offers.items]);

  if (!selected || offers.status === 'idle') return null;
  if (offers.status === 'loading') return <Loader text="Загружаем аналоги и предложения..." />;
  if (offers.status === 'error') {
    return <ErrorMessage text={offers.error} onRetry={() => dispatch(searchOffers(selected))} />;
  }
  if (!positions.length) return <Empty text="Предложений и аналогов не найдено." />;

  const inStock = positions.filter((p) => p.stock > 0).length;
  // Искомую деталь показываем всегда, даже без остатка
  const visible = inStockOnly ? positions.filter((p) => p.stock > 0 || !p.isAnalogue) : positions;

  return (
    <section>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-2">
        <h2 className="h5 mb-0">
          {selected.brand} {selected.number}: позиций {positions.length}, в наличии {inStock}
        </h2>
        <div className="form-check form-switch mb-0">
          <input
            id="in-stock"
            className="form-check-input"
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => {
              setInStockOnly(e.target.checked);
              setLimit(PAGE);
            }}
          />
          <label htmlFor="in-stock" className="form-check-label">
            Только в наличии
          </label>
        </div>
      </div>

      {!visible.length ? (
        <Empty text="Нет позиций в наличии. Выключите фильтр, чтобы увидеть все." />
      ) : (
        // Список вместо таблицы: на телефоне строка складывается в карточку
        <div className="list-group offers mb-3">
          <div className="list-group-item offers-head bg-light fw-semibold d-none d-md-flex row g-0">
            <div className="col-md-7">Название / Производитель</div>
            <div className="col-md-2 text-end">Цена</div>
            <div className="col-md-1 text-end">Остаток</div>
          </div>
          {visible.slice(0, limit).map((p) => (
            <div key={p.goodsID} className="list-group-item">
              <div className="row g-2 align-items-center">
                <div className="col-12 col-md-7">
                  <div>{p.name}</div>
                  <small className="text-secondary part-meta">
                    {p.brand} · {p.number}
                    <span className={`badge ms-2 ${p.isAnalogue ? 'text-bg-secondary' : 'text-bg-primary'}`}>
                      {p.isAnalogue ? 'аналог' : 'искомая'}
                    </span>
                  </small>
                </div>
                <div className="col-5 col-md-2 text-md-end text-nowrap fw-semibold price">
                  {p.minPrice === null ? '' : `${p.warehouses.length > 1 ? 'от ' : ''}${money.format(p.minPrice)}`}
                </div>
                <div className="col-3 col-md-1 text-md-end text-nowrap stock">{p.stock ? `${p.stock} шт.` : 'нет'}</div>
                <div className="col-4 col-md-2 text-end">
                  {p.warehouses.length > 0 && (
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary text-nowrap"
                      onClick={() => setOpen(open === p.goodsID ? null : p.goodsID)}
                    >
                      Склады: {p.warehouses.length}
                    </button>
                  )}
                </div>
              </div>
              {open === p.goodsID && (
                <div className="table-responsive mt-2 bg-light rounded px-2">
                  <Warehouses list={p.warehouses} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {visible.length > limit && (
        <button type="button" className="btn btn-outline-primary w-100" onClick={() => setLimit(limit + PAGE)}>
          Показать ещё (осталось {visible.length - limit})
        </button>
      )}
    </section>
  );
}

// key сбрасывает фильтр, страницу и раскрытые склады при каждом новом запросе
export default function OffersSection() {
  const requestId = useSelector((s) => s.search.offers.requestId);
  return <OffersTable key={requestId} />;
}
