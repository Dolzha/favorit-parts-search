import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { reset, searchBrands } from '../store';

const DEBOUNCE_MS = 500;

export default function SearchInput() {
  const dispatch = useDispatch();
  const [value, setValue] = useState('');
  const pending = useRef(null);

  const search = (raw) => {
    const number = raw.trim();
    pending.current?.abort(); // отменяем предыдущий запрос, чтобы не тратить лимит
    if (!number) {
      dispatch(reset());
      return;
    }
    pending.current = dispatch(searchBrands(number));
  };

  // Запрос уходит сам по факту ввода: через полсекунды после последнего символа
  useEffect(() => {
    const timer = setTimeout(() => search(value), DEBOUNCE_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <form
      className="mb-4"
      onSubmit={(e) => {
        e.preventDefault();
        search(value);
      }}
    >
      <label htmlFor="number" className="form-label fw-semibold">
        Артикул детали
      </label>
      <input
        id="number"
        className="form-control form-control-lg"
        placeholder="Например, 7160500039S или 01089"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        autoComplete="off"
        autoFocus
      />
    </form>
  );
}
