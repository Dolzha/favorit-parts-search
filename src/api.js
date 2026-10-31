const API_URL = 'https://api.favorit-parts.ru/hs/hsprice/';
// Демо-ключ из документации API. Свой ключ можно передать через VITE_FAVORIT_KEY.
const API_KEY = import.meta.env.VITE_FAVORIT_KEY || '00000000-0000-0000-0000-000000000001';

const EMPTY_ID = '00000000-0000-0000-0000-000000000000';

// Если товар не найден, API возвращает массив с одной пустой структурой, а не пустой массив.
export const isEmptyGood = (good) => !good || good.goodsID === EMPTY_ID || !good.brand;

async function request(params, signal) {
  // URLSearchParams сам кодирует спецсимволы: «Meat & Doria» уйдёт как Meat+%26+Doria
  const query = new URLSearchParams({ key: API_KEY, ...params });

  let response;
  try {
    response = await fetch(`${API_URL}?${query}`, { signal });
  } catch (e) {
    if (e.name === 'AbortError') throw e;
    throw new Error('Нет связи с сервером. Проверьте интернет и попробуйте ещё раз.');
  }
  if (!response.ok) {
    throw new Error(`Сервер ответил ошибкой ${response.status}. Попробуйте позже.`);
  }

  const data = await response.json();
  // Ошибки API приходят полем error при статусе 200
  if (data.error) throw new Error(`Ошибка API: ${data.error}`);
  return Array.isArray(data.goods) ? data.goods : [];
}

// Этап 1: все производители, у которых есть деталь с таким номером
export async function fetchBrands(number, signal) {
  const goods = await request({ number }, signal);
  return goods.filter((g) => !isEmptyGood(g));
}

// Этап 2: сама деталь выбранного производителя и её аналоги
export async function fetchOffers(number, brand, signal) {
  const goods = await request({ number, brand, analogues: 'on' }, signal);
  const items = [];
  for (const good of goods) {
    if (!isEmptyGood(good)) items.push({ ...good, isAnalogue: false });
    for (const analogue of good.analogues || []) {
      if (!isEmptyGood(analogue)) items.push({ ...analogue, isAnalogue: true });
    }
  }
  return items;
}
